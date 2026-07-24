import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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

interface Atividade { // Defino o que é atividade e as suas informações
  id: string;
  nome: string;
  inicio: Date;
  fim: Date;
}

export default function CriarRotina() {
  const router = useRouter(); // para poder trocar de tela depois
  
  // estados iniciais 
  const [nomeRotina, setNomeRotina] = useState(''); // começa sem nome
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState<Atividade[]>([]); // array começa vazio
  
  // estados de controle dos Modais e Pickers
  const [modalVisivel, setModalVisivel] = useState(false); // controla se o pop-up aparece na tela
  const [showPicker, setShowPicker] = useState(false); // controla SE o relógio do celular aparece ou não na tela
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio'); // controla O QUE vai aparecer na tela depois do relógio ser aberto
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null); // salva o indice numerico de qual atividade na lista o usuario esta alterando

  // estados novos: para a criação da atividade personalizada
  const [criandoPersonalizada, setCriandoPersonalizada] = useState(false); // modal da personalizada
  const [novoNomeAtividade, setNovoNomeAtividade] = useState(''); // guarda o texto digitado pelo usuário ao criar uma atividade do zero de forma manual.

  // lista de atividades pré-cadastradas
  const listaMaster = [
    { idAtividades: 1, nome: "Mapa mental" },
    { idAtividades: 2, nome: "Esquemas Ilustrados" },
    { idAtividades: 3, nome: "Guia de leitura" },
    { idAtividades: 4, nome: "Desenho explicativo" },
    { idAtividades: 5, nome: "Objeto de toque" },
    { idAtividades: 6, nome: "Pausa programada" }
  ];

  // adiciona uma atividade da lista pré-definida
  const adicionarDaMaster = (atividade: { idAtividades: number; nome: string }) => {
    const novaAtiv: Atividade = {
      id: atividade.idAtividades.toString(), // Salva o ID real do banco aqui!
      nome: atividade.nome,
      inicio: new Date(),
      fim: new Date(),
    };
    setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
    setModalVisivel(false);
  };

  // Salva a atividade que o usuário digitou manualmente
  const salvarAtividadePersonalizada = async () => {
    if (novoNomeAtividade.trim() === '') return; // Impede salvar em branco

    try {
      const URL_API = 'http://192.168.0.103/DiarioInclusivo/src/app/cadProf.php';

      const resposta = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novoNomeAtividade: novoNomeAtividade // Envia o texto pro PHP
        }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        const novaAtiv: Atividade = {
          id: resultado.idAtividades.toString(), // Usa o ID real do banco!
          nome: novoNomeAtividade,
          inicio: new Date(),
          fim: new Date(),
        };

        setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
        
        setNovoNomeAtividade('');
        setCriandoPersonalizada(false);
        setModalVisivel(false);
        
        Alert.alert("Sucesso", "Atividade salva!");
      } else {
        Alert.alert("Erro", resultado.mensagem);
      }

    } catch (error: any) {
      console.error("Erro detalhado:", error);
      Alert.alert("Erro de Rede/Conexão", error.message || String(error));
    }
  };

  const apagarAtividade = (idParaApagar: string) => {
    Alert.alert(
      "Apagar Atividade",
      "Tem certeza que deseja remover esta atividade da sua rotina?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive", 
          onPress: () => {
            const listaFiltrada = atividadesSelecionadas.filter(ativ => ativ.id !== idParaApagar);
            setAtividadesSelecionadas(listaFiltrada);
          }
        }
      ]
    );
  };

  // funções do DateTimePicker
  const abrirRelogio = (index: number, modo: 'inicio' | 'fim') => {
    setIndexSendoEditado(index);
    setPickerMode(modo);
    setShowPicker(true);
  };

  const aoMudarHora = (event: any, selectedDate?: Date) => {
    // Se for no Android, quando o usuário clica em "OK" ele gera o evento 'set' e podemos fechar
    if (event.type === 'set' && selectedDate && indexSendoEditado !== null) {
      const novasAtividades = [...atividadesSelecionadas]; 
      novasAtividades[indexSendoEditado][pickerMode] = selectedDate;
      setAtividadesSelecionadas(novasAtividades);
      setShowPicker(false);
      setIndexSendoEditado(null);
    } 
    // No iOS (spinner), o evento dispara a cada girada do rolinho. Atualizamos a hora na hora!
    else if (selectedDate && indexSendoEditado !== null) {
      const novasAtividades = [...atividadesSelecionadas]; 
      
      if (pickerMode === 'inicio') {
        novasAtividades[indexSendoEditado].inicio = selectedDate; 
      } else {
        novasAtividades[indexSendoEditado].fim = selectedDate; 
      }
      setAtividadesSelecionadas(novasAtividades);
    }
  };

  // FUNÇÃO ATUALIZADA: Envia os dados completos e corrige o erro 404/chave estrangeira
  const finalizarRotina = async () => {
    if (nomeRotina.trim() === '') {
      Alert.alert("Aviso", "Por favor, digite um nome para a rotina.");
      return;
    }
    if (atividadesSelecionadas.length === 0) {
      Alert.alert("Aviso", "Adicione pelo menos uma atividade na sua rotina antes de salvar.");
      return;
    }

    try {
      // PROVISÓRIO: Usuário simulado até sua amiga passar o código do Login
      const idUsuarioLogado = 1;

      const atividadesFormatadas = atividadesSelecionadas.map(ativ => ({
        idAtividades: ativ.id, 
        horaInicial: ativ.inicio.toLocaleTimeString([], { hour12: false }), 
        horaFinal: ativ.fim.toLocaleTimeString([], { hour12: false })      
      }));

      // Rota corrigida com o caminho completo de pastas do servidor
      const URL_SALVAR = 'http://192.168.0.103/DiarioInclusivo/src/app/salvar_rotina.php';

      const resposta = await fetch(URL_SALVAR, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeRotina: nomeRotina,
          idUsuario: idUsuarioLogado, // Passando o ID do usuário na requisição
          atividades: atividadesFormatadas
        }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        Alert.alert("Sucesso!", "Sua rotina completa e os horários foram salvos no banco de dados.");
        router.push("/minhasRotinas" as Href); 
      } else {
        Alert.alert("Erro ao salvar", resultado.mensagem);
      }

    } catch (error: any) {
      console.error("Erro detalhado ao salvar rotina:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor para salvar a rotina.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.subtitulo}>Criar rotina</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* input Nome da Rotina */}
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

        {/* botão para Abrir a Lista Master */}
        <TouchableOpacity 
          style={styles.botaoMaster} 
          onPress={() => {
            setCriandoPersonalizada(false); 
            setModalVisivel(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color="#F5F2E8" />
          <Text style={styles.textoBotaoMaster}>Atividade</Text>
        </TouchableOpacity>

        {atividadesSelecionadas.map((item, index) => (
          <View key={item.id} style={styles.cardAtividade}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.nomeAtividade}>{item.nome}</Text>
              
              {/* Botão da Lixeira */}
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

      {/* botão Finalizar */}
      <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarRotina}>
        <Text style={styles.textoFinalizar}>Salvar Rotina</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {criandoPersonalizada ? (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.modalTitulo}>Nova Atividade</Text>
                
                <TextInput 
                  style={styles.input}
                  placeholder="Digite o nome da atividade..."
                  placeholderTextColor="#0b8cbfd1"
                  value={novoNomeAtividade}
                  onChangeText={setNovoNomeAtividade}
                />
                
                <Text style={styles.avisoHorario}>
                  * O horário poderá ser ajustado assim que ela for adicionada à lista.
                </Text>

                <TouchableOpacity style={styles.botaoAdicionarSimulado} onPress={salvarAtividadePersonalizada}>
                  <Text style={{ color: '#F5F2E8', fontWeight: 'bold', fontSize: 16 }}>Adicionar na Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setCriandoPersonalizada(false)}>
                  <Text style={{ color: '#2F1CA6', fontWeight: 'bold' }}>Voltar para a lista</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitulo}>Escolha as Atividades</Text>
                <FlatList 
                  data={listaMaster}
                  keyExtractor={(item) => item.idAtividades.toString()} 
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.itemMaster} 
                      onPress={() => adicionarDaMaster(item)} 
                    >
                      <View style={styles.containerMaster}>
                        <Ionicons name="add-circle-outline" size={22} color="#2F1CA6" />
                        <View style={styles.conteudoItemMaster}>
                          <Text style={styles.textoItemMaster}>{item.nome}</Text> 
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity 
                  style={styles.botaoCriarNovaDentroDoModal} 
                  onPress={() => setCriandoPersonalizada(true)}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.textoBotaoCriarNova}>Criar Nova Atividade</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisivel(false)}>
                  <Text style={{ color: '#F5F2E8', fontWeight: 'bold' }}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>

     {/* MODAL EXCLUSIVO PARA O RELÓGIO (iOS e Android) */}
      <Modal visible={showPicker && indexSendoEditado !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlayRelogio}>
          <View style={styles.modalContentRelogio}>
            <Text style={styles.modalTituloRelogio}>
              Selecionar Horário de {pickerMode === 'inicio' ? 'Início' : 'Fim'}
            </Text>

            {showPicker && indexSendoEditado !== null && (
              <DateTimePicker
                value={
                  pickerMode === 'inicio'
                    ? atividadesSelecionadas[indexSendoEditado].inicio
                    : atividadesSelecionadas[indexSendoEditado].fim
                }
                mode="time"
                is24Hour={true}
                display="spinner" // Usa o rolinho clássico dentro do modal
                onChange={aoMudarHora}
                textColor="#2F1CA6" // Deixa os números roxos combinando com seu app
              />
            )}

            {/* Botão para o usuário confirmar que terminou de escolher a hora */}
            <TouchableOpacity 
              style={styles.botaoConfirmarHora} 
              onPress={() => setShowPicker(false)}
            >
              <Text style={{ color: '#F5F2E8', fontWeight: 'bold', fontSize: 16 }}>Confirmar Horário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#F5F2E8' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 20,
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2F1CA6' 
  },
  subtitulo: {
    marginTop: 5,
    color: "#0477BF",
    fontWeight: "bold",
    fontSize: 16
  },
  scrollContent: { 
    padding: 20 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 18, 
    color: '#2F1CA6', 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#F5F2E8', 
    borderRadius: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#2F1CA6',
    color: '#2F1CA6'
  },
  botaoMaster: { 
    backgroundColor: '#2F1CA6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 30, 
    justifyContent: 'center', 
    marginBottom: 20
  },
  textoBotaoMaster: { 
    color: '#F5F2E8', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 10
  },
  cardAtividade: { 
    backgroundColor: '#F5F2E8', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  nomeAtividade: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2F1CA6', 
    marginBottom: 10 
  },
  containerHorarios: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  botaoHora: { 
    backgroundColor: '#f8f6f2', 
    padding: 8, 
    borderRadius: 10, 
    flex: 0.48, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#2e1ca668' 
  },
  textoHora: { 
    color: '#2F1CA6', 
    fontWeight: 'bold' 
  },
  botaoFinalizar: { 
    backgroundColor: '#2F1CA6', 
    padding: 15, 
    alignItems: 'center', 
    margin: 20, 
    borderRadius: 30, 
    marginBottom: 80 
  },
  textoFinalizar: { 
    color: '#F5F2E8', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '85%', 
    height: '65%', 
    backgroundColor: '#F5F2E8', 
    borderRadius: 20, 
    padding: 20, 
    justifyContent: 'space-between' 
  },
  modalTitulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#2F1CA6', 
    textAlign: 'center' 
  },
  containerMaster: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10
  },
  itemMaster: { 
    paddingVertical: 15, 
    paddingHorizontal: 10,
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0' 
  },
  conteudoItemMaster: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  textoItemMaster: { 
    fontSize: 18, 
    color: '#2F1CA6',
    fontWeight: '500' 
  },
  botaoCriarNovaDentroDoModal: {
    backgroundColor: '#7CBF17', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: 15
  },
  textoBotaoCriarNova: { 
    color: '#F5F2E8', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 8 
  },
  botaoAdicionarSimulado: {
    backgroundColor: '#2F1CA6',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  avisoHorario: { 
    color: '#2e1ca665', 
    fontSize: 13, 
    fontStyle: 'italic', 
    marginTop: 8, 
    textAlign: 'center' 
  },
  botaoFechar: { 
    backgroundColor: '#F22222', 
    padding: 12, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginTop: 10 
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
    width: 80, // Largura e altura iguais
  height: 80,
  borderRadius: 15, // Metade do tamanho
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
  // Copie e cole estes estilos dentro do seu StyleSheet.create:
  modalOverlayRelogio: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', // Escurece o fundo do app
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContentRelogio: { 
    width: '80%', 
    backgroundColor: '#F5F2E8', // Usa o fundo bege padrão do seu app
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2F1CA6',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTituloRelogio: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#2F1CA6', 
    textAlign: 'center' 
  },
  botaoConfirmarHora: {
    backgroundColor: '#2F1CA6', // Roxo padrão do seu botão salvar
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    width: '100%',
    alignItems: 'center'
  },
});