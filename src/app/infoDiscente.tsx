import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Footer from "../../components/Footer";

type Discente = {
  nome: string;
  data_nascimento: string;
  grau_de_suporte: string;
};

export default function InfoDiscente() {
  const { id } = useLocalSearchParams();
  const [discente, setDiscente] = useState<Discente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/getDiscente.php?id=${id}`);
        const json = await response.json();
        
        if (json.success) {
          setDiscente(json.dados);
        } else {
          Alert.alert("Erro", json.message);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };

    if (id) buscarDados();
  }, [id]);

  // Função para abrir o alerta de confirmação
  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar este discente?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: apagarDiscente 
        }
      ]
    );
  };

  // Função que faz a requisição para apagar no PHP
  const apagarDiscente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/deleteDiscente.php?id=${id}`);
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message, [
          { text: "OK", onPress: () => router.push("/discente") } // Redireciona para a lista
        ]);
      } else {
        Alert.alert("Erro", json.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2F1CA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.itens}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      </View>

      {discente ? (
        <View style={styles.card}>
          {/* Cabeçalho do Card com Título e Lixeira */}
          <View style={styles.cardHeader}>
            <Text style={styles.titulo}>{discente.nome}</Text>
            <TouchableOpacity onPress={confirmarExclusao} style={styles.botaoLixeira}>
              <Ionicons name="trash-outline" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{discente.data_nascimento}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Grau de Suporte:</Text>
            <Text style={styles.value}>Grau {discente.grau_de_suporte}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.erro}>Discente não encontrado.</Text>
      )}

      {/* Barra de Navegação */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
          <Image source={require("../../assets/images/homeD.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
          <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Diário</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
          <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Rotina</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/conf")}>
          <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2E8", paddingHorizontal: 20, paddingTop: 5 },
  card: { backgroundColor: "#F5F2E8", borderRadius: 20, padding: 25, elevation: 5, borderWidth: 1, borderColor: "#2F1CA6", marginTop: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#2F1CA6", flex: 1, textAlign: "center" },
  botaoLixeira: { padding: 5, marginLeft: 10 },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 15, borderRadius: 1 },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#0b8cbf90", marginTop: 2 },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "flex-start", width: "100%", marginTop: -20 },
  logo: { width: 100, height: 100, alignSelf: "center" },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 12, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
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
});