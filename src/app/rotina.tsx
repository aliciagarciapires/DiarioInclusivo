import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";

export default function Rotina() {
  // Estado para guardar o tipo de usuário
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Função para descobrir quem está logado
  const carregarTipoUsuario = async () => {
    try {
      let tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
      if (tipoLogado) {
        setTipoUsuario(String(tipoLogado).trim());
      }
    } catch (error) {
      console.error("Erro ao carregar tipo de usuário:", error);
    }
  };

  // Roda a função toda vez que a tela de Rotina é aberta
  useFocusEffect(
    useCallback(() => {
      carregarTipoUsuario();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logoNome.png")}
        style={styles.logo}
      />

      <View style={styles.botaoContainer}>
        <Button label="Criar Rotina" onPress={() => router.push("/criarRotina")} />
      </View>

      <View style={styles.botaoContainer}>
        <Button label="Minhas Rotinas" onPress={() => router.push("/minhasRotinas")} />
      </View>

      <View style={styles.botaoContainer}>
        <Button label="Rotina Pronta" onPress={() => router.push("/minhasRotinas")} />
      </View>

      <Footer children={undefined} />

      {/* Renderização Condicional da Barra Inferior */}
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          /* BARRA PARA O TIPO 2 (ADM) - Destaque em Rotina */
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
              <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        ) : (
          /* BARRA PARA QUALQUER OUTRO TIPO (PROFESSOR) - Destaque em Rotina */
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
              <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
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
    flex: 1, //view ocupar a tela inteira
    alignItems: "center", //centraliza na horizontal
    backgroundColor: "#F5F2E8", //cor do fundo
    padding: 32, //margem
  },
  caixa: {
    flex: 1, //faz a View ocupar a tela toda
    justifyContent: "center", //centraliza vertical
    alignItems: "center",
  },
  logo: {
    width: 150, //usar 100% da imagem
    height: 170, //altura
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
    width: 80, // Largura e altura iguais
    height: 80,
    borderRadius: 15, // Metade do tamanho
    resizeMode: "cover",
  },
  barraMenuGeral: {
    flexDirection: "row", // Alinha os botões na horizontal
    justifyContent: "space-around", // Distribui igualmente o espaço entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 90,
    paddingBottom: 30,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute", // Fixa no rodapé
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    marginTop: 20,
  },
  botaoContainer: {
    width: 250,
    height: 55,
    backgroundColor: "#2F1CA6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
});