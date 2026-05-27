import { View, Text, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function InfoProf() {
  const { id } = useLocalSearchParams();

  const professores = [
    { id: "1", nome: "Professor 1", email: "professor1@email.com", maspMatricula: "123456", senha: "••••••••" },
    { id: "2", nome: "Professor 2", email: "professor2@email.com", maspMatricula: "654321", senha: "••••••••" },
  ];

  const prof = professores.find((p) => p.id === id);

  return (
    <View style={styles.container}>
        {/**LOGO */}
        <View style={styles.itens}>
            <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo} />
        </View>
      {prof ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>{prof.nome}</Text>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{prof.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>MASP/Matrícula:</Text>
            <Text style={styles.value}>{prof.maspMatricula}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Senha:</Text>
            <Text style={styles.value}>{prof.senha}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.erro}>Professor não encontrado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F2E8", 
    padding: 20, 
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
        justifyContent: "center",
        width: "100%"
    },
    logo:{
        width: 200, //usar 100% da imagem
        height: 200, //altura
        alignSelf: "center"
    }, 
});