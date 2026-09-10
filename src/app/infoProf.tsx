import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Footer from "../../components/Footer";

type Professor = {
  idUsuario: number;
  nome: string;
  email: string;
  senha?: string;
};

export default function InfoProf() {
  const params = useLocalSearchParams();
  // Pega o ID passado via parâmetro na rota
  const idRaw = params.id || params.idUsuario;
  const idFinal = Array.isArray(idRaw) ? idRaw[0] : idRaw;

  const [prof, setProf] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tipoUsuarioLogado, setTipoUsuarioLogado] = useState<number | null>(null);

  // Estados de edição dos campos
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Sanitiza o e-mail em tempo real (sem espaços e em minúsculo)
  const tratarEmailInput = (texto: string) => {
    const emailFormatado = texto.toLowerCase().replace(/\s+/g, "");
    setEmail(emailFormatado);
  };

  // Função para validar o formato do e-mail por Regex
  const validarEmail = (emailParaTestar: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(emailParaTestar);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Identifica o usuário logado no storage
        const idLogado = await AsyncStorage.getItem("idUsuario");
        if (idLogado) {
          const respLogado = await fetch(

            `https://diarioinclusivo.linceonline.com.br/getUsuario.php?id=${idLogado}`

          );
          const jsonLogado = await respLogado.json();
          if (jsonLogado.success && jsonLogado.dados?.tipo_de_usuario) {
            setTipoUsuarioLogado(Number(jsonLogado.dados.tipo_de_usuario));
          }
        }

        // 2. Valida o ID do professor recebido
        if (!idFinal) {
          Alert.alert("Erro", "ID do professor não informado.");
          setLoading(false);
          return;
        }

        // 3. Busca os dados do professor selecionado
        const response = await fetch(

            `https://diarioinclusivo.linceonline.com.br/getUsuario.php?id=${idFinal}`

        );
        const json = await response.json();

        if (json.success) {
          setProf(json.dados);
          setNome(json.dados.nome || "");
          setEmail((json.dados.email || "").toLowerCase().replace(/\s+/g, ""));
          setSenha(json.dados.senha || "");
        } else {
          Alert.alert("Erro", json.message || "Professor não encontrado.");
        }
      } catch (error) {
        Alert.alert("Erro", "Falha de conexão ao carregar dados do professor.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [idFinal]);

  const salvarEdicao = async () => {
    if (!prof) return;

    const emailTratado = email.toLowerCase().replace(/\s+/g, "");
    const nomeTratado = nome.trim();

    // 1. Validação de campos vazios
    if (!nomeTratado || !emailTratado) {
      Alert.alert("Aviso", "Nome e E-mail não podem ficar vazios.");
      return;
    }

    // 2. Validação do formato do e-mail
    if (!validarEmail(emailTratado)) {
      Alert.alert(
        "E-mail Inválido",
        "Por favor, digite um e-mail válido (ex: professor@exemplo.com)."
      );
      return;
    }

    try {
      setSalvando(true);
            const response = await fetch(

        "https://diarioinclusivo.linceonline.com.br/updateUsuario.php",

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idUsuario: prof.idUsuario,
            nome: nomeTratado,
            email: emailTratado,
            senha,
          }),
        }
      );

      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", "Informações do professor atualizadas!");
        setProf({ ...prof, nome: nomeTratado, email: emailTratado, senha });
        setEditando(false);
      } else {
        Alert.alert("Erro", json.message || "Não foi possível salvar os dados.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar o registro deste professor?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: apagarProfessor },
      ]
    );
  };

  const apagarProfessor = async () => {
    try {
      if (!prof?.idUsuario) return;
      setLoading(true);

            const response = await fetch(

        `https://diarioinclusivo.linceonline.com.br/deleteUsuario.php?id=${prof.idUsuario}`,

        { method: "GET" }
            );
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message || "Professor excluído com sucesso!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erro", json.message || "Não foi possível excluir o professor.");
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* LOGO */}
          <View style={styles.itens}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          {/* CARD DE INFORMAÇÕES */}
          {prof ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {editando ? (
                  <TextInput
                    style={[styles.input, styles.inputTitulo]}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Nome do professor"
                  />
                ) : (
                  <Text style={styles.titulo}>{prof.nome}</Text>
                )}

                <View style={styles.acoesHeader}>
                  <TouchableOpacity
                    onPress={() => setEditando(!editando)}
                    style={styles.botaoAcao}
                  >
                    <Ionicons
                      name={editando ? "close-circle-outline" : "create-outline"}
                      size={24}
                      color="#2F1CA6"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmarExclusao}
                    style={styles.botaoAcao}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              {/* CAMPO E-MAIL */}
              <View style={styles.infoRow}>
                <Text style={styles.label}>E-mail:</Text>
                {editando ? (
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={tratarEmailInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                ) : (
                  <Text style={styles.value}>{prof.email}</Text>
                )}
              </View>

              {/* CAMPO SENHA */}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Senha:</Text>
                <View style={styles.senhaContainer}>
                  {editando ? (
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry={!mostrarSenha}
                      autoCapitalize="none"
                    />
                  ) : (
                    <Text style={styles.value}>
                      {mostrarSenha ? prof.senha || "Sem senha" : "••••••••"}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    style={styles.botaoOlho}
                  >
                    <Ionicons
                      name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#2F1CA6"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* BOTÃO SALVAR */}
              {editando && (
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={salvarEdicao}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.textoSalvar}>Salvar Alterações</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.erro}>Dados do professor indisponíveis.</Text>
          )}
        </View>
      </ScrollView>

      {/* RODAPÉ E BARRA DE NAVEGAÇÃO FIXA */}
      <Footer children={undefined} />
                                      <View style={styles.barraMenuGeral}>
                                      
                                      <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                                        <Image source={require("../../assets/images/profD.png")} style={styles.iconeCustom} />
                                        <Text style={styles.tabLabel}>Prof.</Text>
                                      </Pressable>
                              
                                      <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                                        <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
                                        <Text style={styles.tabLabel}>Discentes</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    padding: 20,
  },
  itens: {
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "#F5F2E8",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2F1CA6",
    marginTop: 20,
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F1CA6",
    flex: 1,
  },
  inputTitulo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  acoesHeader: {
    flexDirection: "row",
    gap: 10,
  },
  botaoAcao: {
    padding: 4,
  },
  divider: {
    height: 2,
    backgroundColor: "#2F1CA6",
    marginVertical: 15,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#2F1CA6",
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#0b8cbfd1",
  },
  input: {
    borderWidth: 1,
    borderColor: "#0B8CBF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoOlho: {
    padding: 6,
    marginLeft: 8,
  },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  textoSalvar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  erro: {
    textAlign: "center",
    marginTop: 50,
    color: "red",
    fontSize: 16,
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
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
  },
  tabLabel: {
    fontSize: 12,
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
});

