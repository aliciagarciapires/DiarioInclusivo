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

// Obtém a largura da tela do dispositivo (útil para layouts responsivos)
const { width } = Dimensions.get("window");

// --- INTERFACES (TIPAGEM TYPESCRIPT) ---

// Formato de uma atividade vinculada a uma rotina existente
interface Atividade {
  id: number;
  nome: string;
  inicio: string;
  fim: string;
}

// Formato de uma rotina completa trazida do banco
interface Rotina {
  idRotina: number;
  nome: string;
  atividades: Atividade[];
}

// Formato de uma atividade vinda da lista mestre (banco geral)
interface AtividadeMaster {
  idAtividades: number;
  nome: string;
}

export default function VisualizarRotina() {
  // --- ESTADOS PRINCIPAIS ---
  const [rotinas, setRotinas] = useState<Rotina[]>([]); // Lista de rotinas do usuário
  const [carregando, setCarregando] = useState<boolean>(true); // Controle do ícone de carregamento (spinner)
  const [tarefasConcluidas, setTarefasConcluidas] = useState<string[]>([]); // Lista de IDs das tarefas marcadas como "feitas" (checkbox)

  const IP_SERVIDOR = "200.18.141.168" ;  

  // --- ESTADOS DO MODAL DE EDIÇÃO ---
  const [modalVisivel, setModalVisivel] = useState(false);
  const [abaModal, setAbaModal] = useState<'editar' | 'selecionar'>('editar'); // Alterna entre a tela de edição e a lista de adição de atividades

  const [rotinaEditandoId, setRotinaEditandoId] = useState<number | null>(null); // ID da rotina que está sendo editada
  const [nomeRotinaEdit, setNomeRotinaEdit] = useState(''); // Nome temporário no formulário de edição
  const [atividadesEdit, setAtividadesEdit] = useState<{ id: string; nome: string; inicio: Date; fim: Date }[]>([]); // Lista temporária das atividades da rotina em edição

  const [listaMaster, setListaMaster] = useState<AtividadeMaster[]>([]); // Atividades disponíveis para adicionar

  // --- ESTADOS DO RELÓGIO (SELETOR DE HORA) ---
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio');
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null);

  // --- FUNÇÕES DE REQUISIÇÃO (API) ---

  // Busca as rotinas do usuário cadastradas no banco PHP
  const carregarRotinasDoBanco = async () => {
    try {
      setCarregando(true);
      // TODO: Substituir ID estático '1' pelo usuário autenticado na aplicação
      const idUsuario = 1;
      // Adiciona timestamp (`new Date().getTime()`) ao final da URL para evitar problemas de cache do navegador/dispositivo
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

  // Busca a lista geral de atividades cadastradas no sistema
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

  // `useFocusEffect` recarrega as rotinas e atividades toda vez que a tela ganha foco na navegação
  useFocusEffect(
    useCallback(() => {
      carregarRotinasDoBanco();
      carregarAtividadesMaster();
    }, [])
  );

  // Exclui uma rotina enviando o ID via POST para o servidor PHP
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
                carregarRotinasDoBanco(); // Atualiza a lista na tela
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

  // --- LÓGICA DE EDIÇÃO ---

  // Prepara os dados da rotina clicada e abre o Modal de edição
  const abrirModalEditar = (rotina: Rotina) => {
    setRotinaEditandoId(rotina.idRotina);
    setNomeRotinaEdit(rotina.nome || '');

    const hoje = new Date();
    // Converte a string de hora (ex: "08:30:00") vinda do banco em objetos `Date` válidos do JS
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

  // Adiciona uma nova atividade da lista mestre na rotina em edição
  const adicionarAtividadeEdit = (atividade: AtividadeMaster) => {
    const novaAtiv = {
      id: String(atividade.idAtividades),
      nome: atividade.nome,
      inicio: new Date(),
      fim: new Date(),
    };
    setAtividadesEdit(prev => [...prev, novaAtiv]);
    setAbaModal('editar'); // Voltar para a aba de edição após selecionar
  };

  // Remove uma atividade da lista temporária de edição
  const removerAtividadeEdit = (index: number) => {
    setAtividadesEdit(prev => prev.filter((_, i) => i !== index));
  };

  // Prepara o relógio para editar inicio/fim de um item específico
  const abrirRelogio = (index: number, modo: 'inicio' | 'fim') => {
    setIndexSendoEditado(index);
    setPickerMode(modo);
    setShowPicker(true);
  };

  // Atualiza o horário na lista de edição mantendo a imutabilidade
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

  // Converte o objeto Date em formato de string "HH:MM:SS" aceito pelo PHP/Banco
  const formatarHoraString = (data: Date) => {
    if (!(data instanceof Date) || isNaN(data.getTime())) return "00:00:00";
    const h = String(data.getHours()).padStart(2, '0');
    const m = String(data.getMinutes()).padStart(2, '0');
    return `${h}:${m}:00`;
  };

  // Envia as alterações da rotina via POST (`updateRotina.php`)
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

      const payload = {
        idRotina: rotinaEditandoId,
        nomeRotina: nomeRotinaEdit,
        idUsuario: 1, // TODO: Tornar idUsuario dinâmico no futuro
        atividades: atividadesFormatadas,
      };

      console.log("Enviando para o PHP:", JSON.stringify(payload));

      const URL_UPDATE = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/updateRotina.php`;

      const resposta = await fetch(URL_UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textoResposta = await resposta.text();
      console.log("Resposta bruta do PHP:", textoResposta);

      let resultado;
      try {
        resultado = JSON.parse(textoResposta);
      } catch (e) {
        Alert.alert("Erro no Servidor", "O PHP retornou uma resposta inválida. Verifique o console.");
        return;
      }

      if (resultado.sucesso) {
        Alert.alert("Sucesso", "Rotina atualizada com sucesso!");
        setModalVisivel(false);
        carregarRotinasDoBanco();
      } else {
        Alert.alert("Erro ao Salvar", resultado.mensagem || "Não foi possível atualizar.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  // Marca/Desmarca uma atividade individualmente da rotina atual (efeito visual de checkbox)
  const alternarCheck = (idUnico: string) => {
    if (tarefasConcluidas.includes(idUnico)) {
      setTarefasConcluidas(tarefasConcluidas.filter((item) => item !== idUnico));
    } else {
      setTarefasConcluidas([...tarefasConcluidas, idUnico]);
    }
  };

  return (
    <View style={styles.container}>
      {/* CABAÇALHO */}
      <View style={styles.areaCriarTopo}>
        <Text style={styles.subtitulo}>Minhas rotinas</Text>
      </View>

      {/* RENDERIZAÇÃO CONDICIONAL: Mostra o indicador de carregamento enquanto o banco responde */}
      {carregando ? (
        <ActivityIndicator size="large" color="#2F1CA6" style={{ marginTop: 40 }} />
      ) : (
        /* LISTA PRINCIPAL DAS ROTINAS */
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
              {/* Cabeçalho do Card da Rotina */}
              <View style={styles.headerCard}>
                <Text style={styles.nomeRotina}>{rotinaItem.nome}</Text>

                <View style={styles.acoesContainer}>
                  {/* Botão Editar */}
                  <TouchableOpacity
                    onPress={() => abrirModalEditar(rotinaItem)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#0B8CBF" />
                  </TouchableOpacity>

                  {/* Botão Excluir */}
                  <TouchableOpacity
                    onPress={() => confirmarExclusaoRotina(rotinaItem.idRotina)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Lista interna de Atividades da Rotina */}
              {rotinaItem.atividades && rotinaItem.atividades.length > 0 ? (
                rotinaItem.atividades.map((atividade, idx) => {
                  // Cria uma chave única composta por ID da rotina + ID da atividade + Índice
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
                        {/* Caixa do Checkbox */}
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

      {/* BOTÃO FLUTUANTE PARA CRIAR NOVA ROTINA */}
      <View style={styles.botaoAdicionarContainer}>
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => router.push("/criarRotina")}
        >
          <Text style={styles.adicionar}>Adicionar nova rotina +</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL PRINCIPAL (EDIÇÃO E SELEÇÃO DE ATIVIDADES) --- */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true} onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* ABA 1: FORMULÁRIO DE EDIÇÃO */}
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

                  {/* Botão que troca para a aba de seleção de atividades mestre */}
                  <TouchableOpacity style={styles.botaoAddAtivModal} onPress={() => setAbaModal('selecionar')}>
                    <Ionicons name="add-circle" size={20} color="#F5F2E8" />
                    <Text style={styles.textoAddAtivModal}>Adicionar nova atividade</Text>
                  </TouchableOpacity>

                  {/* Renderiza as atividades em edição */}
                  {atividadesEdit.map((item, idx) => (
                    <View key={idx} style={styles.cardAtivEdit}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={styles.nomeAtivEdit}>{item.nome}</Text>
                        <TouchableOpacity onPress={() => removerAtividadeEdit(idx)}>
                          <Ionicons name="trash-outline" size={20} color="#FF4444" />
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {/* Botões do Relógio para Inicio/Fim */}
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

                {/* Botões do rodapé do Modal */}
                <TouchableOpacity style={styles.btnSalvarModal} onPress={salvarEdicaoRotina}>
                  <Text style={styles.txtSalvarModal}>Salvar Alterações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnFecharModal} onPress={() => setModalVisivel(false)}>
                  <Text style={{ color: '#F5F2E8', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ABA 2: SELEÇÃO DE ATIVIDADE MESTRE */
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

            {/* SELETOR NATIVO DE HORA (COM TEMA CLARO FORÇADO) */}
            {showPicker && indexSendoEditado !== null && (
              <DateTimePicker
                value={
                  pickerMode === 'inicio'
                    ? atividadesEdit[indexSendoEditado]?.inicio || new Date()
                    : atividadesEdit[indexSendoEditado]?.fim || new Date()
                }
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'android' ? 'spinner' : 'spinner'}
                themeVariant="light"
                onChange={aoMudarHora}
              />
            )}

          </View>
        </View>
      </Modal>

      {/* --- RODAPÉ E BARRA DE NAVEGAÇÃO --- */}
      <Footer children={undefined} />

    
          {/* --- NAVEGAÇÃO E RODAPÉ --- */}
          <Footer children={undefined} />
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
    color: "#fff7f7",
    fontStyle: "italic",
    marginVertical: 6,
  },
  botaoAdicionarContainer: {
    position: "absolute",
    bottom: 85,
    marginTop: -50,
    alignSelf: "center",
    zIndex: 10,
  },
  botaoAdicionar: {
    width: 260,
    height: 45,
    marginBottom: 30,
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
  
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
  },
  tabLabel: {
    fontSize: 14,                  
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 4,
  },
  iconeCustom: {
    width: 80,
    height: 80,
    borderRadius: 15,
    resizeMode: "cover",      
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
    marginTop: 20   
  },
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
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2F1CA6',
  },
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
