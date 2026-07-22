import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// 1. Importação necessária
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

export default function CadResp() {

    const [tipoConta, setTipoConta] = useState("1"); 
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

const cadastrarResponsavel = async () => {
    // 1. Validações locais
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert("Aviso", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("http://192.168.0.103/DiarioInclusivo/src/app/cadResp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoConta: tipoConta,
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          senha: senha,
          confirmarSenha: confirmarSenha
        })
      });

      // Pega o texto bruto retornado do PHP
      const textoBruto = await response.text();
      console.log("--- RESPOSTA BRUTA DO PHP ---");
      console.log(textoBruto);
      console.log("-----------------------------");

      // Tenta converter para JSON com segurança
      let data;
      try {
        data = JSON.parse(textoBruto);
      } catch (e) {
        // Se falhou o parse, o PHP mandou um erro de código / HTML!
        Alert.alert("Erro no PHP", "O servidor respondeu com um erro textual:\n\n" + textoBruto.substring(0, 300));
        return;
      }

      Alert.alert(data.sucesso ? "Sucesso" : "Aviso", data.mensagem);

      if (data.sucesso) {
        router.push("/discenteResp");
      }

    } catch (error) {
      console.log("ERRO DE REDE:", error);
      Alert.alert("Erro", "Falha de conexão com o servidor.");
    }
  };
    return(
        <View style={styles.containerPrincipal}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.itens}>
                    <View style={styles.itens}>
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={styles.logo} />
                    </View>
                    
                    <Text style={styles.subtitulo}>
                        Selecione a opção de cadastro
                    </Text>

                    <View style={styles.selectContainer}>
                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "1" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("1")}
                        > 
                            <Text style={styles.textoSelect}>Responsável</Text>
                        </Pressable>

                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "2" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("2")}
                        > 
                            <Text style={styles.textoSelect}>Administrador</Text>
                        </Pressable>
                    </View>

                    {tipoConta === "1" ? ( 
                        <View style={styles.form}>
                            <Text style={styles.textoInput}>Nome Completo:</Text>
                            <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbfd1" value={nome} onChangeText={setNome} />

                            <Text style={styles.textoInput}>E-mail:</Text>
                            <Input placeholder="usuario@email.com" value={email} onChangeText={setEmail} placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Telefone:</Text>
                            <Input placeholder="(xx) xxxx-xxxx" placeholderTextColor="#0b8cbfd1" keyboardType="numeric" value={telefone} onChangeText={setTelefone} />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry value={senha} onChangeText={setSenha} />

                            <Text style={styles.textoInput}>Confirmar Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

                            <View style={styles.botaoContainer}>
                                <Button label="Cadastrar" onPress={cadastrarResponsavel} />
                            </View>
                        </View>
                    ) : ( 
                        <View style={styles.form}>
                            <Text style={styles.subtitulo2}>
                                Preencha os campos abaixo para nos enviar a solicitação de cadastro para a equipe do Diário Inclusivo.
                            </Text>
                            <Text style={styles.textoInput}>Nome da Escola:</Text>
                            <Input placeholder="Nome da Instituição" placeholderTextColor="#0b8cbfd1" />

                            <Text style={styles.textoInput}>E-mail Institucional:</Text>
                            <Input placeholder="escola@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>E-mail do Administrador:</Text>
                            <Input placeholder="adm@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button label="Enviar Solicitação" onPress={() => router.push("/cadProf")} />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
            <Footer>
                <Text style={styles.textoRodape}>Diário Inclusivo.</Text>
            </Footer>
        </View>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: { flex: 1, backgroundColor: "#F5F2E8" },
    scrollContent: { paddingHorizontal: 32, paddingBottom: 50 },
    itens: { justifyContent: "flex-start", width: "100%", marginTop: -10 },
    logo:{ width: 150, height: 150, alignSelf: "center" },
    selectContainer:{ flexDirection: "row", gap: 8, justifyContent: "center" },
    botaoSelect: { backgroundColor: "#2e1ca63f", paddingVertical: 20, paddingHorizontal: 35, borderRadius: 40 },
    botaoAtivo:{ backgroundColor: "#2F1CA6" },
    textoSelect: { color: "#F5F2E8", fontWeight: "bold" },
    subtitulo: { fontSize: 18, fontWeight: "bold", color: "#2F1CA6", textAlign: "center", marginBottom: 5 },
    subtitulo2: { fontSize: 14, fontWeight: "bold", color: "#088CBF", textAlign: "center", marginBottom: 5 },
    form : { marginTop: 12, gap: 5 },
    textoInput: { fontSize: 15, color: "#2F1CA6", fontWeight: "bold", marginLeft: 8, marginTop: 8 },
    botaoContainer:{ alignItems: "center", marginTop: 20 },
    textoRodape: { color: "#0B8CBF", fontSize: 12, fontWeight: "500" }
});