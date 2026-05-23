
import { View, Text, StyleSheet, Image, Pressable, ScrollView} from "react-native";
import { router, usePathname } from "expo-router";
import { useNavigationState } from "@react-navigation/native";
import Footer from "../../components/Footer";

const discente = [ //cria uma array de discentes
  {
    id: "1",
    nome: "Discente 1",
    imagem: require("../../assets/images/crianca.png")
  }
];

export default function Discente() {
  return (
    <><ScrollView style={styles.container}>

      <View style={styles.grid}> {/**organiza os cards */}

        {discente.map((item) => ( //map percorre o array e, para cada item, criam um componente e mostra na tela
          <View key={item.id} style={styles.item}> {/**key é pra identificar cada item */}

            <Pressable style={styles.card} onPress={() => router.push("/menu")}> {/**area clicavel do discente */}

              <Image
                source={item.imagem} //imagem do array atual
                style={styles.imagem}
                resizeMode="contain" //faz a imagem caber sem deformar
              />

            </Pressable>

            {/**BOTAO COM O NOME */}
            <Pressable style={styles.botao} onPress={() => router.push("/menu")}>
              <Text style={styles.textoBotao}>
                {item.nome}{/**mostra o nome da criança atual */}
              </Text>
            </Pressable>

          </View>
        ))}

        {/**CARD DE ADICIONAR */}
        <View style={styles.item}>

          <Pressable style={styles.cardAdicionar} onPress={() => router.push("/cadDiscente")}> {/**link para ir cadastrar discente */}
            <Text style={styles.mais}>+</Text>
          </Pressable>

        </View>

      </View>

    </ScrollView>
    
    <Footer />
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
  );
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
    flexDirection: "row", //itens lado a lado
    flexWrap: "wrap", //permite quebrar a linha
    justifyContent: "space-around", //cria espaço entre os itens
    paddingHorizontal: 20,
    marginTop: 40
  },
  item: {
    alignItems: "center",
    marginBottom: 50,
    width: "50%" //cada card ocupa metade da largura
  },
  card: { //define o tamanho e centraliza o card
    width: 90,
    height: 140,
    justifyContent: "center",
    alignItems: "center"
  },
  imagem: {
    width: 130,
    height: 170,
  },
  botao: {
    backgroundColor: "#F2BB13",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5
  },
  textoBotao: {
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 13
    },
  cardAdicionar: {
    width: 90,
    height: 100,
    backgroundColor: "#F2B705",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
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

