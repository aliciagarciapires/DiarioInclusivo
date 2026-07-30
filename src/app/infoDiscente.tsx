import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

interface Responsavel {
  id: number;
  nome: string;
}

type Discente = {
  id?: number | string;
  nome: string;
  data_nascimento: string;
  grau_de_suporte: string;
  nomes_responsaveis?: string;
  ids_responsaveis?: number[];
};

export default function InfoDiscente() {
  const { id } = useLocalSearchParams();
  const [discente, setDiscente] = useState<Discente | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de edição do discente
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [grau, setGrau] = useState("Selecione o grau de suporte");

  // Estados dos Responsáveis
  const [editandoResponsaveis, setEditandoResponsaveis] = useState(false);
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<Responsavel[]>([]);
  const [listaResponsaveis, setListaResponsaveis] = useState<Responsavel[]>([]);
  const [busca, setBusca] = useState("");

  // Estado do Dropdown de Grau
  const [abertoGrau, setAbertoGrau] = useState(false);

  useEffect(() => {
    if (id) carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Busca todos os responsáveis disponíveis
      const resResp = await fetch("http://192.168.0.103/DiarioInclusivo/src/app/buscar_responsaveis.php");
      const dadosResp = await resResp.json();
      const listaCompleta: Responsavel[] = Array.isArray(dadosResp) ? dadosResp : [];
      setListaResponsaveis(listaCompleta);

      // 2. Busca dados do discente
      const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/getDiscente.php?id=${id}`);
      const json = await response.json();

      if (json.success) {
        const d = json.dados;
        setDiscente(d);
        setNome(d.nome || "");
        setDataNasc(d.data_nascimento || "");
        setGrau(d.grau_de_suporte ? String(d.grau_de_suporte) : "Selecione o grau de suporte");

        // Associa os IDs já cadastrados aos objetos da lista de responsáveis
        if (d.ids_responsaveis && Array.isArray(d.ids_responsaveis)) {
          const vinculados = listaCompleta.filter((r) => d.ids_responsaveis.includes(Number(r.id)));
          setResponsaveisSelecionados(vinculados);
        }
      } else {
        Alert.alert("Erro", json.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Alternar seleção de responsáveis
  const alternarSelecao = (item: Responsavel) => {
    const jaSelecionado = responsaveisSelecionados.some((r) => r.id === item.id);
    if (jaSelecionado) {
      setResponsaveisSelecionados(responsaveisSelecionados.filter((r) => r.id !== item.id));
    } else {
      setResponsaveisSelecionados([...responsaveisSelecionados, item]);
    }
  };

  // Filtro de busca
  const listaSegura = Array.isArray(listaResponsaveis) ? listaResponsaveis : [];
  const filtrados = listaSegura.filter((r) => {
    if (!busca || busca.trim() === "") return true;
    return r.nome ? r.nome.toLowerCase().includes(busca.toLowerCase()) : false;
  });

  // Salvar edições
  const salvarAlteracoes = async () => {
    if (!nome.trim() || !dataNasc.trim() || grau === "Selecione o grau de suporte") {
      Alert.alert("Erro", "Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (responsaveisSelecionados.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um responsável.");
      return;
    }

    let dataFormatada = dataNasc;
    if (dataNasc.includes("/")) {
      const partes = dataNasc.split("/");
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
      }
    }

    const idsResponsaveis = responsaveisSelecionados.map((r) => r.id);

    try {
      setLoading(true);
      const response = await fetch("http://192.168.0.103/DiarioInclusivo/src/app/updateDiscente.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          nome: nome,
          dataNasc: dataFormatada,
          grau: grau,
          idsResponsaveis: idsResponsaveis,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setEditando(false);
        setEditandoResponsaveis(false);
        setAbertoGrau(false);
        carregarDados();
      } else {
        Alert.alert("Erro", json.message || "Não foi possível atualizar.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha de conexão ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este discente? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: deletarDiscente },
      ]
    );
  };

  const deletarDiscente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/deleteDiscente.php?id=${id}`, {
        method: "DELETE",
      });
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message, [{ text: "OK", onPress: () => router.push("/discente") }]);
      } else {
        Alert.alert("Erro", json.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao excluir discente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2F1CA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.itens}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        </View>

        {discente ? (
          <View style={styles.card}>
            {/* Cabeçalho */}
            <View style={styles.cardHeader}>
              {editando ? (
                <TextInput
                  style={[styles.input, styles.inputTitulo]}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Nome do discente"
                />
              ) : (
                <Text style={styles.titulo}>{discente.nome}</Text>
              )}

              <View style={styles.acoesHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setEditando(!editando);
                    setEditandoResponsaveis(false);
                    setAbertoGrau(false);
                  }}
                  style={styles.botaoAcao}
                >
                  <Ionicons
                    name={editando ? "close-circle-outline" : "create-outline"}
                    size={24}
                    color="#2F1CA6"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={confirmarExclusao} style={styles.botaoAcao}>
                  <Ionicons name="trash-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* RESPONSÁVEIS */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Responsável(is):</Text>

              {/* Tags dos Selecionados (Mostra SEMPRE, em modo leitura ou edição) */}
              <View style={styles.containerTags}>
                {responsaveisSelecionados.length > 0 ? (
                  responsaveisSelecionados.map((item) => (
                    <View key={item.id} style={styles.tag}>
                      <Text style={styles.tagTexto}>{item.nome}</Text>
                      {editando && (
                        <Pressable onPress={() => alternarSelecao(item)}>
                          <Text style={styles.tagFechar}> ✕</Text>
                        </Pressable>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.value}>
                    {discente.nomes_responsaveis || "Nenhum responsável vinculado"}
                  </Text>
                )}
              </View>

              {/* Opções extras visíveis APENAS no modo de Edição */}
              {editando && (
                <>
                  {editandoResponsaveis ? (
                    <Input
                      placeholder="Digite para buscar responsável..."
                      placeholderTextColor="#0b8cbfd1"
                      value={busca}
                      onChangeText={setBusca}
                      autoFocus
                    />
                  ) : (
                    <Pressable style={styles.select} onPress={() => setEditandoResponsaveis(true)}>
                      <Text style={styles.selectTexto}>
                        + Adicionar ou remover responsáveis
                      </Text>
                    </Pressable>
                  )}

                  {/* Lista de busca e seleção */}
                  {editandoResponsaveis && (
                    <View style={styles.lista}>
                      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                        {filtrados.length > 0 ? (
                          filtrados.map((item) => {
                            const selecionado = responsaveisSelecionados.some((r) => r.id === item.id);
                            return (
                              <Pressable
                                key={item.id}
                                style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                                onPress={() => alternarSelecao(item)}
                              >
                                <Text
                                  style={{
                                    color: selecionado ? "#FFF" : "#2F1CA6",
                                    fontWeight: selecionado ? "bold" : "normal",
                                  }}
                                >
                                  {selecionado ? `✓ ${item.nome}` : item.nome}
                                </Text>
                              </Pressable>
                            );
                          })
                        ) : (
                          <Text style={{ padding: 15, color: "#0b8cbf5b" }}>Nenhum responsável encontrado</Text>
                        )}
                      </ScrollView>
                      <Pressable
                        style={styles.botaoConcluir}
                        onPress={() => {
                          setEditandoResponsaveis(false);
                          setBusca("");
                        }}
                      >
                        <Text style={styles.textoConcluir}>Concluir Seleção</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* DATA DE NASCIMENTO */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Data de Nascimento:</Text>
              {editando ? (
                <TextInput
                  style={styles.input}
                  value={dataNasc}
                  onChangeText={setDataNasc}
                  placeholder="DD/MM/AAAA"
                />
              ) : (
                <Text style={styles.value}>{discente.data_nascimento}</Text>
              )}
            </View>

            {/* GRAU DE SUPORTE */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Grau de Suporte:</Text>
              {editando ? (
                <>
                  <Pressable style={styles.select} onPress={() => setAbertoGrau(!abertoGrau)}>
                    <Text style={styles.selectTexto}>
                      {grau === "1" ? "Grau 1" : grau === "2" ? "Grau 2" : grau === "3" ? "Grau 3" : "Selecione o grau de suporte"}
                    </Text>
                  </Pressable>

                  {abertoGrau && (
                    <View style={styles.lista}>
                      {["1", "2", "3"].map((g) => (
                        <Pressable
                          key={g}
                          style={styles.opcao}
                          onPress={() => {
                            setGrau(g);
                            setAbertoGrau(false);
                          }}
                        >
                          <Text style={{ color: "#2F1CA6" }}>Grau {g}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.value}>Grau {discente.grau_de_suporte}</Text>
              )}
            </View>

            {/* BOTÃO SALVAR */}
            {editando && (
              <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAlteracoes}>
                <Text style={styles.textoBotaoSalvar}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.erro}>Discente não encontrado.</Text>
        )}
      </ScrollView>

      {/* RODAPÉ E MENU */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/homeD.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Diário</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
          <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Rotina</Text>
        </Pressable>

        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2E8", paddingHorizontal: 20, paddingTop: 5 },
  card: { backgroundColor: "#F5F2E8", borderRadius: 20, padding: 25, elevation: 5, borderWidth: 1, borderColor: "#2F1CA6", marginTop: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#2F1CA6", flex: 1, textAlign: "left" },
  acoesHeader: { flexDirection: "row", alignItems: "center" },
  botaoAcao: { padding: 5, marginLeft: 8 },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 15, borderRadius: 1 },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#0b8cbf", marginTop: 2, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    marginTop: 4,
    backgroundColor: "#FFF",
    color: "#333",
  },
  inputTitulo: { flex: 1, marginRight: 10, fontSize: 18, fontWeight: "bold" },
  select: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 50, padding: 12, backgroundColor: "#F5F2E8", marginTop: 8 },
  selectTexto: { color: "#0b8cbfd1", fontSize: 14, textAlign: "center", fontWeight: "600" },
  lista: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 10, backgroundColor: "#F5F2E8", marginTop: 5, overflow: "hidden" },
  opcao: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#2e1ca667" },
  opcaoSelecionada: { backgroundColor: "#2F1CA6" },
  containerTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 5, marginBottom: 5 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#2F1CA6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  tagTexto: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  tagFechar: { color: "#FF6B6B", fontWeight: "bold", fontSize: 14 },
  botaoConcluir: { backgroundColor: "#0B8CBF", padding: 12, alignItems: "center" },
  textoConcluir: { color: "#FFF", fontWeight: "bold" },
  botaoSalvar: { backgroundColor: "#2F1CA6", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 15 },
  textoBotaoSalvar: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "flex-start", width: "100%", marginTop: -13 },
  logo: { width: 100, height: 100, alignSelf: "center" },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 12, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
  iconeCustom: { width: 80, height: 80, borderRadius: 15, resizeMode: "cover" },
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