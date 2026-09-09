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

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    
    // Estado para controlar a visibilidade da senha
    const [mostrarSenha, setMostrarSenha] = useState(false);

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

    const handleLogin = async () => {
        // --- VERIFICAÇÃO DE E-MAIL E CAMPOS VAZIOS ---
        if (!email) {
            Alert.alert("Aviso", "Por favor, preencha o campo de e-mail.");
            return;
        }

        if (!validarEmail(email)) {
            Alert.alert("Aviso", "Por favor, insira um e-mail válido.");
            return;
        }

        if (!senha) {
            Alert.alert("Aviso", "Por favor, preencha a sua senha.");
            return;
        }

        try {

            const response = await fetch("http://192.168.0.107/DiarioInclusivo/src/app/login.php", {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            const data = await response.json();

            if (data.sucesso) {
                if (data.userId) {
                    await AsyncStorage.setItem("idUsuario", String(data.userId));
                    await AsyncStorage.setItem("tipo_de_usuario", String(data.tipo_de_usuario));
                }
                Alert.alert("Sucesso", data.mensagem);

                // --- DIRECIONAMENTO POR TIPO DE USUÁRIO ---
                const tipo = Number(data.tipo_de_usuario);

                if (tipo === 1) {
                    // Tipo 1: Responsável
                    router.replace("/discenteResp");
                } else if (tipo === 2) {
                    // Tipo 2: Admin/Professor
                    router.replace("/professores");
                } else if (tipo === 3) {
                    // Tipo 3: Professor
                    router.replace("/discente");
                } else {
                    // Caso receba um tipo não mapeado
                    router.replace("/inicio");
                }

            } else {
                Alert.alert("Erro", data.mensagem);
            }
        } catch (error) {
            Alert.alert("Erro", "Falha na conexão com o servidor.");
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
                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo} 
                    />

                    <View style={styles.form}>
                        <Text style={styles.textoInput}>E-mail:</Text>
                        <Input 
                            placeholder="usuario@email.com" 
                            placeholderTextColor="#0b8cbfd1" 
                            keyboardType="email-address" 
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email} 
                            onChangeText={tratarEmail} 
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

                        <View style={styles.botaoContainer}>
                            <Button onPress={handleLogin} label="Entrar" />
                        </View>
                    </View>

                    {/* BOTÃO | LINK: ESQUECER A SENHA */}
                    <Pressable 
                        style={styles.esqueceuSenhaBotao} 
                        onPress={() => router.push("/inicio")}
                    >
                        <Text style={styles.esqueceuSenhaTexto}>
                            Esqueceu sua senha? Clique aqui para recuperar
                        </Text>
                    </Pressable>

                </View>
            </ScrollView>

            <Footer>
                <Text style={styles.textoRodape}>
                    Diário Inclusivo.
                </Text>
            </Footer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: {
        flex: 1,
        backgroundColor: "#F5F2E8",
    },
    scrollContent: {
        paddingHorizontal: 32,
        paddingBottom: 40,
        flexGrow: 1,
    },
    itens: {
        justifyContent: "flex-start",
        width: "100%",
        marginTop: -10,
    },
    logo: {
        width: 150, 
        height: 160,
        alignSelf: "center",
    },
    form: {
        marginTop: 40,
        gap: 5
    },
    textoInput: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "bold",
        marginLeft: 8,
        marginTop: 8
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
    },
    botaoContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    esqueceuSenhaBotao: {
        alignSelf: "center",
        marginTop: 25,
        padding: 10,
    },
    esqueceuSenhaTexto: {
        color: "#2F1CA6",
        fontSize: 13,
        fontWeight: "600",
        textDecorationLine: "underline",
        textAlign: "center",
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
});
