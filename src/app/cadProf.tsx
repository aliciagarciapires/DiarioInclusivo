import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

export default function CadProf() {
  const [tipoConta, setTipoConta] = useState("3");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Estados para alternar a exibição da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Trata o e-mail removendo todos os espaços e transformando em minúsculas em tempo real
  const tratarEmailInput = (texto: string) => {
    const emailFormatado = texto.toLowerCase().replace(/\s+/g, "");
    setEmail(emailFormatado);
  };

  // Validação do formato de e-mail por regex
  const validarEmail = (emailParaTestar: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(emailParaTestar);
  };

  const cadastrarProfessor = async () => {
    const emailTratado = email.toLowerCase().replace(/\s+/g, "");
    const nomeTratado = nome.trim();

    // 1. Validação básica
    if (!nomeTratado || !emailTratado || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    // 2. Validação de E-mail
    if (!validarEmail(emailTratado)) {
      Alert.alert("Erro", "Por favor, digite um e-mail válido");
      return;
    }

    // 3. Validação de Senha
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    // 4. Envio para o Backend
    try {
      const response = await fetch(
        "http://172.20.10.4/DiarioInclusivo/src/app/cadProf.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nomeTratado,
            email: emailTratado,
            senha,
            tipoConta,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.id) {
          await AsyncStorage.setItem("idUsuario", String(data.id));
        }
        Alert.alert("Sucesso", "Cadastro realizado!");
        router.push("/professores");
      } else {
        Alert.alert("Erro do Servidor", data.message || "Erro ao cadastrar.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/** LOGO */}
          <View style={styles.itens}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          {/** FORMULÁRIO */}
          <View style={styles.form}>
            <Text style={styles.title}>Cadastro do Professor</Text>

            <Text style={styles.textoInput}>Nome Completo:</Text>
            <Input
              placeholder="Nome Completo"
              placeholderTextColor="#0b8cbfd1"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.textoInput}>E-mail:</Text>
            <Input
              placeholder="professor@email.com"
              placeholderTextColor="#0b8cbfd1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={tratarEmailInput}
            />

            <Text style={styles.textoInput}>Senha:</Text>
            <View style={styles.inputComIcone}>
              <Input
                placeholder="**********"
                placeholderTextColor="#0b8cbfd1"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                style={styles.botaoOlho}
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#2F1CA6"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.textoInput}>Confirmar Senha:</Text>
            <View style={styles.inputComIcone}>
              <Input
                placeholder="**********"
                placeholderTextColor="#0b8cbfd1"
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                style={styles.botaoOlho}
                onPress={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
              >
                <Ionicons
                  name={
                    mostrarConfirmarSenha ? "eye-off-outline" : "eye-outline"
                  }
                  size={22}
                  color="#2F1CA6"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.botaoContainer}>
              <Button label="Cadastrar" onPress={cadastrarProfessor} />
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer>
        <Text style={styles.textoRodape}>Diário Inclusivo.</Text>
      </Footer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    padding: 32,
  },
  itens: {
    justifyContent: "center",
    width: "100%",
    marginTop: -50,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  form: {
    marginTop: -10,
    gap: 5,
    width: "100%",
  },
  textoInput: {
    fontSize: 15,
    color: "#2F1CA6",
    fontWeight: "bold",
    marginLeft: 8,
    marginTop: 8,
  },
  inputComIcone: {
    position: "relative",
    justifyContent: "center",
  },
  botaoOlho: {
    position: "absolute",
    right: 15,
    zIndex: 10,
  },
  botaoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginLeft: 8,
    marginTop: 10,
  },
  textoRodape: {
    color: "#0B8CBF",
    fontSize: 12,
    fontWeight: "500",
  },
});
