import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";
import { router } from "expo-router";

export default function Historico() {
  // Array simples para repetir os blocos de histórico
  const itensHistorico = [
    { data: "Ontem" },
    { data: "07 de abril - 2026" },
    { data: "06 de abril - 2026" }
  ];

  return (
    <View style={styles.containerGeral}>
      
      {/* ScrollView permite rolar a página se o conteúdo passar do tamanho da tela */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Topo com botão voltar e Título */}
        <View style={styles.header}>
          <Text style={styles.iconeVoltar}>←</Text> 
          <Text style={styles.tituloPagina}>Histórico</Text>
          <View style={{ width: 24 }} /> {/* Equilíbrio visual */}
        </View>

        {/* Mapeamento dos blocos de histórico */}
        {itensHistorico.map((item, index) => (
          <View key={index} style={styles.blocoHistorico}>
            
            {/* Linha da Data e Bolinhas de Comportamento */}
            <Text style={styles.dataTexto}>{item.data}</Text>
            
            <View style={styles.comportamentoContainer}>
              <Text style={styles.subtituloTexto}>Comportamento:</Text>
              <View style={styles.statusBolinhas}>
                <View style={[styles.bolinha, { backgroundColor: "#7CD124" }]} />
                <View style={[styles.bolinha, { backgroundColor: "#FBC314" }]} />
                <View style={[styles.bolinha, { backgroundColor: "#ED2E2E" }]} />
              </View>
            </View>

            {/* Campo Atividades Realizadas */}
            <Text style={styles.labelCampo}>Atividades realizadas:</Text>
            <View style={styles.caixaTextoEstatica} />

            {/* Campo Complemento */}
            <Text style={styles.labelCampo}>Complemento:</Text>
            <View style={styles.caixaTextoEstatica} />

          </View>
        ))}

        {/* Espaçador no final do scroll para o menu não cobrir o conteúdo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Menu Inferior Estático */}
      <Footer children={undefined} />
                  <View style={styles.barraMenuGeral}>
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
                      <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
                      <Text style={styles.tabLabel}>Início</Text>
                    </Pressable>
                    
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
                      <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
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

    </View>
  );
}

const styles = StyleSheet.create({
  containerGeral: {
    flex: 1,
    backgroundColor: "#F5F2E8",
  },
  scrollContainer: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  iconeVoltar: {
    fontSize: 24,
    color: "#2F1CA6",
    fontWeight: "bold",
  },
  tituloPagina: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  blocoHistorico: {
    marginBottom: 25,
    width: "100%",
  },
  dataTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 2,
  },
  comportamentoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  subtituloTexto: {
    fontSize: 16,
    color: "#1797CD",
    fontWeight: "500",
  },
  statusBolinhas: {
    flexDirection: "row",
    gap: 12,
  },
  bolinha: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  labelCampo: {
    fontSize: 16,
    color: "#1797CD",
    fontWeight: "500",
    marginBottom: 6,
  },
  caixaTextoEstatica: {
    width: "100%",
    height: 55,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#2F1CA6",
    backgroundColor: "#F5F2E8",
    marginBottom: 15,
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 90,
    paddingBottom: 25,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
