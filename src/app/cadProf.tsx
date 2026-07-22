import { router } from "expo-router"
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { Button } from "../../components/Button"
import { Input } from "../../components/input"
import Footer from "../../components/Footer"
import React, { useState } from "react"

export default function CadProf(){

    const [tipoConta, setTipoConta] = useState("3"); 
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

   const cadastrarProfessor = async () => {
    // 1. Validação local dos campos
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert("Aviso", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não coincidem.");
      return;
    }

    // 2. Envio para o Backend PHP
    try {
      const response = await fetch("http://192.168.0.103/DiarioInclusivo/src/app/cadProf.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha: senha,
          tipoConta: tipoConta,
        }),
      });

      // Converte a resposta em JSON
      const data = await response.json();

      // 3. Exibe a mensagem enviada pelo PHP (Sucesso ou erro/e-mail cadastrado)
      Alert.alert(data.success ? "Sucesso" : "Aviso", data.message || data.mensagem);

      // Só redireciona se o servidor confirmar 'success: true'
      if (data.success || data.sucesso) {
        router.push("/professores");
      }
    } catch (error) {
      console.log("Erro de conexão:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique a rede.");
    }
  };


    return(
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>


                {/**LOGO */}
                <View style={styles.itens}>
                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo} />
                </View>

                {/**FORMULÁRIO */}
                <View style={styles.form}>

                    <Text style={styles.title}>
                        Cadastro do Professor
                    </Text>

                    <Text style={styles.textoInput}>
                        Nome Completo:
                    </Text>
                    <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbfd1" value={nome} onChangeText={setNome} />

                    <Text style={styles.textoInput}>
                        E-mail:
                    </Text>
                    <Input placeholder="professor@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" value={email} onChangeText={setEmail} />

                    <Text style={styles.textoInput}>
                        Senha:
                    </Text>
                    <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry value={senha} onChangeText={setSenha} />

                    <Text style={styles.textoInput}>
                        Confirmar Senha:
                    </Text>
                    <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

                    <View style={styles.botaoContainer}>
                        <Button
                            label="Cadastrar"
                            onPress={cadastrarProfessor} />
                    </View>
                </View>

            </View>
        </ScrollView>
        <Footer>
                <Text style={styles.textoRodape}>
                    Diário Inclusivo.
                </Text>
            </Footer></>
            
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, //view oxupar a tela inteira
        alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32, //margem
        
    },
    itens: {
        justifyContent: "center",
        width: "100%",
        marginTop: -50
    },
    logo:{
        width: 150, //usar 100% da imagem
        height: 150, //altura
        alignSelf: "center"
    }, 
    form : {
        marginTop: -10,
        gap: 5,
        width: "100%"
    },
    textoInput: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "bold", 
        marginLeft: 8,
        marginTop: 8
    },
    botaoContainer:{
        alignItems: "center",
        marginTop: 20
    },
    title: {
        fontSize: 22, //tamanho da fonte
        fontWeight: "bold", //texto em negrito
        color: "#2F1CA6", //cor do texto
        marginLeft: 8, //alinhar o texto no centro horizontal
        marginTop: 10
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
})
