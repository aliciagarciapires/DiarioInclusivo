import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../../components/Footer";

export default function Diario() {
  // --- ESTADOS DA TELA ---
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [data, setData] = useState("");
  const [complemento, setComplemento] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [diarios, setDiarios] = useState<any[]>([]);

  // O idDiscente ainda está estático, mas no futuro você pode pegar da navegação (ex: useLocalSearchParams)
  const idDiscente = 2;

  // Verifica o tipo de usuário toda vez que a tela entra em foco (Para a barra condicional)
  useFocusEffect(
    useCallback(() => {
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
      carregarTipoUsuario();
    }, [])
  );

  const handleSalvarDiario = async () => {
    if (!data) {
      Alert.alert("Atenção", "Por favor, selecione ou digite uma data.");
      return;
    }

    setLoading(true);

    try {
      // Busca o ID do usuário logado diretamente do AsyncStorage
      let idUsuarioLogado = await AsyncStorage.getItem("idUsuario");
      if (!idUsuarioLogado) {
        idUsuarioLogado = await AsyncStorage.getItem("id"); // Tenta buscar como 'id' caso 'idUsuario' não exista
      }

      const response = await fetch("http://192.168.0.102/DiarioInclusivo/src/app/criar_diario.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          complemento: complemento,
          idUsuario: idUsuarioLogado || 1, // Fallback para 1 caso não ache no storage
          idDiscente: idDiscente,
        }),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);

        if (result.sucesso) {
          Alert.alert("Sucesso", result.mensagem);
          setData("");
          setComplemento("");
          setModalVisivel(false);
        } else {
          Alert.alert("Erro", result.mensagem);
        }
      } catch (jsonError) {
        // Exibe o retorno bruto retornado pelo PHP para facilitar o diagnóstico do erro
        console.error("Erro no Parse JSON. Retorno bruto do servidor:", text);
        
        // Remove tags HTML caso o PHP tenha retornado uma página de erro
        const mensagemLimpa = text.replace(/<[^>]*>?/gm, '').trim();
        Alert.alert(
          "Erro do Servidor PHP", 
          `O servidor respondeu algo inválido:\n\n${mensagemLimpa.substring(0, 150)}...`
        );
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível se conectar ao servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const response = await fetch(
        `http://192.168.0.102/DiarioInclusivo/src/app/listar_diario.php?idDiscente=${idDiscente}`
      );
      const text = await response.text();
      
      try {
        const result = JSON.parse(text);
        if (result.sucesso) {
          setDiarios(result.dados);
          setModalHistoricoVisivel(true);
        } else {
          Alert.alert("Erro", result.mensagem || "Erro ao carregar histórico.");
        }
      } catch (e) {
        console.error("Erro JSON no Histórico:", text);
        Alert.alert("Erro de Resposta", "Resposta inválida ao buscar histórico.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível buscar o histórico.");
      console.error(error);
    } finally {
      setLoadingHistorico(false);
    }
  };

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
        <View style={styles.semanaContainer}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
            <Text key={i} style={styles.diaSemanaTexto}>
              {dia}
            </Text>
          ))}
        </View>

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
          <View style={styles.diaSelecionado}>
            <Text style={styles.diaTextoNoCirculo}>9</Text>
          </View>
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
          <View style={styles.diaInvisivel} />
          <View style={styles.diaInvisivel} />
        </View>
      </View>

      {/* Botões Grandes Centrais */}
      <View style={styles.botoesAcaoContainer}>
        <Pressable
          style={[styles.botaoAcao, styles.botaoRoxo]}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.botaoAcaoTexto}>Nova Entrada</Text>
        </Pressable>

        <Pressable
          style={[styles.botaoAcao, styles.botaoAzul]}
          onPress={handleBuscarHistorico}
          disabled={loadingHistorico}
        >
          <Text style={styles.botaoAcaoTexto}>
            {loadingHistorico ? "Carregando..." : "Histórico"}
          </Text>
        </Pressable>
      </View>

      {/* Modal para Nova Entrada */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Nova Entrada no Diário</Text>

            <TextInput
              style={styles.input}
              placeholder="Data (ex: 24/08/2026)"
              value={data}
              onChangeText={setData}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Anotações do diário (complemento)..."
              value={complemento}
              onChangeText={setComplemento}
              multiline={true}
              numberOfLines={4}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, styles.botaoCancelar]}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBotao, styles.botaoSalvar]}
                onPress={handleSalvarDiario}
                disabled={loading}
              >
                <Text style={styles.textoBotaoModal}>
                  {loading ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Histórico (Leitura / Read) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalHistoricoVisivel}
        onRequestClose={() => setModalHistoricoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitulo}>Histórico de Entradas</Text>

            {diarios.length === 0 ? (
              <Text style={styles.textoVazio}>
                Nenhum registro encontrado para este aluno.
              </Text>
            ) : (
              <FlatList
                data={diarios}
                keyExtractor={(item) => item.idDiario.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cardDiario}>
                    <Text style={styles.cardData}>{item.data}</Text>
                    <Text style={styles.cardTexto}>
                      {item.complemento || "Sem anotações."}
                    </Text>
                  </View>
                )}
              />
            )}

            <TouchableOpacity
              style={[styles.modalBotao, styles.botaoCancelar, { marginTop: 15 }]}
              onPress={() => setModalHistoricoVisivel(false)}
            >
              <Text style={styles.textoBotaoModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NAVEGAÇÃO E RODAPÉ CONDICIONAL --- */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          /* BARRA PARA O TIPO 2 (ADM) - Menu Padrão de Admin */
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              {/* O ÍCONE DESTACADO VAI AQUI (diarioD.png) */}
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
          </>
        ) : (
          /* BARRA PARA QUALQUER OUTRO TIPO (PROFESSOR) - Destaque no Diário */
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              {/* O ÍCONE DESTACADO VAI AQUI (diarioD.png) */}
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
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  mesTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  calendarioContainer: {
    marginTop: 40,
    alignItems: "center",
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
    lineHeight: 40,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBotao: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  botaoCancelar: {
    backgroundColor: "#ED3C3C",
  },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
  },
  textoBotaoModal: {
    color: "#FFF",
    fontWeight: "bold",
  },
  textoVazio: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
    fontSize: 14,
  },
  cardDiario: {
    backgroundColor: "#F5F2E8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2F1CA6",
  },
  cardData: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 5,
  },
  cardTexto: {
    fontSize: 14,
    color: "#333",
  },
});