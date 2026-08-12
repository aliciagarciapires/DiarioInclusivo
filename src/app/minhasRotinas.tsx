import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");

interface Atividade {
  id: number;
  nome: string;
  inicio: string;
  fim: string;
}

interface Rotina {
  idRotina: number;
  nome: string;
  atividades: Atividade[];
}

interface AtividadeMaster {
  idAtividades: number;
  nome: string;
}

export default function VisualizarRotina() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [tarefasConcluidas, setTarefasConcluidas] = useState<string[]>([]);

  const IP_SERVIDOR = "192.168.1.59";

  // Controle de Modal e Abas ('editar' ou 'selecionar')
  const [modalVisivel, setModalVisivel] = useState(false);
  const [abaModal, setAbaModal] = useState<'editar' | 'selecionar'>('editar');

  // Dados em edição
  const [rotinaEditandoId, setRotinaEditandoId] = useState<number | null>(null);
  const [nomeRotinaEdit, setNomeRotinaEdit] = useState('');
  const [atividadesEdit, setAtividadesEdit] = useState<{ id: string; nome: string; inicio: Date; fim: Date }[]>([]);

  // Lista master de atividades
  const [listaMaster, setListaMaster] = useState<AtividadeMaster[]>([]);

  // Relógio
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio');
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null);

  // Buscar lista de rotinas do usuário
  const carregarRotinasDoBanco = async () => {
    try {
      setCarregando(true);
      const idUsuario = 1;
      const URL_API = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/listar_rotina.php?idUsuario=${idUsuario}&t=${new Date().getTime()}`;

      const resposta = await fetch(URL_API);
      const resultado = await resposta.json();

      if (resultado.sucesso && Array.isArray(resultado.dados)) {
        setRotinas(resultado.dados);
      } else {
        setRotinas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar rotinas:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Buscar atividades master cadastradadas
  const carregarAtividadesMaster = async () => {
    try {
      const URL_MASTER = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/buscarAtividades.php?t=${new Date().getTime()}`;
      const resposta = await fetch(URL_MASTER);
      const dados = await resposta.json();

      if (Array.isArray(dados)) {
        setListaMaster(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar atividades master:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarRotinasDoBanco();
      carregarAtividadesMaster();
    }, [])
  );

  // Deletar Rotina
  const confirmarExclusaoRotina = (idRotina: number) => {
    Alert.alert(
      "Excluir Rotina",
      "Tem certeza que deseja apagar esta rotina?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await fetch(
                `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/deletar_rotina.php`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idRotina: idRotina }),
                }
              );

              const resultado = await resposta.json();

              if (resultado.sucesso) {
                Alert.alert("Sucesso", "Rotina excluída com sucesso!");
                carregarRotinasDoBanco();
              } else {
                Alert.alert("Erro", resultado.mensagem || "Erro ao excluir rotina.");
              }
            } catch (error) {
              Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
            }
          },
        },
      ]
    );
  };

  // Abrir Modal de Edição
  const abrirModalEditar = (rotina: Rotina) => {
    setRotinaEditandoId(rotina.idRotina);
    setNomeRotinaEdit(rotina.nome || '');

    const hoje = new Date();
    const formatoAtividades = (rotina.atividades || []).map((ativ) => {
      const strInicio = ativ.inicio ? String(ativ.inicio) : "08:00";
      const strFim = ativ.fim ? String(ativ.fim) : "09:00";

      const [hIni, mIni] = strInicio.split(":");
      const [hFim, mFim] = strFim.split(":");

      const dInicio = new Date(hoje);
      dInicio.setHours(parseInt(hIni || "8", 10), parseInt(mIni || "0", 10), 0);

      const dFim = new Date(hoje);
      dFim.setHours(parseInt(hFim || "9", 10), parseInt(mFim || "0", 10), 0);

      return {
        id: ativ.id ? String(ativ.id) : "1",
        nome: ativ.nome || "Atividade",
        inicio: dInicio,
        fim: dFim,
      };
    });

    setAtividadesEdit(formatoAtividades);
    setAbaModal('editar');
    setModalVisivel(true);
  };

  // Adicionar atividade
  const adicionarAtividadeEdit = (atividade: AtividadeMaster) => {
    const novaAtiv = {
      id: String(atividade.idAtividades),
      nome: atividade.nome,
      inicio: new Date(),
      fim: new Date(),
    };
    setAtividadesEdit(prev => [...prev, novaAtiv]);
    setAbaModal('editar');
  };

  // Remover atividade
  const removerAtividadeEdit = (index: number) => {
    setAtividadesEdit(prev => prev.filter((_, i) => i !== index));
  };

  // Funções do relógio
  const abrirRelogio = (index: number, modo: 'inicio' | 'fim') => {
    setIndexSendoEditado(index);
    setPickerMode(modo);
    setShowPicker(true);
  };

  const aoMudarHora = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate && indexSendoEditado !== null) {
      setAtividadesEdit(prev => {
        const novas = [...prev];
        novas[indexSendoEditado][pickerMode] = selectedDate;
        return novas;
      });
    }
  };

  const formatarHoraString = (data: Date) => {
    if (!(data instanceof Date) || isNaN(data.getTime())) return "00:00:00";
    const h = String(data.getHours()).padStart(2, '0');
    const m = String(data.getMinutes()).padStart(2, '0');
    return `${h}:${m}:00`;
  };

  // Salvar Alterações no Banco
  const salvarEdicaoRotina = async () => {
    if (!nomeRotinaEdit.trim()) {
      Alert.alert("Aviso", "Digite o nome da rotina.");
      return;
    }

    if (atividadesEdit.length === 0) {
      Alert.alert("Aviso", "Adicione ao menos uma atividade na rotina.");
      return;
    }

    try {
      const atividadesFormatadas = atividadesEdit.map((ativ) => ({
        idAtividades: parseInt(ativ.id, 10) || 1,
        horaInicial: formatarHoraString(ativ.inicio),
        horaFinal: formatarHoraString(ativ.fim),
      }));

      const URL_UPDATE = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/updateRotina.php`;

      const resposta = await fetch(URL_UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idRotina: rotinaEditandoId,
          nomeRotina: nomeRotinaEdit,
          idUsuario: 1,
          atividades: atividadesFormatadas,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        Alert.alert("Sucesso", "Rotina atualizada com sucesso!");
        setModalVisivel(false);
        carregarRotinasDoBanco();
      } else {
        Alert.alert("Erro ao Salvar", resultado.mensagem || "Não foi possível atualizar.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  const alternarCheck = (idUnico: string) => {
    if (tarefasConcluidas.includes(idUnico)) {
      setTarefasConcluidas(tarefasConcluidas.filter((item) => item !== idUnico));
    } else {
      setTarefasConcluidas([...tarefasConcluidas, idUnico]);
    }
  };

  return (
    <View style={styles.container}>
      {/* TOPO */}
      <View style={styles.areaCriarTopo}>
        <Text style={styles.subtitulo}>Minhas rotinas</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#2F1CA6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rotinas}
          keyExtractor={(item) => item.idRotina.toString()}
          style={styles.lista}
          contentContainerStyle={{ paddingBottom: 150 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>
              Nenhuma rotina encontrada. Crie uma nova rotina abaixo!
            </Text>
          }
          renderItem={({ item: rotinaItem }) => (
            <View style={styles.cardRotina}>
              {/* CABEÇALHO DO CARD COM LÁPIS E LIXEIRA */}
              <View style={styles.headerCard}>
                <Text style={styles.nomeRotina}>{rotinaItem.nome}</Text>

                <View style={styles.acoesContainer}>
                  <TouchableOpacity
                    onPress={() => abrirModalEditar(rotinaItem)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#0B8CBF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmarExclusaoRotina(rotinaItem.idRotina)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ATIVIDADES */}
              {rotinaItem.atividades && rotinaItem.atividades.length > 0 ? (
                rotinaItem.atividades.map((atividade, idx) => {
                  const idUnicoTask = `${rotinaItem.idRotina}-${atividade.id}-${idx}`;
                  const isMarcada = tarefasConcluidas.includes(idUnicoTask);

                  return (
                    <TouchableOpacity
                      key={idUnicoTask}
                      style={styles.itemContainer}
                      onPress={() => alternarCheck(idUnicoTask)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.blocoEsquerdo}>
                        <View style={styles.checkbox}>
                          {isMarcada && (
                            <Ionicons name="checkmark" size={14} color="#2F1CA6" />
                          )}
                        </View>
                        <Text style={[styles.textoNome, isMarcada && styles.textoRiscado]}>
                          {atividade.nome}
                        </Text>
                      </View>

                      <Text style={[styles.textoHora, isMarcada && styles.textoRiscado]}>
                        {atividade.inicio ? String(atividade.inicio).substring(0, 5) : "00:00"} -{" "}
                        {atividade.fim ? String(atividade.fim).substring(0, 5) : "00:00"}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.semAtividades}>Sem atividades nesta rotina.</Text>
              )}
            </View>
          )}
        />
      )}

      {/* BOTÃO ADICIONAR NOVA ROTINA */}
      <View style={styles.botaoAdicionarContainer}>
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => router.push("/criarRotina")}
        >
          <Text style={styles.adicionar}>Adicionar nova rotina +</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL EDIÇÃO E SELEÇÃO */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true} onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {abaModal === 'editar' ? (
              <>
                <Text style={styles.modalTitulo}>Editar Rotina</Text>

                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 10 }}>
                  <Text style={styles.labelModal}>Nome da Rotina</Text>
                  <TextInput
                    style={styles.inputModal}
                    value={nomeRotinaEdit}
                    onChangeText={setNomeRotinaEdit}
                  />

                  <TouchableOpacity style={styles.botaoAddAtivModal} onPress={() => setAbaModal('selecionar')}>
                    <Ionicons name="add-circle" size={20} color="#F5F2E8" />
                    <Text style={styles.textoAddAtivModal}>Adicionar nova atividade</Text>
                  </TouchableOpacity>

                  {atividadesEdit.map((item, idx) => (
                    <View key={idx} style={styles.cardAtivEdit}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={styles.nomeAtivEdit}>{item.nome}</Text>
                        <TouchableOpacity onPress={() => removerAtividadeEdit(idx)}>
                          <Ionicons name="trash-outline" size={20} color="#FF4444" />
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => abrirRelogio(idx, 'inicio')} style={styles.btnHoraModal}>
                          <Text style={styles.txtHoraModal}>
                            Início: {item.inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => abrirRelogio(idx, 'fim')} style={styles.btnHoraModal}>
                          <Text style={styles.txtHoraModal}>
                            Fim: {item.fim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.btnSalvarModal} onPress={salvarEdicaoRotina}>
                  <Text style={styles.txtSalvarModal}>Salvar Alterações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnFecharModal} onPress={() => setModalVisivel(false)}>
                  <Text style={{ color: '#F5F2E8', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitulo}>Escolha uma Atividade</Text>

                <FlatList
                  data={listaMaster}
                  keyExtractor={(item) => String(item.idAtividades)}
                  ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: '#2F1CA6', marginTop: 20 }}>
                      Nenhuma atividade encontrada no banco.
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemMasterModal} onPress={() => adicionarAtividadeEdit(item)}>
                      <Ionicons name="add-circle-outline" size={22} color="#2F1CA6" />
                      <Text style={styles.txtMasterModal}>{item.nome}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity style={styles.btnFecharModal} onPress={() => setAbaModal('editar')}>
                  <Text style={{ color: '#F5F2E8', fontWeight: 'bold' }}>Voltar</Text>
                </TouchableOpacity>
              </>
            )}

            {showPicker && indexSendoEditado !== null && (
              <DateTimePicker
                value={
                  pickerMode === 'inicio'
                    ? atividadesEdit[indexSendoEditado]?.inicio || new Date()
                    : atividadesEdit[indexSendoEditado]?.fim || new Date()
                }
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={aoMudarHora}
              />
            )}

          </View>
        </View>
      </Modal>

      {/* FOOTER NATIVO */}
      <Footer children={undefined} />

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
          <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
          <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Diário</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
          <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Rotina</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
          <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  areaCriarTopo: {
    alignItems: "center",
    marginBottom: 15,
  },
  subtitulo: {
    color: "#0477BF",
    fontWeight: "bold",
    fontSize: 20,
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
    backgroundColor: "#F5F2E8",
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
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
    marginBottom: 10,
  },
  nomeRotina: {
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
  },
  acoesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconeAcao: {
    padding: 6,
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  blocoEsquerdo: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#2F1CA6",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textoNome: {
    fontSize: 16,
    color: "#0B8CBF",
    fontWeight: "500",
  },
  textoHora: {
    fontSize: 14,
    color: "#0B8CBF",
  },
  textoRiscado: {
    color: "#7CBF17",
    textDecorationLine: "line-through",
  },
  semAtividades: {
    fontSize: 14,
    color: "#888888",
    fontStyle: "italic",
    marginVertical: 6,
  },
  botaoAdicionarContainer: {
    position: "absolute",
    bottom: 95,
    alignSelf: "center",
    zIndex: 10,
  },
  botaoAdicionar: {
    width: 260,
    height: 45,
    backgroundColor: "#2F1CA6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  adicionar: {
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 16,
  },
  barraMenuGeral: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 85,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 2,
  },
  iconeCustom: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#F5F2E8',
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2F1CA6',
    textAlign: 'center',
  },
  labelModal: {
    fontSize: 16,
    color: '#2F1CA6',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inputModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2F1CA6',
    color: '#2F1CA6',
    marginBottom: 15,
  },
  botaoAddAtivModal: {
    backgroundColor: '#2F1CA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  textoAddAtivModal: {
    color: '#F5F2E8',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardAtivEdit: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nomeAtivEdit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F1CA6',
  },
  btnHoraModal: {
    backgroundColor: '#EBEBEB',
    padding: 8,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F1CA6',
  },
  /* COR DA HORA AJUSTADA PARA PRETO ESCURO SÓLIDO */
  txtHoraModal: {
    fontSize: 13,
    color: '#000000',
    fontWeight: 'bold',
  },
  btnSalvarModal: {
    backgroundColor: '#2F1CA6',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  txtSalvarModal: {
    color: '#F5F2E8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnFecharModal: {
    backgroundColor: '#FF4444',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  itemMasterModal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  txtMasterModal: {
    fontSize: 16,
    color: '#2F1CA6',
    marginLeft: 10,
  },
});