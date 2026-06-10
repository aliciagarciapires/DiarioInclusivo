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
        const response = await fetch(`http://192.168.0.106/DiarioInclusivo/src/app/getProfessor.php?idUsuario=${idUsuario}`);
        const data = await response.json(); //oi
        
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

      <Footer children={undefined} />
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
  logo: { width: 100, height: 100 }
});