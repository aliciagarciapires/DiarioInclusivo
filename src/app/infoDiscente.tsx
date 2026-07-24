import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Footer from "../../components/Footer";

type Discente = {
  id?: number | string;
  nome: string;
  data_nascimento: string;
  grau_de_suporte: string;
};

export default function InfoDiscente() {
  const { id } = useLocalSearchParams();
  const [discente, setDiscente] = useState<Discente | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para controlar o modo de edição
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [grauSuporte, setGrauSuporte] = useState("");

  // Estado para controlar a abertura do select do Grau de Suporte
  const [abertoGrau, setAbertoGrau] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/getDiscente.php?id=${id}`);
        const json = await response.json();

        if (json.success) {
          setDiscente(json.dados);
          setNome(json.dados.nome || "");
          setDataNascimento(json.dados.data_nascimento || "");
          setGrauSuporte(String(json.dados.grau_de_suporte || ""));
        } else {
          Alert.alert("Erro", json.message);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };

    if (id) buscarDados();
  }, [id]);

  // Função para salvar as alterações feitas no discente
  const salvarAlteracoes = async () => {
    if (!nome.trim() || !dataNascimento.trim() || !grauSuporte.trim()) {
      Alert.alert("Aviso", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://192.168.0.103/DiarioInclusivo/src/app/updateDiscente.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          nome: nome,
          data_nascimento: dataNascimento,
          grau_de_suporte: grauSuporte,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setDiscente({
          ...discente,
          nome: nome,
          data_nascimento: dataNascimento,
          grau_de_suporte: grauSuporte,
        });
        setEditando(false);
        setAbertoGrau(false);
      } else {
        Alert.alert("Erro", json.message || "Não foi possível atualizar.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na conexão com o servidor ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir o alerta de confirmação de exclusão
  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar este discente?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: apagarDiscente 
        }
      ]
    );
  };

  // Função que faz a requisição para apagar no PHP
  const apagarDiscente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.103/DiarioInclusivo/src/app/deleteDiscente.php?id=${id}`);
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message, [
          { text: "OK", onPress: () => router.push("/discente") }
        ]);
      } else {
        Alert.alert("Erro", json.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
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
      <View style={styles.itens}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      </View>

      {discente ? (
        <View style={styles.card}>
          {/* Cabeçalho do Card */}
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
          
          {/* Data de Nascimento */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            {editando ? (
              <TextInput
                style={styles.input}
                value={dataNascimento}
                onChangeText={setDataNascimento}
                placeholder="AAAA-MM-DD"
              />
            ) : (
              <Text style={styles.value}>{discente.data_nascimento}</Text>
            )}
          </View>

          {/* Grau de Suporte com Select */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Grau de Suporte:</Text>
            {editando ? (
              <>
                <Pressable style={styles.select} onPress={() => setAbertoGrau(!abertoGrau)}>
                  <Text style={styles.selectTexto}>
                    {grauSuporte === "1"
                      ? "Grau 1"
                      : grauSuporte === "2"
                      ? "Grau 2"
                      : grauSuporte === "3"
                      ? "Grau 3"
                      : "Selecione o grau de suporte"}
                  </Text>
                </Pressable>

                {abertoGrau && (
                  <View style={styles.lista}>
                    <Pressable
                      style={styles.opcao}
                      onPress={() => {
                        setGrauSuporte("1");
                        setAbertoGrau(false);
                      }}
                    >
                      <Text style={{ color: "#2F1CA6" }}>Grau 1</Text>
                    </Pressable>

                    <Pressable
                      style={styles.opcao}
                      onPress={() => {
                        setGrauSuporte("2");
                        setAbertoGrau(false);
                      }}
                    >
                      <Text style={{ color: "#2F1CA6" }}>Grau 2</Text>
                    </Pressable>

                    <Pressable
                      style={styles.opcao}
                      onPress={() => {
                        setGrauSuporte("3");
                        setAbertoGrau(false);
                      }}
                    >
                      <Text style={{ color: "#2F1CA6" }}>Grau 3</Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.value}>Grau {discente.grau_de_suporte}</Text>
            )}
          </View>

          {/* Botão Salvar Alterações */}
          {editando && (
            <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAlteracoes}>
              <Text style={styles.textoBotaoSalvar}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text style={styles.erro}>Discente não encontrado.</Text>
      )}

      {/* Barra de Navegação */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
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
  value: { fontSize: 16, color: "#0b8cbf90", marginTop: 2 },
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
  inputTitulo: {
    flex: 1,
    marginRight: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  select: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF",
    marginTop: 5,
  },
  selectTexto: {
    color: "#2F1CA6",
    fontSize: 14,
    fontWeight: "500",
  },
  lista: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 8,
    backgroundColor: "#FFF",
    marginTop: 5,
    overflow: "hidden",
  },
  opcao: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2e1ca633",
  },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "flex-start", width: "100%", marginTop: -20 },
  logo: { width: 100, height: 100, alignSelf: "center" },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 12, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
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
    marginTop: 20   
  },
});