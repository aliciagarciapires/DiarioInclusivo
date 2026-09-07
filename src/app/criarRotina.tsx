import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

// Define o formato de uma atividade que já foi adicionada à rotina atual
interface Atividade {
  id: string;
  nome: string;
  inicio: Date;
  fim: Date;
}

// Define o formato de uma atividade vinda da lista geral do banco de dados
interface AtividadeMaster {
  idAtividades: number;
  nome: string;
}

export default function CriarRotina() {
  const router = useRouter(); 
  
  // IP do seu servidor
  const IP_SERVIDOR = "192.168.0.107";

  // --- ESTADOS DA TELA ---
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  
  // Estado para Cadastro de Nova Atividade pelo ADM
  const [novoNomeAtividade, setNovoNomeAtividade] = useState('');
  const [cadastrandoAtividade, setCadastrandoAtividade] = useState(false);

  const [nome, setNome] = useState(''); // Guarda o nome digitado para a rotina
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState<Atividade[]>([]); // Lista de atividades montadas na rotina
  
  // Lista de atividades pré-cadastradas trazidas do banco de dados
  const [listaMaster, setListaMaster] = useState<AtividadeMaster[]>([]);

  // Controle de visibilidade dos Modais e do Relógio
  const [modalVisivel, setModalVisivel] = useState(false); // Modal de escolher atividade
  const [showPicker, setShowPicker] = useState(false); // Modal do relógio
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio'); // Define se o relógio ajusta 'inicio' ou 'fim'
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null); // Posição (índice) da atividade na lista que está tendo o horário alterado

  // Verifica o tipo de usuário toda vez que a tela entra em foco
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
    }, [])
  );

  // useEffect roda apenas UMA VEZ quando a tela é montada ([])
  // Busca todas as atividades cadastradas no banco para preencher a lista do modal
  useEffect(() => {
    async function carregarAtividadesBanco() {
      try {
        const resposta = await fetch(`http://${IP_SERVIDOR}/DiarioInclusivo/src/app/buscarAtividades.php`);
        const dados = await resposta.json();
        if (dados && Array.isArray(dados)) {
          setListaMaster(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de atividades:", error);
      }
    }
    carregarAtividadesBanco();
  }, []);

  // Adiciona a atividade selecionada no modal para a lista da rotina
  const adicionarDaMaster = (atividade: AtividadeMaster) => {
    const novaAtiv: Atividade = {
      id: atividade.idAtividades.toString(),
      nome: atividade.nome,
      inicio: new Date(), // Inicia por padrão com a hora atual
      fim: new Date(),    // Inicia por padrão com a hora atual
    };
    // Adiciona o novo item mantendo os itens anteriores (...atividadesSelecionadas)
    setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
    setModalVisivel(false); // Fecha o modal após selecionar
  };

  // Remove um item da lista local da rotina
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
            // Filtra o array mantendo apenas quem tem ID diferente do clicado
            const listaFiltrada = atividadesSelecionadas.filter(ativ => ativ.id !== idParaApagar);
            setAtividadesSelecionadas(listaFiltrada);
          }
        }
      ]
    );
  };

  // Prepara e abre o seletor de relógio para um item específico da lista
  const abrirRelogio = (index: number, modo: 'inicio' | 'fim') => {
    setIndexSendoEditado(index);
    setPickerMode(modo);
    setShowPicker(true);
  };

  // Atualiza a hora da atividade editada respeitando a imutabilidade do React
  const aoMudarHora = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate && indexSendoEditado !== null) {
      const novasAtividades = [...atividadesSelecionadas]; // Cria uma cópia do array original
      novasAtividades[indexSendoEditado][pickerMode] = selectedDate; // Atualiza o campo dinamicamente ('inicio' ou 'fim')
      setAtividadesSelecionadas(novasAtividades);
      setShowPicker(false);
      setIndexSendoEditado(null);
    } 
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

  // Envia os dados completos da rotina via POST para a API em PHP
  const finalizarRotina = async () => {
    // Validações de campos obrigatórios
    if (nome.trim() === '') {
      Alert.alert("Aviso", "Por favor, digite um nome para a rotina.");
      return;
    }
    if (atividadesSelecionadas.length === 0) {
      Alert.alert("Aviso", "Adicione pelo menos uma atividade na sua rotina antes de salvar.");
      return;
    }

    try {
      // TODO: Substituir o ID '1' estático pelo ID vindo do sistema/contexto de Login
      let idUsuarioLogado = await AsyncStorage.getItem("idUsuario");
      if (!idUsuarioLogado) {
        idUsuarioLogado = await AsyncStorage.getItem("id");
      }

      // Formata os objetos Date para strings simples de horário (ex: "14:30:00")
      const atividadesFormatadas = atividadesSelecionadas.map(ativ => ({
        idAtividades: ativ.id,
        horas_iniciais: ativ.inicio.toLocaleTimeString([], { hour12: false }),
        horas_finais: ativ.fim.toLocaleTimeString([], { hour12: false })
      }));

      const URL_SALVAR = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/salvar_rotina.php`;

      const resposta = await fetch(URL_SALVAR, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          idUsuario: idUsuarioLogado || 1, // Se não achar ID, manda 1 (fallback)
          atividades: atividadesFormatadas
        }),
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        Alert.alert("Sucesso!", "Sua rotina foi criada e salva com sucesso!");
        router.push("/minhasRotinas" as Href); // Redireciona para a tela de rotinas salvas
      } else {
        Alert.alert("Erro ao salvar", resultado.mensagem || "Não foi possível salvar a nova rotina.");
      }

    } catch (error: any) {
      console.error("Erro detalhado ao salvar rotina:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor para salvar a rotina.");
    }
  };

  return (
    <View style={styles.container}>
      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.subtitulo}>Criar rotina</Text>
        </View>
      </View>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Campo de Texto: Nome da Rotina */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da rotina</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Aula de Português"
            placeholderTextColor="#0b8cbfd1"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        {/* Botão para abrir o Modal de Seleção de Atividade */}
        <TouchableOpacity 
          style={styles.botaoMaster} 
          onPress={() => setModalVisivel(true)}
        >
          <Ionicons name="add-circle" size={24} color="#F5F2E8" />
          <Text style={styles.textoBotaoMaster}>Selecionar Atividade</Text>
        </TouchableOpacity>

        {/* Renderiza a lista de atividades que já foram adicionadas pelo usuário */}
        {atividadesSelecionadas.map((item, index) => (
          // key única usando id + index para evitar problemas com itens duplicados
          <View key={`${item.id}-${index}`} style={styles.cardAtividade}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.nomeAtividade}>{item.nome}</Text>
              
              {/* Botão de Excluir */}
              <TouchableOpacity onPress={() => apagarAtividade(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
            
            {/* Botões de Seleção de Horários */}
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

      {/* Botão para Enviar os dados ao Banco */}
      <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarRotina}>
        <Text style={styles.textoFinalizar}>Salvar Rotina</Text>
      </TouchableOpacity>

      {/* --- MODAL 1: SELEÇÃO DE ATIVIDADES EXISTENTES --- */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitulo}>Escolha uma Atividade</Text>

            {/* Lista otimizada para exibir as opções vinda do servidor */}
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

            <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisivel(false)}>
              <Text style={{ color: '#F5F2E8', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: SELETOR DE RELÓGIO (DATETIMEPICKER) --- */}
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
                display="spinner"
                onChange={aoMudarHora}
                textColor="#2F1CA6"
              />
            )}

            <TouchableOpacity 
              style={styles.botaoConfirmarHora} 
              onPress={() => setShowPicker(false)}
            >
              <Text style={{ color: '#F5F2E8', fontWeight: 'bold', fontSize: 16 }}>Confirmar Horário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NAVEGAÇÃO E RODAPÉ CONDICIONAL --- */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          /* BARRA PARA O TIPO 2 (ADM) - Destaque em Rotina */
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        ) : (
          /* BARRA PARA QUALQUER OUTRO TIPO (PROFESSOR) - Destaque em Rotina */
          <>
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
          </>
        )}
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
  modalOverlayRelogio: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContentRelogio: { 
    width: '80%', 
    backgroundColor: '#F5F2E8', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2F1CA6',
    elevation: 5,
  },
  modalTituloRelogio: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#2F1CA6', 
    textAlign: 'center' 
  },
  botaoConfirmarHora: {
    backgroundColor: '#2F1CA6', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    width: '100%',
    alignItems: 'center'
  },
});