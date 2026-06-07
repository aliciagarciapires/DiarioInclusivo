import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, 
  TouchableOpacity,
  View
} from 'react-native';
import Footer from '../../components/Footer';

interface Atividade { 
  id: string;
  nome: string;
  inicio: Date;
  fim: Date;
}

export default function CriarRotina() {
  const router = useRouter(); 
  
  // ==========================================
  // ESTADOS DO FLUXO
  // ==========================================
  const [nomeRotina, setNomeRotina] = useState(''); 
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState<Atividade[]>([]); 
  const [idUsuarioLogado, setIdUsuarioLogado] = useState<number>(1); 
  
  // Controles de Modais nativos da tela
  const [modalVisivel, setModalVisivel] = useState(false); 
  const [showPicker, setShowPicker] = useState(false); 
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio'); 
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null); 

  const [criandoPersonalizada, setCriandoPersonalizada] = useState(false); 
  const [novoNomeAtividade, setNovoNomeAtividade] = useState(''); 

  // ==========================================
  // ESTADOS PARA O ALERTA CUSTOMIZADO (MODO CLARO)
  // ==========================================
  const [alertaVisivel, setAlertaVisivel] = useState(false);
  const [alertaTitulo, setAlertaTitulo] = useState('');
  const [alertaMensagem, setAlertaMensagem] = useState('');
  const [acaoAoFecharAlerta, setAcaoAoFecharAlerta] = useState<() => void>(() => {});

  // ==========================================
  // EFECT: BUSCA O ID DO USUÁRIO NO STORAGE
  // ==========================================
  useEffect(() => {
    const buscarUsuarioReal = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem('@id_usuario_logado');
        if (idSalvo !== null) {
          setIdUsuarioLogado(Number(idSalvo));
        }
      } catch (e) {
        console.error("Erro ao buscar ID do AsyncStorage", e);
      }
    };
    buscarUsuarioReal();
  }, []);

  const exibirAlertaClaro = (titulo: string, message: string, aoFechar?: () => void) => {
    setAlertaTitulo(titulo);
    setAlertaMensagem(message);
    setAcaoAoFecharAlerta(() => () => {
      setAlertaVisivel(false);
      if (aoFechar) aoFechar();
    });
    setAlertaVisivel(true);
  };

  const listaMaster = [
    { idAtividades: 1, nome: "Mapa mental" },
    { idAtividades: 2, nome: "Esquemas Ilustrados" },
    { idAtividades: 3, nome: "Guia de leitura" },
    { idAtividades: 4, nome: "Desenho explicativo" },
    { idAtividades: 5, nome: "Objeto de toque" },
    { idAtividades: 6, nome: "Pausa programada" }
  ];

  // ==========================================
  // LÓGICA DE ATIVIDADES E HORÁRIOS
  // ==========================================
  const adicionarDaMaster = (atividade: { idAtividades: number; nome: string }) => {
    const novaAtiv: Atividade = {
      id: atividade.idAtividades.toString(), // <-- Corrigido aqui de activity para atividade
      nome: atividade.nome,                  // <-- Corrigido aqui de activity para atividade
      inicio: new Date(),
      fim: new Date(),
    };
    setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
    setModalVisivel(false);
  };
  const salvarAtividadePersonalizada = async () => {
    if (novoNomeAtividade.trim() === '') {
      exibirAlertaClaro("Aviso", "Por favor, digite o nome da atividade personalizada.");
      return;
    }

    try {
      const URL_API = 'http://192.168.1.59:8080/AulaemPHP/DiarioInclusivo/src/app/criar_atividade.php';
      const resposta = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoNomeAtividade })
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        const novaAtiv: Atividade = {
          id: resultado.idAtividades.toString(), 
          nome: novoNomeAtividade,
          inicio: new Date(),
          fim: new Date(),
        };
        setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
        setNovoNomeAtividade('');
        setCriandoPersonalizada(false);
        setModalVisivel(false);
        exibirAlertaClaro("Sucesso", "Atividade salva com sucesso!");
      } else {
        exibirAlertaClaro("Erro", resultado.mensagem);
      }
    } catch (error: any) {
      exibirAlertaClaro("Erro de Conexão", "Não foi possível cadastrar a atividade.");
    }
  };

  const apagarAtividade = (idParaApagar: string) => {
    exibirAlertaClaro("Apagar Atividade", "A atividade selecionada foi removida da lista.", () => {
      const listaFiltrada = atividadesSelecionadas.filter(ativ => ativ.id !== idParaApagar);
      setAtividadesSelecionadas(listaFiltrada);
    });
  };

  const abrirRelogio = (index: number, modo: 'inicio' | 'fim') => {
    setIndexSendoEditado(index);
    setPickerMode(modo);
    setShowPicker(true);
  };

  const aoMudarHora = (event: any, selectedDate?: Date) => {
    if (selectedDate && indexSendoEditado !== null) {
      const novasAtividades = [...atividadesSelecionadas]; 
      if (pickerMode === 'inicio') {
        novasAtividades[indexSendoEditado].inicio = selectedDate; 
      } else {
        novasAtividades[indexSendoEditado].fim = selectedDate; 
      }
      setAtividadesSelecionadas(novasAtividades);
    }
  };

  const finalizarRotina = async () => {
    if (nomeRotina.trim() === '') {
      exibirAlertaClaro("Aviso", "Por favor, digite um nome para a rotina.");
      return;
    }
    if (atividadesSelecionadas.length === 0) {
      exibirAlertaClaro("Aviso", "Adicione pelo menos uma atividade antes de salvar.");
      return;
    }

    try {
      const atividadesFormatadas = atividadesSelecionadas.map(ativ => ({
        idAtividades: ativ.id, 
        horaInicial: ativ.inicio.toLocaleTimeString([], { hour12: false }), 
        horaFinal: ativ.fim.toLocaleTimeString([], { hour12: false })      
      }));

      const URL_SALVAR = 'http://192.168.1.59:8080/AulaemPHP/DiarioInclusivo/src/app/salvar_rotina.php';
      const resposta = await fetch(URL_SALVAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeRotina,
          idUsuario: idUsuarioLogado, 
          atividades: atividadesFormatadas
        }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        exibirAlertaClaro("Sucesso!", "Sua rotina e os horários foram salvos no banco de dados.", () => {
          router.push("/minhasRotinas" as Href);
        });
      } else {
        exibirAlertaClaro("Erro ao salvar", resultado.mensagem);
      }
    } catch (error: any) {
      exibirAlertaClaro("Erro de Processamento", "Erro ao salvar rotina. Verifique a conexão com o servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.containerSubtitulo}>
          <Text style={styles.subtitulo}>Criar rotina</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da rotina</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Aula de Português"
            placeholderTextColor="#0b8cbfd1"
            value={nomeRotina}
            onChangeText={setNomeRotina}
          />
        </View>

        <TouchableOpacity style={styles.botaoMaster} onPress={() => { setCriandoPersonalizada(false); setModalVisivel(true); }}>
          <Ionicons name="add-circle" size={24} color="#F5F2E8" />
          <Text style={styles.textoBotaoMaster}>Atividade</Text>
        </TouchableOpacity>

        {atividadesSelecionadas.map((item, index) => (
          <View key={item.id} style={styles.cardAtividade}>
            <View style={styles.topoCardAtividade}>
              <Text style={styles.nomeAtividade}>{item.nome}</Text>
              <TouchableOpacity onPress={() => apagarAtividade(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.containerHorarios}>
              <TouchableOpacity onPress={() => abrirRelogio(index, 'inicio')} style={styles.botaoHora}>
                <Text style={styles.textoHora}>Início: {item.inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => abrirRelogio(index, 'fim')} style={styles.botaoHora}>
                <Text style={styles.textoHora}>Fim: {item.fim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarRotina}>
        <Text style={styles.textoFinalizar}>Salvar Rotina</Text>
      </TouchableOpacity>

      {/* MODAL SELEÇÃO DE ATIVIDADES */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {criandoPersonalizada ? (
              <View style={styles.containerNovaAtividadeModal}>
                <Text style={styles.modalTitulo}>Nova Atividade</Text>
                <TextInput style={styles.input} placeholder="Nome da atividade..." placeholderTextColor="#0b8cbfd1" value={novoNomeAtividade} onChangeText={setNovoNomeAtividade} />
                <TouchableOpacity style={styles.botaoAdicionarSimulado} onPress={salvarAtividadePersonalizada}>
                  <Text style={styles.textoBotaoAdicionarSimulado}>Adicionar na Lista</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoVoltarModal} onPress={() => setCriandoPersonalizada(false)}>
                  <Text style={styles.textoBotaoVoltarModal}>Voltar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitulo}>Escolha as Atividades</Text>
                <FlatList data={listaMaster} keyExtractor={(item) => item.idAtividades.toString()} renderItem={({ item }) => (
                  <TouchableOpacity style={styles.itemMaster} onPress={() => adicionarDaMaster(item)}>
                    <View style={styles.containerMaster}>
                      <Ionicons name="add-circle-outline" size={22} color="#2F1CA6" />
                      <Text style={styles.textoItemMaster}>{item.nome}</Text>
                    </View>
                  </TouchableOpacity>
                )}/>
                <TouchableOpacity style={styles.botaoCriarNovaDentroDoModal} onPress={() => setCriandoPersonalizada(true)}>
                  <Text style={styles.textoBotaoCriarNova}>Criar Nova Atividade</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisivel(false)}>
                  <Text style={styles.textoBotaoFechar}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL CENTRALIZADO DO RELÓGIO (iOS) */}
      <Modal visible={showPicker && indexSendoEditado !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlayRelogio}>
          <View style={styles.modalContentRelogio}>
            <Text style={styles.modalTituloRelogio}>Selecionar Horário</Text>
            {showPicker && indexSendoEditado !== null && (
              <DateTimePicker
                value={pickerMode === 'inicio' ? atividadesSelecionadas[indexSendoEditado].inicio : atividadesSelecionadas[indexSendoEditado].fim}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={aoMudarHora}
                textColor="#2F1CA6"
              />
            )}
            <TouchableOpacity style={styles.botaoConfirmarHora} onPress={() => { setShowPicker(false); setIndexSendoEditado(null); }}>
              <Text style={styles.textoConfirmarHora}>Confirmar Horário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ALERTA CUSTOMIZADO CLARO */}
      <Modal visible={alertaVisivel} animationType="fade" transparent={true}>
        <View style={styles.alertaOverlay}>
          <View style={styles.alertaContentBox}>
            <View style={styles.alertaHeader}>
              <Ionicons name="information-circle-outline" size={28} color="#2F1CA6" />
              <Text style={styles.alertaTituloTexto}>{alertaTitulo}</Text>
            </View>
            <Text style={styles.alertaMensagemTexto}>{alertaMensagem}</Text>
            <TouchableOpacity style={styles.alertaBotaoOk} onPress={acaoAoFecharAlerta}>
              <Text style={styles.alertaBotaoTexto}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Diário</Text>
        </Pressable>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
          <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Rotina</Text>
        </Pressable>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2E8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  containerSubtitulo: { alignItems: 'center', flex: 1 },
  subtitulo: { marginTop: 5, color: "#0477BF", fontWeight: "bold", fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 130 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 18, color: '#2F1CA6', fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#F5F2E8', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#2F1CA6', color: '#2F1CA6' },
  botaoMaster: { backgroundColor: '#2F1CA6', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 30, justifyContent: 'center', marginBottom: 20 },
  textoBotaoMaster: { color: '#F5F2E8', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  cardAtividade: { backgroundColor: '#F5F2E8', padding: 15, borderRadius: 15, marginBottom: 10 },
  topoCardAtividade: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nomeAtividade: { fontSize: 18, fontWeight: 'bold', color: '#2F1CA6', marginBottom: 10 },
  containerHorarios: { flexDirection: 'row', justifyContent: 'space-between' },
  botaoHora: { backgroundColor: '#f8f6f2', padding: 8, borderRadius: 10, flex: 0.48, alignItems: 'center', borderWidth: 1, borderColor: '#2e1ca668' },
  textoHora: { color: '#2F1CA6', fontWeight: 'bold' },
  botaoFinalizar: { backgroundColor: '#2F1CA6', padding: 15, alignItems: 'center', margin: 20, borderRadius: 30, marginBottom: 100 },
  textoFinalizar: { color: '#F5F2E8', fontSize: 20, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', height: '65%', backgroundColor: '#F5F2E8', borderRadius: 20, padding: 20, justifyContent: 'space-between' },
  containerNovaAtividadeModal: { flex: 1, justifyContent: 'center' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2F1CA6', textAlign: 'center' },
  botaoAdicionarSimulado: { backgroundColor: '#2F1CA6', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  textoBotaoAdicionarSimulado: { color: '#F5F2E8', fontWeight: 'bold', fontSize: 16 },
  botaoVoltarModal: { marginTop: 15, alignItems: 'center' },
  textoBotaoVoltarModal: { color: '#2F1CA6', fontWeight: 'bold' },
  
  containerMaster: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemMaster: { paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  textoItemMaster: { fontSize: 18, color: '#2F1CA6', fontWeight: '500' },
  botaoCriarNovaDentroDoModal: { backgroundColor: '#7CBF17', padding: 12, borderRadius: 30, marginTop: 15, alignItems: 'center' },
  textoBotaoCriarNova: { color: '#F5F2E8', fontSize: 16, fontWeight: 'bold' },
  botaoFechar: { backgroundColor: '#F22222', padding: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  textoBotaoFechar: { color: '#F5F2E8', fontWeight: 'bold' },
  
  modalOverlayRelogio: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContentRelogio: { width: '80%', backgroundColor: '#F5F2E8', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#2F1CA6' },
  modalTituloRelogio: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2F1CA6' },
  botaoConfirmarHora: { backgroundColor: '#2F1CA6', paddingVertical: 12, borderRadius: 25, marginTop: 15, width: '100%', alignItems: 'center' },
  textoConfirmarHora: { color: '#F5F2E8', fontWeight: 'bold', fontSize: 16 },
  
  alertaOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  alertaContentBox: { width: '80%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  alertaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  alertaTituloTexto: { fontSize: 20, fontWeight: 'bold', color: '#2F1CA6' },
  alertaMensagemTexto: { fontSize: 16, color: '#4A4A4A', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  alertaBotaoOk: { backgroundColor: '#2F1CA6', width: '100%', paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  alertaBotaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 14, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
  iconeCustom: { width: 200, height: 70, resizeMode: "contain" },
  barraMenuGeral: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#F5F2E8", height: 90, paddingBottom: 30, borderTopWidth: 3, borderTopColor: "#F5F2E8", borderTopLeftRadius: 35, borderTopRightRadius: 35, position: "absolute", bottom: 0, left: 0, right: 0 }
});