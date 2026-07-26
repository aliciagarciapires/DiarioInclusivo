import { Ionicons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");

interface Atividade {
  id: number;
  nome: string;
  inicio: string;
  fim: string;
}

interface Rotina {
  idRotina: number;
  nome: string;
  atividades: Atividade[];
}

export default function VisualizarRotina() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [tarefasConcluidas, setTarefasConcluidas] = useState<string[]>([]);

  // Atualize com o IP atual da sua máquina
  const IP_SERVIDOR = "192.168.1.59";

  const carregarRotinasDoBanco = async () => {
    try {
      setCarregando(true);
      const idUsuario = 1;
      const URL_API = `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/listar_rotinas.php?idUsuario=${idUsuario}&t=${new Date().getTime()}`;

      const resposta = await fetch(URL_API);
      const resultado = await resposta.json();

      if (resultado.sucesso && Array.isArray(resultado.dados)) {
        setRotinas(resultado.dados);
      } else {
        setRotinas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar rotinas:", error);
      Alert.alert("Erro", "Não foi possível carregar as rotinas do servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const confirmarExclusaoRotina = (idRotina: number) => {
    Alert.alert(
      "Excluir Rotina",
      "Tem certeza que deseja apagar esta rotina?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await fetch(
                `http://${IP_SERVIDOR}/DiarioInclusivo/src/app/deletar_rotina.php`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idRotina: idRotina }),
                }
              );

              const resultado = await resposta.json();

              if (resultado.sucesso) {
                Alert.alert("Sucesso", "Rotina excluída com sucesso!");
                carregarRotinasDoBanco();
              } else {
                Alert.alert("Erro", resultado.mensagem || "Erro ao excluir rotina.");
              }
            } catch (error) {
              Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      carregarRotinasDoBanco();
    }, [])
  );

  const alternarCheck = (idUnico: string) => {
    if (tarefasConcluidas.includes(idUnico)) {
      setTarefasConcluidas(tarefasConcluidas.filter((item) => item !== idUnico));
    } else {
      setTarefasConcluidas([...tarefasConcluidas, idUnico]);
    }
  };

  return (
    <View style={styles.container}>
      {/* TOPO */}
      <View style={styles.areaCriarTopo}>
        <Text style={styles.subtitulo}>Minhas rotinas</Text>
      </View>

      {carregando ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#2F1CA6" />
          <Text style={{ marginTop: 10, color: "#2F1CA6" }}>Buscando rotinas...</Text>
        </View>
      ) : (
        <FlatList
          data={rotinas}
          keyExtractor={(item) => item.idRotina.toString()}
          style={styles.lista}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>
              Nenhuma rotina encontrada. Crie uma nova rotina abaixo!
            </Text>
          }
          renderItem={({ item: rotinaItem }) => (
            <View style={styles.cardRotina}>
              {/* CABEÇALHO DA ROTINA (NOME + AÇÕES) */}
              <View style={styles.headerCard}>
                <Text style={styles.nomeRotina}>{rotinaItem.nome}</Text>
                
                <View style={styles.acoesContainer}>
                 {/* Botão Editar (Abre a tela de edição passando o ID) */}
                  <TouchableOpacity
                    onPress={() => router.push(`/editarRotina?idRotina=${rotinaItem.idRotina}` as any)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#0B8CBF" />
                  </TouchableOpacity>

                  {/* Botão Apagar */}
                  <TouchableOpacity
                    onPress={() => confirmarExclusaoRotina(rotinaItem.idRotina)}
                    style={styles.iconeAcao}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ATIVIDADES */}
              {rotinaItem.atividades && rotinaItem.atividades.length > 0 ? (
                rotinaItem.atividades.map((atividade, idx) => {
                  const idUnicoTask = `${rotinaItem.idRotina}-${atividade.id}-${idx}`;
                  const isMarcada = tarefasConcluidas.includes(idUnicoTask);

                  return (
                    <TouchableOpacity
                      key={idUnicoTask}
                      style={styles.itemContainer}
                      onPress={() => alternarCheck(idUnicoTask)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.blocoEsquerdo}>
                        <View style={styles.checkbox}>
                          {isMarcada && (
                            <Ionicons name="checkmark" size={14} color="#2F1CA6" />
                          )}
                        </View>
                        <Text style={[styles.textoNome, isMarcada && styles.textoRiscado]}>
                          {atividade.nome}
                        </Text>
                      </View>

                      <Text style={[styles.textoHora, isMarcada && styles.textoRiscado]}>
                        {atividade.inicio ? atividade.inicio.substring(0, 5) : "00:00"} -{" "}
                        {atividade.fim ? atividade.fim.substring(0, 5) : "00:00"}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.semAtividades}>Sem atividades nesta rotina.</Text>
              )}
            </View>
          )}
        />
      )}

      {/* BOTÃO ADICIONAR ROTINA */}
      <View style={styles.botaoAdicionarContainer}>
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => router.push("/criarRotina")}
        >
          <Text style={styles.adicionar}>Adicionar nova rotina +</Text>
        </TouchableOpacity>
      </View>

      <Footer children={undefined} />

      {/* MENU NAVEGAÇÃO */}
      <View style={styles.barraMenuGeral}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  areaCriarTopo: {
    alignItems: "center",
    marginBottom: 15,
  },
  subtitulo: {
    color: "#0477BF",
    fontWeight: "bold",
    fontSize: 20,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lista: {
    width: width - 40,
  },
  textoVazio: {
    textAlign: "center",
    color: "#0B8CBF",
    marginTop: 40,
    fontSize: 16,
  },
  cardRotina: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
    marginBottom: 10,
  },
  nomeRotina: {
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
  },
  acoesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconeAcao: {
    padding: 6,
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  blocoEsquerdo: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#2F1CA6",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textoNome: {
    fontSize: 16,
    color: "#0B8CBF",
    fontWeight: "500",
  },
  textoHora: {
    fontSize: 14,
    color: "#0B8CBF",
  },
  textoRiscado: {
    color: "#7CBF17",
    textDecorationLine: "line-through",
  },
  semAtividades: {
    fontSize: 14,
    color: "#888888",
    fontStyle: "italic",
    marginVertical: 6,
  },
  botaoAdicionarContainer: {
    position: "absolute",
    bottom: 95,
    alignSelf: "center",
    zIndex: 10,
  },
  botaoAdicionar: {
    width: 260,
    height: 45,
    backgroundColor: "#2F1CA6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  adicionar: {
    color: "#F5F2E8",
    fontWeight: "bold",
    fontSize: 16,
  },
  barraMenuGeral: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 85,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 2,
  },
  iconeCustom: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});