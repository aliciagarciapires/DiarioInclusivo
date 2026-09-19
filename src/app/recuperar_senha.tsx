import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

import { API_URL } from "./api";

export default function RecuperacaoSenha() {
    const [etapa, setEtapa] = useState(1); // 1: E-mail, 2: Código, 3: Nova Senha
    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [loading, setLoading] = useState(false);

    const tratarEmail = (text: string) => {
        setEmail(text.trim().toLowerCase());
    };

    const validarSenha = (senhaParaTestar: string) => {
        return /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(senhaParaTestar);
    };

    // ETAPA 1: Enviar Código
    const handleEnviarCodigo = async () => {
        if (!email) {
            Alert.alert("Aviso", "Por favor, preencha o campo de e-mail.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/enviar_codigo.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const text = await response.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                throw new Error(`Resposta do servidor não é JSON. Status: ${response.status}`);
            }

            setLoading(false);

            if (data.sucesso) {
                Alert.alert("Sucesso", data.mensagem);
                setEtapa(2);
            } else {
                Alert.alert("Erro", data.mensagem);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Erro", "Falha: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    // ETAPA 2: Verificar Código
    const handleVerificarCodigo = async () => {
        if (!codigo || codigo.length !== 6) {
            Alert.alert("Aviso", "Por favor, digite o código completo de 6 dígitos.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/verificar_codigo.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email, codigo })
            });

            const text = await response.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                throw new Error(`Resposta do servidor não é JSON. Status: ${response.status}`);
            }

            setLoading(false);

            if (data.sucesso) {
                setEtapa(3);
            } else {
                Alert.alert("Erro", data.mensagem);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Erro", "Falha: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    // ETAPA 3: Alterar Senha
    const handleAlterarSenha = async () => {
        if (!novaSenha || !confirmarSenha) {
            Alert.alert("Aviso", "Por favor, preencha todos os campos de senha.");
            return;
        }

        if (!validarSenha(novaSenha)) {
            Alert.alert(
                "Aviso",
                "A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo."
            );
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert("Aviso", "As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/verificar_codigo.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email, codigo, nova_senha: novaSenha })
            });

            const text = await response.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                throw new Error(`Resposta do servidor não é JSON. Status: ${response.status}`);
            }

            setLoading(false);

            if (data.sucesso) {
                Alert.alert("Sucesso", data.mensagem, [
                    {
                        text: "OK",
                        onPress: () => {
                            router.push("/login");
                        }
                    }
                ]);
            } else {
                Alert.alert("Erro", data.mensagem);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Erro", "Falha: " + (error instanceof Error ? error.message : String(error)));
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
                    
                    

                    {/* ETAPA 1: E-MAIL */}
                    {etapa === 1 && (
                        <View style={styles.form}>
                            <Text style={styles.tituloSecao}>Recuperar Senha</Text>
                            <Text style={styles.subtituloSecao}>Digite seu e-mail para receber o código.</Text>

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

                            <View style={styles.botaoContainer}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#2F1CA6" />
                                ) : (
                                    <Button onPress={handleEnviarCodigo} label="Avançar" />
                                )}
                            </View>
                        </View>
                    )}

                    {/* ETAPA 2: CÓDIGO */}
                    {etapa === 2 && (
                        <View style={styles.form}>
                            <Text style={styles.tituloSecao}>Digite o Código</Text>
                            <Text style={styles.subtituloSecao}>Enviamos 6 dígitos para o seu e-mail.</Text>

                            <Text style={styles.textoInput}>Código:</Text>
                            <TextInput 
                                style={styles.inputCodigo}
                                placeholder="000000" 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="number-pad" 
                                maxLength={6}
                                value={codigo} 
                                onChangeText={setCodigo} 
                            />

                            <View style={styles.botaoContainer}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#2F1CA6" />
                                ) : (
                                    <Button onPress={handleVerificarCodigo} label="Confirmar Código" />
                                )}
                            </View>

                            <TouchableOpacity onPress={() => setEtapa(1)} style={styles.voltarBotao}>
                                <Text style={styles.voltarTexto}>Voltar e alterar e-mail</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ETAPA 3: NOVA SENHA */}
                    {etapa === 3 && (
                        <View style={styles.form}>
                            <Text style={styles.tituloSecao}>Nova Senha</Text>
                            <Text style={styles.subtituloSecao}>Crie a sua nova senha de acesso.</Text>

                            <Text style={styles.textoInput}>Nova Senha:</Text>
                            <View style={styles.senhaWrapper}>
                                <Input 
                                    placeholder="**********" 
                                    placeholderTextColor="#0b8cbfd1" 
                                    secureTextEntry={!mostrarSenha} 
                                    value={novaSenha} 
                                    onChangeText={setNovaSenha} 
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

                            <Text style={styles.textoInput}>Confirmar Nova Senha:</Text>
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
                                {loading ? (
                                    <ActivityIndicator size="small" color="#2F1CA6" />
                                ) : (
                                    <Button onPress={handleAlterarSenha} label="Salvar Senha" />
                                )}
                            </View>
                        </View>
                    )}

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
        paddingTop: 40,
        paddingBottom: 40,
        flexGrow: 1,
    },
    itens: {
        justifyContent: "flex-start",
        width: "100%",
    },
    stepsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#D1D5DB",
        marginHorizontal: 4,
    },
    stepDotActive: {
        backgroundColor: "#2F1CA6",
        width: 24,
    },
    tituloSecao: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2F1CA6",
        textAlign: "center",
    },
    subtituloSecao: {
        fontSize: 13,
        color: "#0B8CBF",
        textAlign: "center",
        marginBottom: 10,
    },
    form: {
        marginTop: 10,
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
    inputCodigo: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#0B8CBF",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 20,
        color: "#2F1CA6",
        textAlign: "center",
        letterSpacing: 6,
        marginTop: 8,
    },
    botaoContainer: {
        alignItems: "center",
        marginTop: 30,
    },
    voltarBotao: {
        alignSelf: "center",
        marginTop: 15,
        padding: 10,
    },
    voltarTexto: {
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
