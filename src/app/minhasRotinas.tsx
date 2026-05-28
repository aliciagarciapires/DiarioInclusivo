import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import {Link, router} from "expo-router"
import Footer from "../../components/Footer";

// Captura a largura da tela do celular para garantir o ajuste perfeito
const { width } = Dimensions.get("window"); 

interface TarefaRotina {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
}

export default function VisualizarRotina() {
  const [rotina, setRotina] = useState<TarefaRotina[]>([
    { id: "1", nome: "Atividades sensoriais", horaInicio: "8:00", horaFim: "9:00" },
    { id: "2", nome: "Educação física", horaInicio: "9:00", horaFim: "9:50" },
    { id: "3", nome: "Atividades matemática", horaInicio: "9:50", horaFim: "10:40" },
    { id: "4", nome: "Intervalo", horaInicio: "10:40", horaFim: "11:00" },
  ]);

  const [tarefasConcluidas, setTarefasConcluidas] = useState<string[]>([]); //lista começa vazia e só aceita letras

  const alternarCheck = (id: string) => {
    if (tarefasConcluidas.includes(id)) {
      setTarefasConcluidas(tarefasConcluidas.filter((tarefaId) => tarefaId !== id)); //caso já esteja selecionado o ID e o usuário clica nele dnv, desmarca
    } else {
      setTarefasConcluidas([...tarefasConcluidas, id]); //se der falso, não estava marcada e ai marcará
    }
  };

  return (
    <View style={styles.container}>
      
      {/* TOPO CORRIGIDO (Ocupando a largura correta) */}
      <View style={styles.areaCriarTopo}>
        <View style={styles.blocoTextoTopo}>
          <Text style={styles.subtitulo}>Minhas rotinas</Text>
        </View>
      </View>

     <Text style={styles.nomeRotina}>Rotina do Miguel</Text>

      {/* LISTA CORRIGIDA (Com tamanho definido para não bugar no meio) */}
      <FlatList
        data={rotina} // ele pega todas as infrmações que estão dentro do array rotina
        keyExtractor={(item) => item.id} // esse comando pega o id de cada tarefa e o usa como uma "placa de identificação única".
        style={styles.lista}
        contentContainerStyle={styles.listaContainer}
        renderItem={({ item }) => { //array rotina e passar item por item por dentro desse bloco para desenhar o layout na tela
          const isMarcada = tarefasConcluidas.includes(item.id); //sensor, verifica se a atividade está marcada ou não

          return (
            <TouchableOpacity
              style={styles.itemContainer} 
              onPress={() => alternarCheck(item.id)} 
              activeOpacity={0.8}
            >
              {/* BLOCO DA ESQUERDA (Checkbox + Nome) */}
              <View style={styles.blocoEsquerdo}>
                <View style={styles.checkbox}>
                  {isMarcada && (
                    <Ionicons name="checkmark" size={16} color="#2F1CA6" />
                  )}
                </View>
                
                <Text style={[styles.textoNome, isMarcada && styles.textoRiscado]}>
                  {item.nome}
                </Text>
              </View>

              {/* BLOCO DA DIREITA (Horários) */}
              <Text style={[styles.textoHora, isMarcada && styles.textoRiscado]}>
                {item.horaInicio} - {item.horaFim}
              </Text>

            </TouchableOpacity>
             );
            
        }}      
      />
                <View style={styles.botaoAdicionar}>
                <Link href="/criarRotina">
                 <Text style={styles.adicionar}>
                    Adicionar mais atividades +
                </Text>
                </Link>
              </View>   
              
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
  // Seus estilos originais de fontes e cores mantidos
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    paddingTop: 32,
    paddingHorizontal: 24
  },
  topo: {
    marginTop: 20,
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 18
  },
  subtitulo: {
    color: "#0477BF",
    fontWeight: "bold",
    fontSize: 16
  },

  // Ajuste de largura do Topo
  areaCriarTopo: {
    flexDirection: "row",
    width: width - 48, // Desconta o padding das laterais
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  botaoVoltar: {
    position: "absolute",
    left: 0,
    top: 16,
    zIndex: 10,
    padding: 4,
  },
  blocoTextoTopo: {
    flex: 1,
    alignItems: "center",
  },

  // CORREÇÃO DO BUG DA LISTA: Forçando o tamanho para alinhar as pontas
  lista: {
    width: width - 48, // Garante que a lista use o espaço total disponível
  },
  listaContainer: {
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Empurra o nome para a esquerda e hora para a direita
    alignItems: "center",
    width: "100%", // Obriga o container a usar toda a largura da lista
    paddingVertical: 16,
  },
  blocoEsquerdo: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#2F1CA6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    backgroundColor: "transparent",
  },
  textoNome: {
    fontSize: 18,
    color: "#0B8CBF", 
    fontWeight: "500",
  },
  textoHora: {
    fontSize: 15,
    color: "#0B8CBF",
  },
  textoRiscado: {
    color: '#7CBF17',                 
  },
  botaoAdicionar: {
    width: 300,
    height: 45,
    marginBottom: 100,
    backgroundColor: "#2F1CA6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30
  },
  adicionar: {
    marginTop: 5,
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 19
  },
  nomeRotina: {
      marginTop: 10,
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 16
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
