import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Footer from "../../components/Footer";

export default function InfoDiscente() {
  const { id } = useLocalSearchParams();

  const discentes = [
    { id: "1", nome: "Discente 1", responsavel: "responsavel1", emailResp: "responsavel1@email.com", dataNasc: "11/05/2015", grauSuporte: "Grau 3" },
    { id: "2", nome: "Discente 2", responsavel: "responsavel2", emailResp: "responsavel2@email.com", dataNasc: "06/04/2019", grauSuporte: "Grau 2" },
  ];

  const discente = discentes.find((d) => d.id === id);

  return (
    <View style={styles.container}>
        {/**LOGO */}
        <View style={styles.itens}>
            <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo} />
        </View>
      {discente ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>{discente.nome}</Text>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Responsável:</Text>
            <Text style={styles.value}>{discente.responsavel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>E-mail do Responsável:</Text>
            <Text style={styles.value}>{discente.emailResp}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{discente.dataNasc}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Grau de Suporte:</Text>
            <Text style={styles.value}>{discente.grauSuporte}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.erro}>Discente não encontrado.</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: "#F5F2E8", 
    paddingHorizontal: 20, // Mantém margem lateral
    paddingTop: 5,        // Diminuí de 20 para 5 para subir tudo
    paddingBottom: 20, 
    justifyContent: "flex-start"
  },
  card: {
    backgroundColor: "#F5F2E8",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#2F1CA6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#2F1CA6"
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#2F1CA6", 
    textAlign: "center",
    marginBottom: 10 
  },
  divider: {
    height: 2,
    backgroundColor: "#2F1CA6",
    marginVertical: 15,
    borderRadius: 1
  },
  infoRow: {
    marginBottom: 15
  },
  label: {
    fontSize: 12,
    color: "#2F1CA6",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  value: {
    fontSize: 16,
    color: "#0b8cbf90",
    marginTop: 2
  },
  erro: { textAlign: "center", fontSize: 16, color: "red" },
  itens: {
        justifyContent: "flex-start", // Garante que a logo suba para o topo
        width: "100%",
        marginTop: -20,
    },
    logo:{
        width: 100, //usar 100% da imagem
        height: 100, //altura
        alignSelf: "center"
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
