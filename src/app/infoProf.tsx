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
  // Pega o ID passado via parÃ¢metro na rota
  const idRaw = params.id || params.idUsuario;
  const idFinal = Array.isArray(idRaw) ? idRaw[0] : idRaw;

  const [prof, setProf] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tipoUsuarioLogado, setTipoUsuarioLogado] = useState<number | null>(null);

  // Estados de ediÃ§Ã£o dos campos
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Sanitiza o e-mail em tempo real (sem espaÃ§os e em minÃºsculo)
  const tratarEmailInput = (texto: string) => {
    const emailFormatado = texto.toLowerCase().replace(/\s+/g, "");
    setEmail(emailFormatado);
  };

  // FunÃ§Ã£o para validar o formato do e-mail por Regex
  const validarEmail = (emailParaTestar: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(emailParaTestar);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Identifica o usuÃ¡rio logado no storage
        const idLogado = await AsyncStorage.getItem("idUsuario");
        if (idLogado) {
          const respLogado = await fetch(

            `http://192.168.0.107/DiarioInclusivo/src/app/getUsuario.php?id=${idLogado}`

          );
          const jsonLogado = await respLogado.json();
          if (jsonLogado.success && jsonLogado.dados?.tipo_de_usuario) {
            setTipoUsuarioLogado(Number(jsonLogado.dados.tipo_de_usuario));
          }
        }

        // 2. Valida o ID do professor recebido
        if (!idFinal) {
          Alert.alert("Erro", "ID do professor nÃ£o informado.");
          setLoading(false);
          return;
        }

        // 3. Busca os dados do professor selecionado
        const response = await fetch(

            `http://192.168.0.107/DiarioInclusivo/src/app/getUsuario.php?id=${idFinal}`

        );
        const json = await response.json();

        if (json.success) {
          setProf(json.dados);
          setNome(json.dados.nome || "");
          setEmail((json.dados.email || "").toLowerCase().replace(/\s+/g, ""));
          setSenha(json.dados.senha || "");
        } else {
          Alert.alert("Erro", json.message || "Professor nÃ£o encontrado.");
        }
      } catch (error) {
        Alert.alert("Erro", "Falha de conexÃ£o ao carregar dados do professor.");
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

    // 1. ValidaÃ§Ã£o de campos vazios
    if (!nomeTratado || !emailTratado) {
      Alert.alert("Aviso", "Nome e E-mail nÃ£o podem ficar vazios.");
      return;
    }

    // 2. ValidaÃ§Ã£o do formato do e-mail
    if (!validarEmail(emailTratado)) {
      Alert.alert(
        "E-mail InvÃ¡lido",
        "Por favor, digite um e-mail vÃ¡lido (ex: professor@exemplo.com)."
      );
      return;
    }

    try {
      setSalvando(true);
            const response = await fetch(

        "http://192.168.0.107/DiarioInclusivo/src/app/updateUsuario.php",

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
        Alert.alert("Sucesso", "InformaÃ§Ãµes do professor atualizadas!");
        setProf({ ...prof, nome: nomeTratado, email: emailTratado, senha });
        setEditando(false);
      } else {
        Alert.alert("Erro", json.message || "NÃ£o foi possÃ­vel salvar os dados.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar ExclusÃ£o",
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

        `http://192.168.0.107/DiarioInclusivo/src/app/deleteUsuario.php?id=${prof.idUsuario}`,

        { method: "GET" }
            );
      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", json.message || "Professor excluÃ­do com sucesso!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erro", json.message || "NÃ£o foi possÃ­vel excluir o professor.");
      }
    } catch (error) {
      Alert.alert("Erro", "NÃ£o foi possÃ­vel conectar ao servidor.");
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

          {/* CARD DE INFORMAÃ‡Ã•ES */}
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
                      {mostrarSenha ? prof.senha || "Sem senha" : "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"}
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

              {/* BOTÃƒO SALVAR */}
              {editando && (
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={salvarEdicao}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.textoSalvar}>Salvar AlteraÃ§Ãµes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.erro}>Dados do professor indisponÃ­veis.</Text>
          )}
        </View>
      </ScrollView>

      {/* RODAPÃ‰ E BARRA DE NAVEGAÃ‡ÃƒO FIXA */}
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
    flexDirection: "row",          // Alinha os botÃµes na horizontal
    justifyContent: "space-around",// Distribui igualmente o espaÃ§o entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",    
    height: 90,                    
    paddingBottom: 30,             
    borderTopWidth: 3,             
    borderTopColor: "#F5F2E8",     
    borderTopLeftRadius: 35,       
    borderTopRightRadius: 35,      
    position: "absolute",          // Fixa no rodapÃ©
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

