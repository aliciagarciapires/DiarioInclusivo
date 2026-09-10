import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
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

type Usuario = {
  idUsuario: number;
  nome: string;
  email: string;
  telefone: string;
  senha?: string;
  tipo_de_usuario?: number;
};

export default function InfoUsuario() {
  const params = useLocalSearchParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados do formulário / edição
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // --- VALIDAÇÕES E MÁSCARAS ---
  const tratarEmail = (text: string) => {
    const emailTratado = text.trim().toLowerCase();
    setEmail(emailTratado);
  };

  const validarEmail = (emailParaTestar: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(emailParaTestar);
  };

  const aplicarMascaraTelefone = (text: string) => {
    const limpo = text.replace(/\D/g, "");
    let formatado = limpo;

    if (limpo.length <= 2) {
      formatado = limpo.length > 0 ? `(${limpo}` : "";
    } else if (limpo.length <= 6) {
      formatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
    } else if (limpo.length <= 10) {
      formatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    } else {
      formatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
    }

    setTelefone(formatado);
  };

  // 💡 EXECUTA TODA VEZ QUE A TELA RECEBE FOCO
  useFocusEffect(
    useCallback(() => {
      const buscarDadosContaLogada = async () => {
        try {
          setLoading(true);
          const rawId = params.id || params.idUsuario;
          let idFinal: string | null = Array.isArray(rawId) ? rawId[0] : rawId;

          if (!idFinal) {
            idFinal = await AsyncStorage.getItem("idUsuario");
          }

          if (!idFinal) {
            Alert.alert("Aviso", "Nenhum usuário logado encontrado.");
            setLoading(false);
            return;
          }

          const response = await fetch(`http://172.20.10.4/DiarioInclusivo/src/app/getUsuario.php?id=${idFinal}`);

          const json = await response.json();

          if (json.success) {
            setUsuario(json.dados);
            // Preenche os campos com os dados carregados
            setNome(json.dados.nome || "");
            setEmail(json.dados.email || "");
            setTelefone(json.dados.telefone || "");
            setSenha(json.dados.senha || "");
          } else {
            Alert.alert("Erro", json.message);
          }
        } catch (error) {
          Alert.alert("Erro", "Não foi possível carregar as informações do servidor.");
        } finally {
          setLoading(false);
        }
      };

      buscarDadosContaLogada();
    }, [params.id, params.idUsuario])
  );

  const salvarEdicao = async () => {
    if (!usuario) return;

    // --- VERIFICAÇÃO DE CAMPOS ---
    if (!nome.trim()) {
      Alert.alert("Aviso", "O nome não pode ficar em branco.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Aviso", "O e-mail não pode ficar em branco.");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Aviso", "Por favor, insira um e-mail válido.");
      return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
      Alert.alert("Aviso", "Por favor, insira um número de telefone/celular válido com DDD.");
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch("http://172.20.10.4/DiarioInclusivo/src/app/updateUsuario.php", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: usuario.idUsuario,
          nome: nome.trim(),
          email: email,
          telefone: telefone,
          senha: senha
        })
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert("Sucesso", "Informações atualizadas com sucesso!");
        setUsuario({ ...usuario, nome: nome.trim(), email, telefone, senha });
        setEditando(false);
      } else {
        Alert.alert("Erro", json.message || "Erro ao salvar alterações.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações no servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar a sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: apagarUsuario }
      ]
    );
  };

  const apagarUsuario = async () => {
    try {
      setLoading(true);
      let idParaDeletar = usuario?.idUsuario;

      if (!idParaDeletar) {
        const idSalvo = await AsyncStorage.getItem("idUsuario");
        idParaDeletar = idSalvo ? Number(idSalvo) : undefined;
      }

      if (!idParaDeletar) {
        Alert.alert("Erro", "Não foi possível identificar o ID do usuário.");
        setLoading(false);
        return;
      }

      const response = await fetch(

        `http://172.20.10.4/DiarioInclusivo/src/app/deleteUsuario.php?id=${idParaDeletar}`,

        { method: "GET" }
      );

      const json = await response.json();

      if (json.success) {
        await AsyncStorage.removeItem("idUsuario");
        Alert.alert("Sucesso", json.message || "Conta excluída com sucesso!", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      } else {
        Alert.alert("Erro", json.message || "Não foi possível excluir a conta.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
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

  const tipoUsuario = Number(usuario?.tipo_de_usuario);

  return (
    <View style={styles.container}>
      
      <View style={styles.itens}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      </View>

      {usuario ? (
        <View style={styles.card}>
          {/* Cabeçalho no padrão Discente/Professor */}
          <View style={styles.cardHeader}>
            {editando ? (
              <TextInput
                style={[styles.input, styles.inputTitulo]}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do usuário"
              />
            ) : (
              <Text style={styles.tituloHeader}>{usuario.nome}</Text>
            )}

            <View style={styles.acoesHeader}>
              <TouchableOpacity onPress={() => setEditando(!editando)} style={styles.botaoAcao}>
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

          {/* CAMPO E-MAIL */}
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>E-mail:</Text>
            </View>
            {editando ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={tratarEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : (
              <Text style={styles.value}>{usuario.email}</Text>
            )}
          </View>

          {/* CAMPO TELEFONE */}
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Telefone:</Text>
            </View>
            {editando ? (
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={aplicarMascaraTelefone}
                keyboardType="numeric"
                maxLength={15}
              />
            ) : (
              <Text style={styles.value}>{usuario.telefone || "Não informado"}</Text>
            )}
          </View>

          {/* CAMPO SENHA */}
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Senha:</Text>
            </View>
            <View style={styles.senhaContainer}>
              {editando ? (
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!mostrarSenha}
                />
              ) : (
                <Text style={styles.value}>
                  {mostrarSenha ? usuario.senha : "••••••••"}
                </Text>
              )}
              <TouchableOpacity 
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.botaoOlho}
              >
                <Ionicons 
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#2F1CA6" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÃO SALVAR (Exibido apenas quando estiver editando) */}
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
        <Text style={styles.erro}>Dados do usuário indisponíveis.</Text>
      )}

      {/* Menu Inferior Condicional por Tipo de Usuário */}
      <Footer children={undefined} />
      
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === 1 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoUsuario === 2 && (
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
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoUsuario === 3 && (
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
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2E8", paddingHorizontal: 20, paddingTop: 5 },
  card: { backgroundColor: "#F5F2E8", borderRadius: 20, padding: 20, elevation: 5, borderWidth: 1, borderColor: "#2F1CA6", marginTop: 15 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tituloHeader: { fontSize: 20, fontWeight: "bold", color: "#2F1CA6", flex: 1, textAlign: "left" },
  acoesHeader: { flexDirection: "row", alignItems: "center" },
  botaoAcao: { padding: 5, marginLeft: 8 },
  divider: { height: 2, backgroundColor: "#2F1CA6", marginVertical: 12, borderRadius: 1 },
  infoRow: { marginBottom: 12 },
  labelContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  label: { fontSize: 12, color: "#2F1CA6", fontWeight: "bold", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#0b8cbf90" },
  input: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    color: "#2F1CA6",
    backgroundColor: "#FFF"
  },
  inputTitulo: {
    flex: 1,
    marginRight: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  senhaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  botaoOlho: { padding: 4, marginLeft: 8 },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10
  },
  textoSalvar: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
  erro: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  itens: { justifyContent: "flex-start", width: "100%", marginTop: -15 },
  logo: { width: 90, height: 90, alignSelf: "center" },
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
  },
});
