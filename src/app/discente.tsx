import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";

export default function Discente() {
  const [listaDiscentes, setListaDiscentes] = useState<any[]>([]);

  // Função para buscar discentes criados pelo usuário logado
  const buscarDiscentes = async () => {
    try {
      // 1. Tenta pegar o ID da chave "idUsuario" ou "id" salva no login
      let idUsuarioLogado = await AsyncStorage.getItem("idUsuario");
      if (!idUsuarioLogado) {
        idUsuarioLogado = await AsyncStorage.getItem("id");
      }

      if (!idUsuarioLogado) {
        console.error("Usuário não autenticado no AsyncStorage.");
        setListaDiscentes([]);
        return;
      }

      // 2. Envia o idUsuario via parâmetro GET para a API
      const response = await fetch(
        `http://172.25.0.28/DiarioInclusivo/src/app/discente.php?idUsuario=${idUsuarioLogado}`
      );
      const dados = await response.json();

      if (Array.isArray(dados)) {
        // Mapeia os dados garantindo a propriedade tipo="discente" para cada item
        const discentesMapeados = dados.map((d: any) => ({
          ...d,
          tipo: "discente",
        }));
        setListaDiscentes(discentesMapeados);
      } else {
        setListaDiscentes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar discentes:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDiscentes();
    }, [])
  );

  // Combina a lista do banco com o card fixo de adicionar (+)
  const itens = [...listaDiscentes, { id: "add", tipo: "botao" }];

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.grid}>
          {itens.map((item: any) => (
            <View key={String(item.id)} style={styles.item}>
              {item.tipo === "discente" ? (
                <>
                  <Pressable 
                    style={styles.card} 
                    onPress={() => router.push(`/infoDiscente?id=${item.id}`)}
                  >
                    <Image 
                      source={require("../../assets/images/discente.png")} 
                      style={styles.imagem} 
                      resizeMode="contain" 
                    />
                  </Pressable>

                  <Pressable 
                    style={styles.botao} 
                    onPress={() => router.push(`/infoDiscente?id=${item.id}`)}
                  >
                    <Text style={styles.textoBotao}>{item.nome}</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable 
                  style={styles.cardAdicionar} 
                  onPress={() => router.push("/cadDiscente")}
                >
                  <Text style={styles.mais}>+</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <Footer children={undefined} />

      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
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

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
          <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2E8",
    padding: 32
  },
  grid: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "flex-start",
    paddingHorizontal: 20, 
    gap: 10
  },
  item: {
    alignItems: "center",
    marginBottom: 50,
    width: "48%"
  },
  card: {
    width: 140,
    height: 160,
    justifyContent: "center",
    alignItems: "center"
  },
  imagem: {
    width: 120,
    height: 170,
  },
  botao: {
    backgroundColor: "#2F1CA6",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: {
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 14
  },
  cardAdicionar: {
    width: 115,
    height: 155,
    backgroundColor: "#2F1CA6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0
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
  },
});