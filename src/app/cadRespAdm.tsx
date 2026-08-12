import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
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

    // Estados para controlar a visibilidade das senhas
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    // Tratamento para o campo de e-mail (remove espaços e força minúsculas)
    const tratarEmail = (text: string) => {
        const emailTratado = text.trim().toLowerCase();
        setEmail(emailTratado);
    };

    // Validação de formato de e-mail usando Regex simples
    const validarEmail = (emailParaTestar: string) => {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(emailParaTestar);
    };

    // Função para aplicar a máscara de telefone (celular e fixo)
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

    const cadastrarResponsavel = async () => {
        // Validação antes de enviar o formulário
        if (email && !validarEmail(email)) {
            Alert.alert("Aviso", "Por favor, insira um e-mail válido.");
            return;
        }

        try {
            const response = await fetch("http://200.18.141.137/DiarioInclusivo/src/app/cadResp.php", {
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
                if (data.id) {
                    await AsyncStorage.setItem("idUsuario", String(data.id));
                }
                router.push("/discenteResp");
            }
            
        } catch (error) {
            Alert.alert("Erro", "Falha na conexão.");
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.containerPrincipal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                bounces={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.itens}>
                    <View style={styles.itens}>
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={styles.logo} 
                        />
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
                            <Input 
                                placeholder="usuario@email.com" 
                                value={email} 
                                onChangeText={tratarEmail} 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.textoInput}>Telefone:</Text>
                            <Input 
                                placeholder="(xx) xxxxx-xxxx" 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="numeric" 
                                maxLength={15}
                                value={telefone} 
                                onChangeText={aplicarMascaraTelefone} 
                            />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <View style={styles.senhaWrapper}>
                                <Input 
                                    placeholder="**********" 
                                    placeholderTextColor="#0b8cbfd1" 
                                    secureTextEntry={!mostrarSenha} 
                                    value={senha} 
                                    onChangeText={setSenha} 
                                />
                                <TouchableOpacity 
                                    style={styles.iconeOlho} 
                                    onPress={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    <Ionicons 
                                        name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                                        size={22} 
                                        color="#0B8CBF" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.textoInput}>Confirmar Senha:</Text>
                            <View style={styles.senhaWrapper}>
                                <Input 
                                    placeholder="**********" 
                                    placeholderTextColor="#0b8cbfd1" 
                                    secureTextEntry={!mostrarConfirmarSenha} 
                                    value={confirmarSenha} 
                                    onChangeText={setConfirmarSenha} 
                                />
                                <TouchableOpacity 
                                    style={styles.iconeOlho} 
                                    onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                >
                                    <Ionicons 
                                        name={mostrarConfirmarSenha ? "eye-off-outline" : "eye-outline"} 
                                        size={22} 
                                        color="#0B8CBF" 
                                    />
                                </TouchableOpacity>
                            </View>

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
                            <Input 
                                placeholder="escola@email.com" 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="email-address" 
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.textoInput}>E-mail do Administrador:</Text>
                            <Input 
                                placeholder="adm@email.com" 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="email-address" 
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <View style={styles.senhaWrapper}>
                                <Input 
                                    placeholder="**********" 
                                    placeholderTextColor="#0b8cbfd1" 
                                    secureTextEntry={!mostrarSenha} 
                                />
                                <TouchableOpacity 
                                    style={styles.iconeOlho} 
                                    onPress={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    <Ionicons 
                                        name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                                        size={22} 
                                        color="#0B8CBF" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.botaoContainer}>
                                <Button label="Enviar Solicitação" onPress={() => router.push("/cadProf")} />
                            </View>
                        </View>
                    )}

                    {/* BOTÃO PARA REDIRECIONAR QUEM JÁ TEM CONTA */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.textoJaTemConta}>Já tem uma conta? </Text>
                        <Pressable onPress={() => router.push("/login")}>
                            <Text style={styles.textoEntrar}>Entrar</Text>
                        </Pressable>
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
    containerPrincipal: { flex: 1, backgroundColor: "#F5F2E8" },
    scrollContent: { paddingHorizontal: 32, paddingBottom: 80, paddingTop: 10 },
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
    textoRodape: { color: "#0B8CBF", fontSize: 12, fontWeight: "500" },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    textoJaTemConta: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "500",
    },
    textoEntrar: {
        fontSize: 15,
        color: "#0B8CBF",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    senhaWrapper: {
        position: "relative",
        justifyContent: "center",
    },
    iconeOlho: {
        position: "absolute",
        right: 15,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    }
});