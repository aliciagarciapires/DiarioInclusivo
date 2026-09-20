import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";
import { API_URL } from "./api";

export default function DiscenteResp() {
  const [listaDiscentes, setListaDiscentes] = useState<any[]>([]);
  const [tipoLogado, setTipoLogado] = useState<number | null>(null);

  const buscarDiscentesDoResponsavel = async () => {
    try {
      const idUsuarioLogado = await AsyncStorage.getItem("idUsuario");
      const tipoLogadoArmazenado = await AsyncStorage.getItem("tipo_de_usuario");
      const tipoUsuario = tipoLogadoArmazenado ? Number(tipoLogadoArmazenado) : null;
      setTipoLogado(tipoUsuario);

      console.log("--- DEBUG DISCENTE RESP ---");
      console.log("ID do Usuário Logado:", idUsuarioLogado);
      console.log("Tipo do Usuário Logado:", tipoUsuario);

      if (!idUsuarioLogado) {
        console.error("ID do usuário não encontrado no AsyncStorage.");
        return;
      }

      let url = "";

      // Se o tipo_de_usuario for 2, busca TODOS os discentes do banco
      if (tipoUsuario === 2) {
        url = `${API_URL}/discenteAdm.php`;
      } else {
        // Se for 1, busca apenas os vinculados ao responsável
        url = `${API_URL}/discenteResp.php?idResp=${idUsuarioLogado}`;
      }

      console.log("URL chamada:", url);

      const response = await fetch(url);
      const dados = await response.json();

      console.log("Retorno do PHP:", dados);

      if (Array.isArray(dados)) {
        setListaDiscentes(dados);
      } else {
        setListaDiscentes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar discentes:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDiscentesDoResponsavel();
    }, [])
  );

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.grid}>
          {listaDiscentes.length > 0 ? (
            listaDiscentes.map((item: any) => (
              <View key={item.id} style={styles.item}>
                <Pressable 
                  style={styles.card} 
                  onPress={() => router.push(`/diarioResp?id=${item.id}`)}
                >
                  <Image 
                    source={require("../../assets/images/discente.png")} 
                    style={styles.imagem} 
                    resizeMode="contain" 
                  />
                </Pressable>

                <Pressable 
                  style={styles.botao} 
                  onPress={() => router.push(`/diarioResp?id=${item.id}`)}
                >
                  <Text style={styles.textoBotao}>{item.nome}</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.textoVazio}>Nenhum discente encontrado.</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Footer Padrão */}
      <Footer children={undefined} />
      
      {/* Barra de Menu Dinâmica baseada no tipo de usuário */}
      <View style={styles.barraMenuGeral}>
        {tipoLogado === 1 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
              <Image source={require("../../assets/images/homeD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoLogado === 2 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discenteD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}
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
  textoVazio: {
    color: "#2F1CA6",
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    marginTop: 40
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