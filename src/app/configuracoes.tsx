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
          const response = await fetch(`http://10.0.0.100/DiarioInclusivo/src/app/getUsuario.php?id=${idSalvo}`);
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
              
              // Se quiser garantir que TODAS as chaves locais sejam apagadas, use:
              // await AsyncStorage.clear();

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
          onPress={() => router.push("/discenteResp")}
        >
          <Text style={styles.opcaoTexto}>Alteração de senha</Text>
        </Pressable>

        {/* BOTÃO DE SAIR / LOGOUT */}
        <Pressable 
          style={styles.opcaoItem} 
          onPress={handleSair}
        >
          <Text style={[styles.opcaoTexto, { color: "#FF4444" }]}>Sair</Text>
        </Pressable>
      </View>

      {/* Menu Inferior Condicional */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        
        {/* BOTÃO INÍCIO (Exibido para todos os tipos) */}
        <Pressable 
          style={styles.botaoMenu} 
          onPress={() => router.push(tipoUsuario === 1 ? "/discenteResp" : "/discente")}
        >
          <Image 
            source={require("../../assets/images/home.png")} 
            style={styles.iconeCustom} 
          />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>

        {/* BOTÃO DIÁRIO (Apenas tipo 2 e 3) */}
        {(tipoUsuario === 2 || tipoUsuario === 3) && (
          <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
            <Image 
              source={require("../../assets/images/diario.png")} 
              style={styles.iconeCustom} 
            />
            <Text style={styles.tabLabel}>Diário</Text>
          </Pressable>
        )}

        {/* BOTÃO ROTINA (Apenas tipo 2 e 3) */}
        {(tipoUsuario === 2 || tipoUsuario === 3) && (
          <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
            <Image 
              source={require("../../assets/images/rotina.png")} 
              style={styles.iconeCustom} 
            />
            <Text style={styles.tabLabel}>Rotina</Text>
          </Pressable>
        )}

        {/* BOTÃO CONFIGURAÇÕES (Exibido para todos os tipos) */}
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
          <Image 
            source={require("../../assets/images/confgD.png")} 
            style={styles.iconeCustom} 
          />
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
