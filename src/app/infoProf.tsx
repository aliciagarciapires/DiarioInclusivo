import { View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import Footer from "../../components/Footer";

export default function InfoProf() {
  const { id } = useLocalSearchParams();

  const professores = [
    { id: "1", nome: "Professor 1", email: "professor1@email.com", maspMatricula: "123456", senha: "••••••••" },
    { id: "2", nome: "Professor 2", email: "professor2@email.com", maspMatricula: "654321", senha: "••••••••" },
  ];

  // Buscamos o professor
  const prof = professores.find((p) => p.id === id);

  const handleExcluir = () => {
    // Usamos o 'prof' com segurança aqui também
    if (!prof) return; 

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir ${prof.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: () => {
            console.log("Excluindo:", prof.id);
            router.back(); 
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/**LOGO */}
      <View style={styles.itens}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      </View>

      {/* Verificação condicional segura */}
      {prof ? (
        <View style={styles.card}>
          <View style={styles.headerCard}>
            {/* O ?. garante que o código não quebre se prof estiver carregando */}
            <Text style={styles.titulo}>{prof?.nome}</Text>
            
            <Pressable onPress={handleExcluir} style={styles.trashIcon}>
              <Ionicons name="trash-outline" size={26} color="#FF3B30" />
            </Pressable>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{prof?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>MASP/Matrícula:</Text>
            <Text style={styles.value}>{prof?.maspMatricula}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Senha:</Text>
            <Text style={styles.value}>{prof?.senha}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.erro}>Professor não encontrado.</Text>
      )}

      {/* Menu Inferior */}
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
  container: { flex: 1, backgroundColor: "#F5F2E8", padding: 20 },
  card: {
    backgroundColor: "#F5F2E8",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#2F1CA6",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  trashIcon: { padding: 5 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#2F1CA6" },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 15 },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#0b8cbfd1", marginTop: 2 },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "center", width: "100%", marginTop: -40 },
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
  logo: {
    width: 100, //usar 100% da imagem
        height: 100, //altura
        alignSelf: "center"
  }
});