import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");
const IP_SERVIDOR = "192.168.0.107";

interface DiarioItem {
  idDiario: number;
  data: string;
  complemento: string;
  avaliacao_1_5: number | null;
  atividade: string;
  atividades: AtividadeHistorico[];
}

interface AtividadeHistorico {
  idAtividades?: number | null;
  nome: string;
  avaliacao: number | null;
}

interface AtividadeOpcao {
  id: number;
  nome: string;
}

export default function HistoricoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ idDiscente?: string | string[] }>();
  const idDiscenteSelecionado = Array.isArray(params.idDiscente)
    ? Number(params.idDiscente[0])
    : Number(params.idDiscente ?? 0);
  const [historico, setHistorico] = useState<DiarioItem[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Estados de Edição
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [atividadeEdit, setAtividadeEdit] = useState<string>("");
  const [complementoEdit, setComplementoEdit] = useState<string>("");
  const [dataEdit, setDataEdit] = useState<string>("");
  const [avaliacaoEdit, setAvaliacaoEdit] = useState<string>("");
  const [atividadesEdit, setAtividadesEdit] = useState<Array<{ idAtividades: number | null; nome: string; avaliacao: string }>>([]);

  // Lista de atividades vindas do banco para seleção
  const [listaAtividades, setListaAtividades] = useState<AtividadeOpcao[]>([]);

  useFocusEffect(
    useCallback(() => {
      const carregarTipoUsuario = async () => {
        try {
          let tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
          if (tipoLogado) {
            setTipoUsuario(String(tipoLogado).trim());
          }
        } catch (error) {
          console.error("Erro ao carregar tipo de usuário:", error);
        }
      };
      carregarTipoUsuario();
      buscarHistorico();
      buscarAtividadesDoBanco();
    }, [idDiscenteSelecionado])
  );

  const buscarHistorico = async () => {
    try {
      if (!idDiscenteSelecionado || Number.isNaN(idDiscenteSelecionado)) {
        setHistorico([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      const url = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/listar_diario.php?idDiscente=${idDiscenteSelecionado}`;
      
      const resposta = await fetch(url);
      const textoPuro = await resposta.text();
      const json = JSON.parse(textoPuro);

      const dados = Array.isArray(json) ? json : (json.dados || []);
      const registrosAgrupados = (Array.isArray(dados) ? dados : []).reduce(
        (grupos: Record<string, DiarioItem>, registro: any) => {
          const idDiario = Number(registro.idDiario);
          const chave = String(idDiario);
          const nomeAtividade = registro.atividade && registro.atividade !== "Atividade não vinculada"
            ? String(registro.atividade)
            : null;
          const avaliacao = registro.avaliacao_1_5 !== null && registro.avaliacao_1_5 !== undefined
            ? Number(registro.avaliacao_1_5)
            : null;

          if (!grupos[chave]) {
            grupos[chave] = {
              idDiario,
              data: String(registro.data || ""),
              complemento: String(registro.complemento || ""),
              avaliacao_1_5: registro.avaliacao_1_5 ?? null,
              atividade: nomeAtividade || "Atividade não vinculada",
              atividades: nomeAtividade ? [{ idAtividades: registro.idAtividades ?? null, nome: nomeAtividade, avaliacao }] : [],
            };
          } else if (
            nomeAtividade &&
            !grupos[chave].atividades.some((atividade) => atividade.nome === nomeAtividade)
          ) {
            grupos[chave].atividades.push({ idAtividades: registro.idAtividades ?? null, nome: nomeAtividade, avaliacao });
            grupos[chave].atividade = grupos[chave].atividades.map((atividade) => atividade.nome).join(" + ");
          }

          return grupos;
        },
        {}
      );

      setHistorico(Object.values(registrosAgrupados));
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
    }
  };

  const buscarAtividadesDoBanco = async () => {
    try {
      const url = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/listar_atividades.php`;
      const resposta = await fetch(url);
      const textoPuro = await resposta.text();
      const json = JSON.parse(textoPuro);

      const dados = Array.isArray(json) ? json : (json.dados || []);
      setListaAtividades(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao buscar opções de atividades:", error);
    }
  };

  const confirmarExclusao = (idDiario: number) => {
    Alert.alert(
      "Excluir diário",
      "Este diário possui atividades vinculadas. Todas elas serão excluídas juntas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir diário e atividades",
          style: "destructive",
          onPress: () => excluirHistorico(idDiario),
        },
      ]
    );
  };

  const excluirHistorico = async (idDiario: number) => {
    try {
      const response = await fetch(`http://${IP_SERVIDOR}/DiarioInclusivo/src/app/deleteHistorico.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idDiario }),
      });

      const textoPuro = await response.text();
      const json = JSON.parse(textoPuro);

      if (json.sucesso || json.success) {
        Alert.alert("Sucesso", json.mensagem || "Exclusão realizada!");
        buscarHistorico();
      } else {
        Alert.alert("Erro", json.mensagem || "Não foi possível excluir.");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const iniciarEdicao = (item: DiarioItem) => {
    const formatarDataEdicao = (dataStr: string) => {
      if (!dataStr) return "";
      if (dataStr.includes("/")) return dataStr;
      const partes = dataStr.split("-");
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataStr;
    };

    const atividadesParaEditar = (item.atividades || []).length > 0
      ? (item.atividades || []).map((atividade) => ({
          idAtividades: atividade.idAtividades ?? null,
          nome: atividade.nome || "",
          avaliacao: atividade.avaliacao !== null && atividade.avaliacao !== undefined ? String(atividade.avaliacao) : "5",
        }))
      : [{ idAtividades: null, nome: item.atividade || "", avaliacao: item.avaliacao_1_5 !== null && item.avaliacao_1_5 !== undefined ? String(item.avaliacao_1_5) : "5" }];

    setIdEditando(item.idDiario);
    setAtividadeEdit(atividadesParaEditar[0]?.nome || "");
    setComplementoEdit(item.complemento);
    setDataEdit(formatarDataEdicao(item.data));
    setAvaliacaoEdit(atividadesParaEditar[0]?.avaliacao || "5");
    setAtividadesEdit(atividadesParaEditar);
  };

  const getAtividadeKey = (atividade: any, fallbackIndex: number) => {
    if (!atividade) return `atividade-${fallbackIndex}`;
    return atividade.idAtividades ?? atividade.id ?? `${atividade.nome ?? 'atividade'}-${fallbackIndex}`;
  };

  const atualizarAtividadeEditada = (index: number, campo: "nome" | "avaliacao", valor: string) => {
    setAtividadesEdit((prev) =>
      prev.map((atividade, idx) =>
        idx === index
          ? { ...atividade, [campo]: valor }
          : atividade
      )
    );
  };

  const aplicarMascaraData = (text: string) => {
    const limpo = text.replace(/\D/g, "");
    let formatado = limpo;

    if (limpo.length > 2 && limpo.length <= 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    } else if (limpo.length > 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}/${limpo.slice(4, 8)}`;
    }

    setDataEdit(formatado);
  };

  const validarDataNascimento = (dataString: string): { valida: boolean; mensagem?: string } => {
    if (dataString.length < 10) {
      return { valida: false, mensagem: 'Digite a data completa no formato DD/MM/AAAA.' };
    }

    const partes = dataString.split('/');
    if (partes.length !== 3) {
      return { valida: false, mensagem: 'Formato de data inválido.' };
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (mes < 1 || mes > 12) {
      return { valida: false, mensagem: 'Mês inválido.' };
    }

    const dataObjeto = new Date(ano, mes - 1, dia);

    if (
      dataObjeto.getFullYear() !== ano ||
      dataObjeto.getMonth() !== mes - 1 ||
      dataObjeto.getDate() !== dia
    ) {
      return { valida: false, mensagem: 'Data inexistente (verifique o dia, mês e se o ano é bissexto).' };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataObjeto > hoje) {
      return { valida: false, mensagem: 'A data não pode ser no futuro.' };
    }

    if (ano < 1900) {
      return { valida: false, mensagem: 'Ano inválido.' };
    }

    return { valida: true };
  };

  const salvarEdicao = async (idDiario: any) => {
    if (!idDiario) {
      Alert.alert("Erro", "ID do diário não encontrado.");
      return;
    }

    const atividadesParaSalvar = (atividadesEdit.length > 0 ? atividadesEdit : [{ idAtividades: null, nome: atividadeEdit, avaliacao: avaliacaoEdit || "5" }])
      .map((atividade) => {
        const nome = atividade.nome?.trim();
        if (!nome) return null;

        const idAtividadeEncontrada = atividade.idAtividades ?? listaAtividades.find((item) => item.nome.trim().toLowerCase() === nome.toLowerCase())?.id ?? null;
        const avaliacaoNumero = Number(atividade.avaliacao || 5);

        return {
          idAtividades: idAtividadeEncontrada,
          nome,
          avaliacao_1_5: Number.isFinite(avaliacaoNumero) ? avaliacaoNumero : 5,
        };
      })
      .filter(Boolean);

    if (atividadesParaSalvar.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos uma atividade para salvar.");
      return;
    }

    if (!dataEdit.trim()) {
      Alert.alert("Erro", "O campo data é obrigatório.");
      return;
    }

    const validacaoData = validarDataNascimento(dataEdit);
    if (!validacaoData.valida) {
      Alert.alert('Data Inválida', validacaoData.mensagem);
      return;
    }

    const partes = dataEdit.split('/');
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    const dataFormatada = `${dia}/${mes}/${ano}`;

    try {
      setCarregando(true);

      const corpoRequisicao = {
        id: idDiario,
        idDiario: idDiario,
        data: dataFormatada,
        complemento: complementoEdit || "",
        atividades: atividadesParaSalvar,
      };

      const response = await fetch(`http://${IP_SERVIDOR}/DiarioInclusivo/src/app/update_diario.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpoRequisicao),
      });

      const textoResposta = await response.text();
      console.log("RESPOSTA PURA DO PHP:", textoResposta);

      let json;
      
      try {
        json = JSON.parse(textoResposta);
      } catch (e) {
        console.error("Resposta inválida do PHP:", textoResposta);
        Alert.alert("Erro de Resposta do PHP", textoResposta.substring(0, 300));
        return;
      }

      if (json.success || json.sucesso) {
        Alert.alert("Sucesso", "Registro atualizado com sucesso!");
        setIdEditando(null); 
        buscarHistorico();     
      } else {
        Alert.alert("Erro", json.message || json.mensagem || "Não foi possível atualizar o registro.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Falha de conexão ao salvar alterações.");
    } finally {
      setCarregando(false);
    }
  };

  const renderItem = ({ item }: { item: DiarioItem }) => {
    const editando = idEditando === item.idDiario;

    const formatarData = (dataStr: string) => {
      if (!dataStr) return "Data não informada";
      if (dataStr.includes("/")) return dataStr;
      const partes = dataStr.split("-");
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataStr;
    };

    return (
      <View style={styles.cardRotina}>
        {editando ? (
          <View>
            <Text style={styles.textoNomeLabel}>Data:</Text>
            <TextInput 
              style={styles.input} 
              value={dataEdit} 
              onChangeText={aplicarMascaraData} 
              placeholder="DD/MM/AAAA" 
              placeholderTextColor="#0b8cbf7f"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={[styles.textoNomeLabel, { marginTop: 8 }]}>Atividades do diário:</Text>
            {atividadesEdit.map((atividade, index) => {
              const blocoKey = `atividade-edit-${index}-${getAtividadeKey(atividade, index)}`;

              return (
                <View key={blocoKey} style={{ marginBottom: 16, padding: 12, borderWidth: 1, borderColor: '#D8E9F3', borderRadius: 10, backgroundColor: '#F8FCFF' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#2F1CA6', marginBottom: 8 }}>Atividade {index + 1}</Text>

                  <Text style={styles.textoNomeLabel}>Nome:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                    {listaAtividades.map((atv, atvIndex) => {
                      const nomeAtividade = atv.nome || (atv as any).descricao || String(atv.id ?? atvIndex);
                      const selecionada = atividade.nome === nomeAtividade;

                      return (
                        <TouchableOpacity
                          key={`${blocoKey}-nome-${getAtividadeKey(atv, atvIndex)}`}
                          style={[
                            styles.opcaoAtividade,
                            selecionada && styles.opcaoAtividadeSelecionada
                          ]}
                          onPress={() => atualizarAtividadeEditada(index, 'nome', nomeAtividade)}
                        >
                          <Text style={[styles.textoOpcaoAtividade, selecionada && styles.textoOpcaoSelecionada]}>
                            {nomeAtividade}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={{ fontSize: 13, color: '#0477BF', marginBottom: 8, fontStyle: 'italic' }}>
                    Selecionada: {atividade.nome || "Nenhuma"}
                  </Text>

                  <Text style={[styles.textoNomeLabel, { marginTop: 8 }]}>Avaliação (1 a 5):</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                    {[1, 2, 3, 4, 5].map((num) => {
                      const selecionado = atividade.avaliacao === num.toString();
                      return (
                        <TouchableOpacity
                          key={`${blocoKey}-nota-${num}`}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: selecionado ? '#2F1CA6' : '#E8F4F8',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: selecionado ? '#2F1CA6' : '#D0D0D0'
                          }}
                          onPress={() => atualizarAtividadeEditada(index, 'avaliacao', num.toString())}
                        >
                          <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: selecionado ? '#FFFFFF' : '#333333'
                          }}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <Text style={[styles.textoNomeLabel, { marginTop: 8 }]}>Complemento:</Text>
            <TextInput 
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]} 
              value={complementoEdit} 
              onChangeText={setComplementoEdit} 
              multiline 
              placeholder="Complemento" 
            />

            <View style={styles.botoesRow}>
              <TouchableOpacity style={styles.botaoSalvar} onPress={() => salvarEdicao(item.idDiario)}>
                <Text style={styles.textoBotaoSalvar}>Salvar Alterações</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoSalvar, { backgroundColor: "#8E8E93", marginLeft: 8 }]} onPress={() => setIdEditando(null)}>
                <Text style={styles.textoBotaoSalvar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.headerCard}>
              <View style={styles.listaAtividadesHistorico}>
                <Text style={styles.rotuloAtividades}>Atividades deste diário:</Text>
                {item.atividades.length > 0 ? (
                  item.atividades.map((atividade, index) => (
                    <View key={`${item.idDiario}-${index}`} style={styles.atividadeHistoricoLinha}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nomeRotina}>
                        • {atividade.nome}
                      </Text>
                      <View style={styles.badgeAvaliacaoAtividade}>
                        <Text style={styles.textoBadgeRotulo}>Avaliação: </Text>
                        <Text style={styles.textoBadgeValor}>
                          {atividade.avaliacao !== null ? `${atividade.avaliacao}/5` : "N/A"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nomeRotina}>
                    • Atividade não vinculada
                  </Text>
                )}
              </View>
              <View style={styles.acoesHeader}>
                <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.botaoAcao}>
                  <Ionicons name="create-outline" size={22} color="#2F1CA6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmarExclusao(item.idDiario)} style={styles.botaoAcao}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.linhaInfoTopo}>
              <Text style={styles.textoDataMaior}>{formatarData(item.data)}</Text>
            </View>

            <View style={[styles.itemContainer, { marginTop: 12 }]}>
              <View style={styles.blocoEsquerdo}>
                <Ionicons name="document-text-outline" size={20} color="#0B8CBF" style={{ marginRight: 8 }} />
                <Text style={styles.textoNomeLabel}>Complemento:</Text>
              </View>
            </View>
            <Text style={styles.textoConteudo}>
              {item.complemento && item.complemento.trim() !== "" 
                ? item.complemento 
                : "Nenhum complemento registrado."}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {carregando ? (
        <ActivityIndicator size="large" color="#2F1CA6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item, index) => `${item.idDiario}-${index}`}
          style={styles.lista}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>
              Nenhum registro encontrado.
            </Text>
          }
        />
      )}

      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discente.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>

            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  lista: {
    width: width - 40,
  },
  textoVazio: {
    textAlign: "center",
    color: "#0B8CBF",
    marginTop: 40,
    fontSize: 16,
  },
  cardRotina: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
    marginBottom: 6,
  },
  acoesHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  listaAtividadesHistorico: {
    flex: 1,
    paddingRight: 8,
  },
  atividadeHistoricoLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badgeAvaliacaoAtividade: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  rotuloAtividades: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
  },
  botaoAcao: {
    padding: 4,
    marginLeft: 6,
  },
  nomeRotina: {
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
    flexShrink: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  blocoEsquerdo: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoNomeLabel: {
    fontSize: 15,
    color: "#2F1CA6",
    fontWeight: "bold",
  },
  textoConteudo: {
    fontSize: 15,
    color: "#0B8CBF",
    marginTop: 4,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    marginTop: 4,
    backgroundColor: "#FFF",
    color: "#333",
  },
  containerSelecaoAtividades: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  opcaoAtividade: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F4F8',
    borderWidth: 1,
    borderColor: '#0B8CBF',
    marginRight: 8,
  },
  opcaoAtividadeSelecionada: {
    backgroundColor: '#2F1CA6',
    borderColor: '#2F1CA6',
  },
  textoOpcaoAtividade: {
    fontSize: 14,
    color: '#0B8CBF',
    fontWeight: '600',
  },
  textoOpcaoSelecionada: {
    color: '#FFFFFF',
  },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
    flex: 1,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  botoesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoMenu: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1, 
    height: 30 
  },
  tabLabel: { 
    fontSize: 12, 
    fontWeight: "500", 
    color: "#2F1CA6", 
    marginTop: 4 
  },
  iconeCustom: { 
    width: 80, 
    height: 80, 
    borderRadius: 15, 
    resizeMode: "cover" 
  },
  barraMenuGeral: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 90,
    paddingBottom: 30,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
  },
  textoDataMaior: {
    fontSize: 16,
    color: "#0477BF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  linhaInfoTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
  },
  badgeAvaliacao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeRotulo: {
    fontSize: 13,
    color: "#0477BF",
    fontWeight: "600",
  },
  textoBadgeValor: {
    fontSize: 15,
    color: "#2F1CA6",
    fontWeight: "bold",
  },
});