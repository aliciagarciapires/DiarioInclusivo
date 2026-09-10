import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";

export default function Configuracoes() {
  const [tipoUsuario, setTipoUsuario] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarTipoUsuario = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem("idUsuario");
        if (idSalvo) {

          const response = await fetch(`http://192.168.0.107/DiarioInclusivo/src/app/getUsuario.php?id=${idSalvo}`);

          const json = await response.json();
          
          if (json.success && json.dados?.tipo_de_usuario) {
            setTipoUsuario(Number(json.dados.tipo_de_usuario));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar tipo de usuÃ¡rio nas configuraÃ§Ãµes:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarTipoUsuario();
  }, []);

  // ðŸ’¡ LÃ“GICA DE LOGOUT
  const handleSair = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Apaga a chave do usuÃ¡rio logado
              await AsyncStorage.removeItem("idUsuario");
              
              // 2. Redireciona para a tela inicial / login substituindo o histÃ³rico
              router.replace("/cadRespAdm"); 
            } catch (error) {
              Alert.alert("Erro", "NÃ£o foi possÃ­vel encerrar a sessÃ£o.");
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2F1CA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Lista de OpÃ§Ãµes */}
      <View style={styles.opcoesContainer}>
        <Pressable 
          style={styles.opcaoItem} 
          onPress={() => router.push("/infoUsuario")}
        >
          <Text style={styles.opcaoTexto}>InformaÃ§Ãµes da conta</Text>
        </Pressable>

        <Pressable 
          style={styles.opcaoItem} 
          onPress={() => router.push("/discenteResp")}
        >
          <Text style={styles.opcaoTexto}>AlteraÃ§Ã£o de senha</Text>
        </Pressable>

        {/* BOTÃƒO DE SAIR / LOGOUT */}
        <Pressable 
          style={styles.opcaoItem} 
          onPress={handleSair}
        >
          <Text style={[styles.opcaoTexto, { color: "#FF4444" }]}>Sair</Text>
        </Pressable>
      </View>

      {/* Menu Inferior Condicional por Tipo de UsuÃ¡rio */}
      <Footer children={undefined} />
      
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === 1 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>InÃ­cio</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>DiÃ¡rio</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoUsuario === 2 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoUsuario === 3 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>InÃ­cio</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>DiÃ¡rio</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2E8",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
  },
  botaoVoltar: {
    padding: 4,
  },
  iconeSeta: {
    fontSize: 26,
    color: "#2F1CA6",
    fontWeight: "bold",
  },
  tituloPagina: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  opcoesContainer: {
    marginTop: 20,
    gap: 28,
  },
  opcaoItem: {
    paddingVertical: 4,
  },
  opcaoTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F1CA6",
    marginTop: 4,
  },
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
    marginTop: 20,
  },
});
