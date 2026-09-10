import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

interface Responsavel {
  id: number;
  nome: string;
}

type Discente = {
  id?: number | string;
  nome: string;
  data_nascimento: string;
  grau_de_suporte: string;
  nomes_responsaveis?: string;
  ids_responsaveis?: number[];
};

export default function InfoDiscente() {
  const { id } = useLocalSearchParams();
  const [discente, setDiscente] = useState<Discente | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para armazenar o tipo de usuÃ¡rio logado (RenderizaÃ§Ã£o da Navbar)
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Estados de ediÃ§Ã£o do discente
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [grau, setGrau] = useState("Selecione o grau de suporte");

  // Estados dos ResponsÃ¡veis
  const [editandoResponsaveis, setEditandoResponsaveis] = useState(false);
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<Responsavel[]>([]);
  const [listaResponsaveis, setListaResponsaveis] = useState<Responsavel[]>([]);
  const [busca, setBusca] = useState("");

  // Estado do Dropdown de Grau
  const [abertoGrau, setAbertoGrau] = useState(false);

  // Verifica o tipo de usuÃ¡rio toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      const carregarTipoUsuario = async () => {
        try {
          let tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
          if (tipoLogado) {
            setTipoUsuario(String(tipoLogado).trim());
          }
        } catch (error) {
          console.error("Erro ao carregar tipo de usuÃ¡rio:", error);
        }
      };
      carregarTipoUsuario();
    }, [])
  );

  // FunÃ§Ã£o auxiliar para recuperar o ID do usuÃ¡rio logado
  const obterIdUsuarioLogado = async () => {
    let idUser = await AsyncStorage.getItem("idUsuario");
    if (!idUser) {
      idUser = await AsyncStorage.getItem("id");
    }
    return idUser;
  };

  useEffect(() => {
    if (id) carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Busca todos os responsÃ¡veis disponÃ­veis na base

      const resResp = await fetch("http://192.168.0.107/DiarioInclusivo/src/app/buscar_responsaveis.php");
  

      const dadosResp = await resResp.json();
      const listaCompleta: Responsavel[] = Array.isArray(dadosResp) ? dadosResp : [];
      setListaResponsaveis(listaCompleta);

      // 2. Busca dados do discente

      const response = await fetch(`http://192.168.0.107/DiarioInclusivo/src/app/getDiscente.php?id=${id}`);

      const json = await response.json();

      if (json.success) {
        const d = json.dados;
        setDiscente(d);
        setNome(d.nome || "");
        
        // Formata a data recebida do banco (YYYY-MM-DD para DD/MM/AAAA)
        if (d.data_nascimento && d.data_nascimento.includes("-")) {
          const partes = d.data_nascimento.split("-");
          if (partes.length === 3) {
            setDataNasc(`${partes[2]}/${partes[1]}/${partes[0]}`);
          } else {
            setDataNasc(d.data_nascimento);
          }
        } else {
          setDataNasc(d.data_nascimento || "");
        }

        setGrau(d.grau_de_suporte ? String(d.grau_de_suporte) : "Selecione o grau de suporte");

        // Associa os IDs jÃ¡ cadastrados aos objetos da lista de responsÃ¡veis
        if (d.ids_responsaveis && Array.isArray(d.ids_responsaveis)) {
          const vinculados = listaCompleta.filter((r) => d.ids_responsaveis.includes(Number(r.id)));
          setResponsaveisSelecionados(vinculados);
        }
      } else {
        Alert.alert("Erro", json.message || "Discente nÃ£o encontrado.");
      }
    } catch (error) {
      Alert.alert("Erro", "NÃ£o foi possÃ­vel conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Aplica mÃ¡scara de data DD/MM/AAAA
  const aplicarMascaraData = (text: string) => {
    const limpo = text.replace(/\D/g, "");
    let formatado = limpo;

    if (limpo.length > 2 && limpo.length <= 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    } else if (limpo.length > 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}/${limpo.slice(4, 8)}`;
    }

    setDataNasc(formatado);
  };

  // ValidaÃ§Ã£o de data real
  const validarDataNascimento = (dataString: string): { valida: boolean; mensagem?: string } => {
    if (dataString.length < 10) {
      return { valida: false, mensagem: 'Digite a data completa no formato DD/MM/AAAA.' };
    }

    const partes = dataString.split('/');
    if (partes.length !== 3) {
      return { valida: false, mensagem: 'Formato de data invÃ¡lido.' };
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (mes < 1 || mes > 12) {
      return { valida: false, mensagem: 'MÃªs invÃ¡lido.' };
    }

    const dataObjeto = new Date(ano, mes - 1, dia);

    if (
      dataObjeto.getFullYear() !== ano ||
      dataObjeto.getMonth() !== mes - 1 ||
      dataObjeto.getDate() !== dia
    ) {
      return { valida: false, mensagem: 'Data inexistente (verifique o dia, mÃªs e se o ano Ã© bissexto).' };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataObjeto > hoje) {
      return { valida: false, mensagem: 'A data de nascimento nÃ£o pode ser no futuro.' };
    }

    if (ano < 1900) {
      return { valida: false, mensagem: 'Ano de nascimento invÃ¡lido.' };
    }

    return { valida: true };
  };

  // Alterna seleÃ§Ã£o do responsÃ¡vel
  const alternarSelecao = (item: Responsavel) => {
    const jaSelecionado = responsaveisSelecionados.some((r) => r.id === item.id);
    if (jaSelecionado) {
      setResponsaveisSelecionados(responsaveisSelecionados.filter((r) => r.id !== item.id));
    } else {
      setResponsaveisSelecionados([...responsaveisSelecionados, item]);
    }
  };

  // Filtro de busca dos responsÃ¡veis
  const listaSegura = Array.isArray(listaResponsaveis) ? listaResponsaveis : [];
  const filtrados = listaSegura.filter((r) => {
    if (!busca || busca.trim() === "") return true;
    return r.nome ? r.nome.toLowerCase().includes(busca.toLowerCase()) : false;
  });

  // Salvar alteraÃ§Ãµes
  const salvarAlteracoes = async () => {
    if (!nome.trim() || !dataNasc.trim() || grau === "Selecione o grau de suporte") {
      Alert.alert("Erro", "Por favor, preencha todos os campos corretamente.");
      return;
    }

    const validacaoData = validarDataNascimento(dataNasc);
    if (!validacaoData.valida) {
      Alert.alert('Data InvÃ¡lida', validacaoData.mensagem);
      return;
    }

    if (responsaveisSelecionados.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um responsÃ¡vel.");
      return;
    }

    const partes = dataNasc.split('/');
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    const dataFormatada = `${ano}-${mes}-${dia}`;

    const idsResponsaveis = responsaveisSelecionados.map((r) => r.id);

    try {
      setLoading(true);

      const idUsuarioLogado = await obterIdUsuarioLogado();

      if (!idUsuarioLogado) {
        Alert.alert("Erro de AutenticaÃ§Ã£o", "SessÃ£o expirada ou nÃ£o encontrada. FaÃ§a login novamente.");
        setLoading(false);
        return;
      }


      const response = await fetch("http://192.168.0.107/DiarioInclusivo/src/app/updateDiscente.php", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          nome: nome,
          dataNasc: dataFormatada,
          grau: grau,
          idUsuarioLogado: idUsuarioLogado,
          idsResponsaveis: idsResponsaveis,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setEditando(false);
        setEditandoResponsaveis(false);
        setAbertoGrau(false);
        carregarDados();
      } else {
        Alert.alert("Erro", json.message || "NÃ£o foi possÃ­vel atualizar.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha de conexÃ£o ao salvar alteraÃ§Ãµes.");
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar ExclusÃ£o",
      "Tem certeza que deseja excluir este discente? Esta aÃ§Ã£o nÃ£o pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: deletarDiscente },
      ]
    );
  };

  const deletarDiscente = async () => {
    try {
      setLoading(true);

      const idUsuarioLogado = await obterIdUsuarioLogado();

      const response = await fetch(

        `http://192.168.0.107/DiarioInclusivo/src/app/deleteDiscente.php?id=${id}&idUsuario=${idUsuarioLogado}`,

        { method: "DELETE" }
      );
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message || "Discente excluÃ­do com sucesso!", [
          { text: "OK", onPress: () => router.push("/discente") },
        ]);
      } else {
        Alert.alert("Erro", json.message || "Erro ao excluir discente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar ao servidor para excluir discente.");
    } finally {
      setLoading(false);
    }
  };

  const nomesEscritos = responsaveisSelecionados.length > 0
    ? responsaveisSelecionados.map((r) => r.nome).join(", ")
    : discente?.nomes_responsaveis || "Nenhum responsÃ¡vel vinculado";

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2F1CA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.itens}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        </View>

        {discente ? (
          <View style={styles.card}>
            {/* CabeÃ§alho */}
            <View style={styles.cardHeader}>
              {editando ? (
                <TextInput
                  style={[styles.input, styles.inputTitulo]}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Nome do discente"
                />
              ) : (
                <Text style={styles.titulo}>{discente.nome}</Text>
              )}

              <View style={styles.acoesHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setEditando(!editando);
                    setEditandoResponsaveis(false);
                    setAbertoGrau(false);
                  }}
                  style={styles.botaoAcao}
                >
                  <Ionicons
                    name={editando ? "close-circle-outline" : "create-outline"}
                    size={24}
                    color="#2F1CA6"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={confirmarExclusao} style={styles.botaoAcao}>
                  <Ionicons name="trash-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* RESPONSÃVEIS */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>ResponsÃ¡vel(is):</Text>

              {editando ? (
                <>
                  <View style={styles.containerTags}>
                    {responsaveisSelecionados.map((item) => (
                      <View key={item.id} style={styles.tag}>
                        <Text style={styles.tagTexto}>{item.nome}</Text>
                        <Pressable onPress={() => alternarSelecao(item)}>
                          <Text style={styles.tagFechar}> âœ•</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  {editandoResponsaveis ? (
                    <Input
                      placeholder="Digite para buscar responsÃ¡vel..."
                      placeholderTextColor="#0b8cbfd1"
                      value={busca}
                      onChangeText={setBusca}
                      autoFocus
                    />
                  ) : (
                    <Pressable style={styles.select} onPress={() => setEditandoResponsaveis(true)}>
                      <Text style={styles.selectTexto}>
                        + Adicionar ou remover responsÃ¡veis
                      </Text>
                    </Pressable>
                  )}

                  {editandoResponsaveis && (
                    <View style={styles.lista}>
                      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                        {filtrados.length > 0 ? (
                          filtrados.map((item) => {
                            const selecionado = responsaveisSelecionados.some((r) => r.id === item.id);
                            return (
                              <Pressable
                                key={item.id}
                                style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                                onPress={() => alternarSelecao(item)}
                              >
                                <Text
                                  style={{
                                    color: selecionado ? "#FFF" : "#2F1CA6",
                                    fontWeight: selecionado ? "bold" : "normal",
                                  }}
                                >
                                  {selecionado ? `âœ“ ${item.nome}` : item.nome}
                                </Text>
                              </Pressable>
                            );
                          })
                        ) : (
                          <Text style={{ padding: 15, color: "#0b8cbf5b" }}>Nenhum responsÃ¡vel encontrado</Text>
                        )}
                      </ScrollView>
                      <Pressable
                        style={styles.botaoConcluir}
                        onPress={() => {
                          setEditandoResponsaveis(false);
                          setBusca("");
                        }}
                      >
                        <Text style={styles.textoConcluir}>Concluir SeleÃ§Ã£o</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.value}>{nomesEscritos}</Text>
              )}
            </View>

            {/* DATA DE NASCIMENTO */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Data de Nascimento:</Text>
              {editando ? (
                <TextInput
                  style={styles.input}
                  value={dataNasc}
                  onChangeText={aplicarMascaraData}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#0b8cbf7f"
                  keyboardType="numeric"
                  maxLength={10}
                />
              ) : (
                <Text style={styles.value}>{dataNasc || discente.data_nascimento}</Text>
              )}
            </View>

            {/* GRAU DE SUPORTE */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Grau de Suporte:</Text>
              {editando ? (
                <>
                  <Pressable style={styles.select} onPress={() => setAbertoGrau(!abertoGrau)}>
                    <Text style={styles.selectTexto}>
                      {grau === "1" ? "Grau 1" : grau === "2" ? "Grau 2" : grau === "3" ? "Grau 3" : "Selecione o grau de suporte"}
                    </Text>
                  </Pressable>

                  {abertoGrau && (
                    <View style={styles.lista}>
                      {["1", "2", "3"].map((g) => (
                        <Pressable
                          key={g}
                          style={styles.opcao}
                          onPress={() => {
                            setGrau(g);
                            setAbertoGrau(false);
                          }}
                        >
                          <Text style={{ color: "#2F1CA6" }}>Grau {g}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.value}>Grau {discente.grau_de_suporte}</Text>
              )}
            </View>

            {/* BOTÃƒO SALVAR */}
            {editando && (
              <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAlteracoes}>
                <Text style={styles.textoBotaoSalvar}>Salvar AlteraÃ§Ãµes</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.erro}>Discente nÃ£o encontrado.</Text>
        )}
      </ScrollView>

      {/* --- RODAPÃ‰ E MENU GERAL CONDICIONAL --- */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          /* BARRA PARA O TIPO 2 (ADM) - Destaque no botÃ£o Discentes */
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discenteD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
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
          /* BARRA PARA QUALQUER OUTRO TIPO (PROFESSOR) - Destaque em InÃ­cio */
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
              <Image source={require("../../assets/images/homeD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>InÃ­cio</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>DiÃ¡rio</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2E8", paddingHorizontal: 20, paddingTop: 5 },
  card: { backgroundColor: "#F5F2E8", borderRadius: 20, padding: 25, elevation: 5, borderWidth: 1, borderColor: "#2F1CA6", marginTop: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#2F1CA6", flex: 1, textAlign: "left" },
  acoesHeader: { flexDirection: "row", alignItems: "center" },
  botaoAcao: { padding: 5, marginLeft: 8 },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 15, borderRadius: 1 },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#0b8cbf", marginTop: 2, fontWeight: "500" },
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
  inputTitulo: { flex: 1, marginRight: 10, fontSize: 18, fontWeight: "bold" },
  select: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 50, padding: 12, backgroundColor: "#F5F2E8", marginTop: 8 },
  selectTexto: { color: "#0b8cbfd1", fontSize: 14, textAlign: "center", fontWeight: "600" },
  lista: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 10, backgroundColor: "#F5F2E8", marginTop: 5, overflow: "hidden" },
  opcao: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#2e1ca667" },
  opcaoSelecionada: { backgroundColor: "#2F1CA6" },
  containerTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 5, marginBottom: 5 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#2F1CA6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  tagTexto: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  tagFechar: { color: "#FF6B6B", fontWeight: "bold", fontSize: 14 },
  botaoConcluir: { backgroundColor: "#0B8CBF", padding: 12, alignItems: "center" },
  textoConcluir: { color: "#FFF", fontWeight: "bold" },
  botaoSalvar: { backgroundColor: "#2F1CA6", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 15 },
  textoBotaoSalvar: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "flex-start", width: "100%", marginTop: -13 },
  logo: { width: 100, height: 100, alignSelf: "center" },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 12, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
  iconeCustom: { width: 80, height: 80, borderRadius: 15, resizeMode: "cover" },
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
});
