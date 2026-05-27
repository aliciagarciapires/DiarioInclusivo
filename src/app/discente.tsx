import { View, Text, StyleSheet, Image, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import Footer from "../../components/Footer";

// Lista de professores
const listaOriginal = [
  { id: "1", nome: "Discente 1", imagem: require("../../assets/images/discente.png"), tipo: "discente" },
  { id: "2", nome: "Discente 2", imagem: require("../../assets/images/discente.png"), tipo: "discente" }
];

// Item especial de adicionar
const botaoAdicionar = { id: "add", tipo: "botao" };

export default function Discente() {
  // Juntamos os alunos com o botão no final
  const itens = [...listaOriginal, botaoAdicionar];

  return (
    <>
      <ScrollView style={styles.container}>
  <View style={styles.grid}>
    {/* Apenas um map é necessário aqui */}
    {itens.map((item: any) => (
      <View key={item.id} style={styles.item}>
        {item.tipo === "discente" ? (
          <>
            <Pressable 
              style={styles.card} 
              onPress={() => router.push(`/infoDiscente?id=${item.id}`)}
            >
              <Image 
                source={item.imagem} 
                style={styles.imagem} 
                resizeMode="contain" 
              />
            </Pressable>

            <Pressable 
              style={styles.botao} 
              onPress={() => router.push(`/infoDiscente?id=${item.id}`)}
            >
              <Text style={styles.textoBotao}>{item.nome}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable 
            style={styles.cardAdicionar} 
            onPress={() => router.push("/cadDiscente")}
          >
            <Text style={styles.mais}>+</Text>
          </Pressable>
        )}
      </View>
    ))}
  </View>
</ScrollView>
      
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
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, //scrollview ocupar a tela inteira
    backgroundColor: "#F5F2E8",
    padding: 32
  },
  topo: {
      justifyContent: "flex-start", //iniciar no inicio da flex
      marginTop: 20,
      color: "#2F1CA6",
      fontWeight: "bold",
      fontSize: 18,
      textAlign: "center"
    },
  grid: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "flex-start", // Mude de space-around para flex-start
    paddingHorizontal: 20, 
    marginTop: 40,
    gap: 10 // Adicione um gap para dar respiro entre os itens
  },
  item: {
    alignItems: "center",
    marginBottom: 50,
    width: "48%" //cada card ocupa metade da largura
  },
  card: { //define o tamanho e centraliza o card
    width: 140,
    height: 160,
    justifyContent: "center",
    alignItems: "center"
  },
  imagem: {
    width: 120,
    height: 170,
  },
  botao: {
    backgroundColor: "#2F1CA6",
    borderRadius: 20,
    paddingHorizontal: 25, // Aumenta a largura das laterais
    paddingVertical: 12,  // Aumenta a altura do botão
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: {
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 14
    },
  cardAdicionar: {
    width: 115,
    height: 155,
    backgroundColor: "#2F1CA6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0 // Ajustado para alinhar com o topo do card
  },
  mais: {
    color: "#F5F2E8",
    fontSize: 60,
    fontWeight: "bold"
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