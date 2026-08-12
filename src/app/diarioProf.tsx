import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Footer from "../../components/Footer";
import { router } from "expo-router";

export default function Diario() {
  return (
    <View style={styles.container}>
      
      {/* Topo com botão voltar e Título */}
    <View style={styles.header}>
    <Text style={{ fontSize: 24, color: "#2F1CA6" }}>←</Text> 
    <Text style={styles.mesTexto}>ABRIL DE 2026</Text>
    <View style={{ width: 24 }} />
    </View>

      {/* Seção do Calendário */}
      <View style={styles.calendarioContainer}>
        
        
        {/* Dias da Semana */}
        <View style={styles.semanaContainer}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, i) => (
            <Text key={i} style={styles.diaSemanaTexto}>{dia}</Text>
          ))}
        </View>

        {/* Linhas de Dias */}
        <View style={styles.gradeDias}>
          <Text style={[styles.diaTexto, styles.diaCinza]}>29</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>30</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>31</Text>
          <Text style={styles.diaTexto}>1</Text>
          <Text style={styles.diaTexto}>2</Text>
          <Text style={styles.diaTexto}>3</Text>
          <Text style={styles.diaTexto}>4</Text>

          <Text style={styles.diaTexto}>5</Text>
          <Text style={styles.diaTexto}>6</Text>
          <Text style={styles.diaTexto}>7</Text>
          <Text style={styles.diaTexto}>8</Text>
          <View style={styles.diaSelecionado}><Text style={styles.diaTextoNoCirculo}>9</Text></View>
          <Text style={styles.diaTexto}>10</Text>
          <Text style={styles.diaTexto}>11</Text>

          <Text style={styles.diaTexto}>12</Text>
          <Text style={styles.diaTexto}>13</Text>
          <Text style={styles.diaTexto}>14</Text>
          <Text style={styles.diaTexto}>15</Text>
          <Text style={styles.diaTexto}>16</Text>
          <Text style={styles.diaTexto}>17</Text>
          <Text style={styles.diaTexto}>18</Text>

          <Text style={styles.diaTexto}>19</Text>
          <Text style={styles.diaTexto}>20</Text>
          <Text style={styles.diaTexto}>21</Text>
          <Text style={styles.diaTexto}>22</Text>
          <Text style={styles.diaTexto}>23</Text>
          <Text style={styles.diaTexto}>24</Text>
          <Text style={styles.diaTexto}>25</Text>

          <Text style={styles.diaTexto}>26</Text>
          <Text style={styles.diaTexto}>27</Text>
          <Text style={styles.diaTexto}>28</Text>
          <Text style={styles.diaTexto}>29</Text>
          <Text style={styles.diaTexto}>30</Text>
          <View style={styles.diaInvisivel}/>
          <View style={styles.diaInvisivel}/>
        </View>
      </View>

      {/* Botões Grandes Centrais */}
      <View style={styles.botoesAcaoContainer}>
        <View style={[styles.botaoAcao, styles.botaoRoxo]}>
          <Text style={styles.botaoAcaoTexto}>Nova Entrada</Text>
        </View>

        <View style={[styles.botaoAcao, styles.botaoAzul]}>
          <Text style={styles.botaoAcaoTexto}>Histórico</Text>
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: "#F5F2E8",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  iconeVoltar: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  tituloPagina: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  calendarioContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  mesTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
    
  },
  semanaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  diaSemanaTexto: {
    color: "#ED3C3C", 
    fontWeight: "bold",
    fontSize: 16,
    width: 40,
    textAlign: "center",
  },
  gradeDias: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  diaTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F1CA6",
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 40, // Centraliza o texto no Android
  },
  diaCinza: {
    color: "#1796cd5c",
  },
  diaSelecionado: {
    backgroundColor: "#1797CD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  diaTextoNoCirculo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  diaInvisivel: {
    width: 40,
    height: 40,
  },
  botoesAcaoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  botaoAcao: {
    width: 270,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  botaoRoxo: {
    backgroundColor: "#2F1CA6",
  },
  botaoAzul: {
    backgroundColor: "#1797CD",
  },
  botaoAcaoTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
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
