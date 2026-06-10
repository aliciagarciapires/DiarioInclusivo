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
  try {
    const response = await fetch("http://172.20.10.3/AulaemPHP/DiarioInclusivo/src/app/cadResp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha,
        confirmarSenha: confirmarSenha
      })
    });

    const data = await response.json();
    Alert.alert("Aviso", data.mensagem);
    if (data.sucesso) {
      router.push("/inicio");
    }
    
  } catch (error) {
    Alert.alert("Erro", "Falha na conexão.");
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