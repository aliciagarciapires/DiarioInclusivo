import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";
import Footer from "../../components/Footer";
import { API_URL } from "./api";

export default function Configuracoes() {
  const [tipoUsuario, setTipoUsuario] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentoAberto, setDocumentoAberto] = useState<"termo" | "politica" | null>(null);

  const abrirDocumento = (tipo: "termo" | "politica") => {
    setDocumentoAberto(tipo);
  };

  useEffect(() => {
    const carregarTipoUsuario = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem("idUsuario");
        if (idSalvo) {

          const response = await fetch(`${API_URL}/getUsuario.php?id=${idSalvo}`);

          const json = await response.json();
          
          if (json.success && json.dados?.tipo_de_usuario) {
            setTipoUsuario(Number(json.dados.tipo_de_usuario));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar tipo de usuário nas configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarTipoUsuario();
  }, []);

  // 💡 LÓGICA DE LOGOUT
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
              // 1. Apaga a chave do usuário logado
              await AsyncStorage.removeItem("idUsuario");
              
              // 2. Redireciona para a tela inicial / login substituindo o histórico
              router.replace("/cadRespAdm"); 
            } catch (error) {
              Alert.alert("Erro", "Não foi possível encerrar a sessão.");
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
      <Modal
        visible={documentoAberto !== null}
        animationType="slide"
        onRequestClose={() => setDocumentoAberto(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setDocumentoAberto(null)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#2F1CA6" />
            </Pressable>
            <Text style={styles.modalTitulo}>
              {documentoAberto === "termo" ? "Termos de Uso" : "Política de Privacidade"}
            </Text>
            <Image source={require("../../assets/images/logo.png")} style={styles.modalLogo} />
            <View style={{ width: 32 }} />
          </View>

          <WebView
            source={{
              uri:
                documentoAberto === "termo"
                  ? "https://diarioinclusivo.linceonline.com.br/public/termo.html"
                  : "https://diarioinclusivo.linceonline.com.br/public/politica.html",
            }}
            style={styles.webview}
            startInLoadingState
          />
        </View>
      </Modal>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Lista de Opções */}
      <View style={styles.opcoesContainer}>
        <Pressable 
          style={styles.opcaoItem} 
          onPress={() => router.push("/infoUsuario")}
        >
          <Text style={styles.opcaoTexto}>Informações da conta</Text>
        </Pressable>

        <Pressable 
          style={styles.opcaoItem} 
          onPress={() => router.push("/alterar_senha")}
        >
          <Text style={styles.opcaoTexto}>Alteração de senha</Text>
        </Pressable>

        <Pressable
          style={styles.opcaoItem}
          onPress={() => abrirDocumento("termo")}
        >
          <Text style={[styles.opcaoTexto, styles.linkTexto]}>Termos de Uso</Text>
        </Pressable>

        <Pressable
          style={styles.opcaoItem}
          onPress={() => abrirDocumento("politica")}
        >
          <Text style={[styles.opcaoTexto, styles.linkTexto]}>Política de Privacidade</Text>
        </Pressable>

        {/* BOTÃO DE SAIR / LOGOUT */}
        <Pressable 
          style={styles.opcaoItem} 
          onPress={handleSair}
        >
          <Text style={[styles.opcaoTexto, { color: "#FF4444" }]}>Sair</Text>
        </Pressable>
      </View>
      </ScrollView>

      {/* Menu Inferior Condicional por Tipo de Usuário */}
      <Footer children={undefined} />
      
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === 1 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
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
              <Text style={styles.tabLabel}>Atividades</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
  linkTexto: {
    color: "#2F1CA6",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F2E8",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 0,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F1CA6",
    textAlign: "center",
    textTransform: "uppercase",
    flex: 1,
    marginHorizontal: 8,
  },
  modalLogo: {
    width: 90,
    height: 70,
    resizeMode: "contain",
    marginRight: -50,
  },
  webview: {
    flex: 1,
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
    height: 120,
    paddingBottom: 10,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    marginTop: 20,
  },
});
