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
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import Footer from '../../components/Footer';



interface Atividade { //Defino o que é atividade e as suas informações
  id: string;
  nome: string;
  inicio: Date;
  fim: Date;
}

export default function CriarRotina() {
  const router = useRouter(); //para poder trocar de tela depois
  
  // estados iniciais 
  const [nomeRotina, setNomeRotina] = useState(''); //começa sem nome
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState<Atividade[]>([]); //array começa vazio
  
  // estados de controle dos Modais e Pickers
  const [modalVisivel, setModalVisivel] = useState(false); //controla se o pop-up aparece na tela
  const [showPicker, setShowPicker] = useState(false); //controla SE o relógio do celular aparece ou não na tela
  const [pickerMode, setPickerMode] = useState<'inicio' | 'fim'>('inicio'); //controla O QUE vai aparecer na tela depois do relógio ser aberto
  const [indexSendoEditado, setIndexSendoEditado] = useState<number | null>(null); //salva o indice numerico de qual atividade na lista o usuario esta alterando

  // estados novos: para a criação da atividade personalizada
  const [criandoPersonalizada, setCriandoPersonalizada] = useState(false); //modal da personalizada
  const [novoNomeAtividade, setNovoNomeAtividade] = useState(''); //guarda o texto digitado pelo usuário ao criar uma atividade do zero de forma manual.

  // lista de atividades pré-cadastradas
  const listaMaster = [
    "Mapa mental", "Esquemas Ilustrados", "Guia de leitura", 
    "Desenho explicativo", "Objeto de toque", "Pausa programada"
  ];

  // adiciona uma atividade da lista pré-definida
  const adicionarDaMaster = (nome: string) => {
    const novaAtiv: Atividade = {
      id: Math.random().toString(), //valor aleatorio do id
      nome,
      inicio: new Date(),
      fim: new Date(),
    };
    setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]); //pega tds as atividades que já existiam e add uma no final
    setModalVisivel(false);
  };

  // FUNÇÃO NOVA: Salva a atividade que o usuário digitou manualmente
  const salvarAtividadePersonalizada = async () => {
  if (novoNomeAtividade.trim() === '') return; // Impede salvar em branco

  try {
    // tem q botar o ip do computador ou do servidor php / xamp aq p funcionar
    const URL_API = 'http://localhost/diario/criar_atividade.php';

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
      // Se salvou no banco, adiciona na lista da tela usando o ID que o banco gerou
      const novaAtiv: Atividade = {
        id: resultado.idAtividades.toString(), // Usa o ID real do banco!
        nome: novoNomeAtividade,
        inicio: new Date(),
        fim: new Date(),
      };

      setAtividadesSelecionadas([...atividadesSelecionadas, novaAtiv]);
      
      // Limpa os campos e fecha os modais
      setNovoNomeAtividade('');
      setCriandoPersonalizada(false);
      setModalVisivel(false);
      
      Alert.alert("Sucesso", "Atividade salva!");
    } else {
      Alert.alert("Erro", resultado.mensagem);
    }

  } catch (error: any) {
    console.error("Erro detalhado:", error);
    // Isso vai abrir um pop-up com o erro real na tela do celular
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
    setShowPicker(false); //essa função é acionada assim que o usuario confirma ou cancela fechando o relogio automaticamente

    if (selectedDate && indexSendoEditado !== null) {
      const novasAtividades = [...atividadesSelecionadas]; //cria uma cópia idêntica da lista de atividades chamada
      
      if (pickerMode === 'inicio') {
        novasAtividades[indexSendoEditado].inicio = selectedDate; //muda o inicio
      } else {
        novasAtividades[indexSendoEditado].fim = selectedDate; //muda o fim
      }
      setAtividadesSelecionadas(novasAtividades);
    }

    setIndexSendoEditado(null); //Limpa o índice de edição para indicar que a alteração de horário acabou.
  };

  const finalizarRotina = () => {  //printa as informações no console para fins de teste e redireciona o usuário 
    console.log({ nomeRotina, atividadesSelecionadas });
    router.push("/minhasRotinas" as Href);
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
            setCriandoPersonalizada(false); // garante que abre na lista
            setModalVisivel(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color="#F5F2E8" />
          <Text style={styles.textoBotaoMaster}>Atividade</Text>
        </TouchableOpacity>

        {atividadesSelecionadas.map((item, index) => (
  <View key={item.id} style={styles.cardAtividade}>
    
    {/* Nova View estruturada em linha para colocar o texto de um lado e a lixeira do outro */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Text style={styles.nomeAtividade}>{item.nome}</Text>
      
      {/* Botão da Lixeira */}
      <TouchableOpacity onPress={() => apagarAtividade(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#FF4444" />
      </TouchableOpacity>
    </View>
    
    {/* Os botões de horário continuam aqui embaixo... */}
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

      {/* MODAL MODIFICADO */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* CONDICIONAL: Se clicou para criar uma nova atividade */}
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
              // CASO CONTRÁRIO: Mostra a lista padrão de atividades
              <>
                <Text style={styles.modalTitulo}>Escolha as Atividades</Text>
                <FlatList 
                  data={listaMaster}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.itemMaster} 
                      onPress={() => adicionarDaMaster(item)}
                    >
                     
                      {/* Container em linha para alinhar o texto e o ícone */}
                      <View style={styles.containerMaster}>
                         <Ionicons name="add-circle-outline" size={22} color="#2F1CA6" />
                           <View style={styles.conteudoItemMaster}>
                           <Text style={styles.textoItemMaster}>{item}</Text>
                           </View>
                      </View>
                      
                    </TouchableOpacity>
                  )}
                />
              

                {/* BOTÃO NOVO: Criar nova atividade customizada */}
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

      {/* Picker do Relógio */}
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={aoMudarHora}
        />
      )}

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
  container: 
  { flex: 1,
     backgroundColor: '#F5F2E8' 
    },
  header: 
  { 
    flexDirection: 'row', 
    alignItems: 'center',
   padding: 20,
  },
  titulo: 
  { fontSize: 24, 
   fontWeight: 'bold', 
   color: '#2F1CA6' 
  },
  subtitulo: {
    marginTop: 5,
    color: "#0477BF",
    fontWeight: "bold",
    fontSize: 16
  },

  scrollContent: 
  { padding: 20 

  },
  inputGroup: 
  { marginBottom: 20 

  },
  label: 
  { fontSize: 18, 
    color: '#2F1CA6', 
    fontWeight: 'bold', 
    marginBottom: 8 },
  input: 
  { backgroundColor: '#F5F2E8', 
    borderRadius: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#2F1CA6' },
  botaoMaster: { 
    backgroundColor: '#2F1CA6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 30, 
    justifyContent: 'center', 
    marginBottom: 20
  },
  textoBotaoMaster: 
  { color: '#F5F2E8', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 10
  },
  cardAtividade: 
  { backgroundColor: '#F5F2E8', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  nomeAtividade: 
  { fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2F1CA6', 
    marginBottom: 10 
  },
  containerHorarios:
   { flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  botaoHora: { 
    backgroundColor: '#f8f6f2', 
    padding: 8, 
    borderRadius: 10, 
    flex: 0.48, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#2e1ca668' },
  textoHora: { color: '#2F1CA6', fontWeight: 'bold' },
  botaoFinalizar: 
  { backgroundColor: '#2F1CA6', 
    padding: 15, 
    alignItems: 'center', 
    margin: 20, 
    borderRadius: 30, 
    marginBottom: 80 },


  textoFinalizar: { color: '#F5F2E8', fontSize: 20, fontWeight: 'bold' },
  
  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', height: '65%', backgroundColor: '#F5F2E8', borderRadius: 20, padding: 20, justifyContent: 'space-between' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2F1CA6', textAlign: 'center' },

  containerMaster: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10
  },
  itemMaster: { 
    paddingVertical: 15, 
    paddingHorizontal: 10,
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0' // Uma linha mais suave para separar os itens
  },
  conteudoItemMaster: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Empurra o texto para a esquerda e o ícone para a direita
    alignItems: 'center',
  },
  textoItemMaster: { 
    fontSize: 18, 
    color: '#2F1CA6',
    fontWeight: '500' // Deixa o texto levemente mais destacado
  },

  botaoCriarNovaDentroDoModal: {
    backgroundColor: '#7CBF17', // Verde para dar destaque positivo
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: 15
  },
  textoBotaoCriarNova: { color: '#F5F2E8', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  botaoAdicionarSimulado: {
    backgroundColor: '#2F1CA6',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  avisoHorario: { color: '#2e1ca665', fontSize: 13, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  botaoFechar: { backgroundColor: '#F22222', padding: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
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
    width: 200,                     
    height: 70,
    resizeMode: "contain",         
  },
  barraMenuGeral: {
    flexDirection: "row",          // Alinha os botões na horizontal
    justifyContent: "space-around",// Distribui igualmente o espaço entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",    
    height: 90,                    
    paddingBottom: 30,             
    borderTopWidth: 3,             
    borderTopColor: "#F5F2E8",     
    borderTopLeftRadius: 35,       
    borderTopRightRadius: 35,      
    position: "absolute",          // Fixa no rodapé
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,                 
    shadowColor: "#000",
    marginTop: 20   
  },
});
