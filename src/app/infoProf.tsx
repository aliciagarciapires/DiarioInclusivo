import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";

export default function InfoProf() {
  const { idUsuario } = useLocalSearchParams();
  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idUsuario) {
      setLoading(false);
      return;
    }

    const fetchProf = async () => {
      try {
        const response = await fetch(`http://172.20.10.2/DiarioInclusivo/src/app/getProfessor.php?idUsuario=${idUsuario}`);
        const data = await response.json(); //o
        
        if (data.success) {
          setProf(data.dados);
        } else {
          Alert.alert("Erro", data.message || "Professor não encontrado.");
        }
      } catch (error) {
        Alert.alert("Erro", "Falha na conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchProf();
  }, [idUsuario]);

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#2F1CA6" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.itens}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      </View>

      {prof ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>{prof.nome}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.value}>{prof.email}</Text>
        </View>
      ) : (
        <Text style={styles.erro}>Nenhum dado encontrado.</Text>
      )}

      {/* Barra de Navegação */}
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
  card: { backgroundColor: "#F5F2E8", borderRadius: 20, padding: 25, borderWidth: 1, borderColor: "#2F1CA6", marginTop: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#2F1CA6" },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 15 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold" },
  value: { fontSize: 16, color: "#0b8cbfd1" },
  erro: { textAlign: "center", marginTop: 50, color: "red" },
  itens: { alignItems: "center", marginTop: 20 },
  logo: { width: 100, height: 100 },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 12, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
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
  botaoContainer:{
    width: 250,
    height: 55,
    backgroundColor: "#2F1CA6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35
  },
});