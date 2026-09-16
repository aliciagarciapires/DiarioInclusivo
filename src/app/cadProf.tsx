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
    View
} from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";
import { API_URL } from "./api";

export default function CadProf() {

    const [tipoConta] = useState("3");

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const [aceitouTermos, setAceitouTermos] = useState(false);

    const tratarEmail = (text: string) => {
        setEmail(text.trim().toLowerCase());
    };

    const validarEmail = (emailParaTestar: string) => {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(emailParaTestar);
    };

    const validarSenha = (senhaParaTestar: string) =>
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(senhaParaTestar);

    const cadastrarProfessor = async () => {

        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            Alert.alert(
                "Atenção",
                "Preencha todos os campos."
            );
            return;
        }

        if (!validarEmail(email)) {
            Alert.alert(
                "Atenção",
                "Digite um e-mail válido."
            );
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert(
                "Atenção",
                "As senhas não coincidem."
            );
            return;
        }

        if (!validarSenha(senha)) {
            Alert.alert(
                "Atenção",
                "A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo."
            );
            return;
        }

        if (!aceitouTermos) {
            Alert.alert(
                "Termos de Uso",
                "Você precisa ler e concordar com os Termos de Uso para continuar."
            );
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/cadProf.php`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                        tipoConta,
                        aceitouTermos
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                if (data.id) {
                    await AsyncStorage.setItem(
                        "idUsuario",
                        String(data.id)
                    );
                }

                Alert.alert(
                    "Sucesso",
                    data.message
                );

                router.push("/professores");

            } else {

                Alert.alert(
                    "Aviso",
                    data.message
                );
            }

        } catch (error) {

            Alert.alert(
                "Erro",
                "Não foi possível conectar ao servidor."
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.containerPrincipal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.itens}>

                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo}
                    />

                    <Text style={styles.subtitulo}>
                        Cadastro do Professor
                    </Text>

                    <View style={styles.form}>

                        <Text style={styles.textoInput}>
                            Nome Completo:
                        </Text>

                        <Input
                            placeholder="Nome Completo"
                            placeholderTextColor="#0b8cbfd1"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Text style={styles.textoInput}>
                            E-mail:
                        </Text>

                        <Input
                            placeholder="usuario@email.com"
                            placeholderTextColor="#0b8cbfd1"
                            value={email}
                            onChangeText={tratarEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={styles.textoInput}>
                            Senha:
                        </Text>

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
                                onPress={() =>
                                    setMostrarSenha(!mostrarSenha)
                                }
                            >

                                <Ionicons
                                    name={
                                        mostrarSenha
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={22}
                                    color="#0B8CBF"
                                />

                            </TouchableOpacity>

                        </View>

                        <Text style={styles.textoInput}>
                            Confirmar Senha:
                        </Text>

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
                                onPress={() =>
                                    setMostrarConfirmarSenha(
                                        !mostrarConfirmarSenha
                                    )
                                }
                            >

                                <Ionicons
                                    name={
                                        mostrarConfirmarSenha
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={22}
                                    color="#0B8CBF"
                                />

                            </TouchableOpacity>

                        </View>

                        <View style={styles.termosContainer}>

                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() =>
                                    setAceitouTermos(!aceitouTermos)
                                }
                            >
                                <Text style={styles.checkboxTexto}>
                                    {aceitouTermos ? "✓" : ""}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.termosTexto}>
                                Li e concordo com{" "}
                                <Text
                                    style={styles.termosLink}
                                    onPress={() =>
                                        router.push("/termos")
                                    }
                                >
                                    os Termos de Uso
                                </Text>
                            </Text>

                        </View>

                        <View style={styles.botaoContainer}>

                            <Button
                                label="Cadastrar"
                                onPress={cadastrarProfessor}
                            />

                        </View>

                    </View>

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
        backgroundColor: "#F5F2E8"
    },

    scrollContent: {
        paddingHorizontal: 32,
        paddingBottom: 80,
        paddingTop: 10
    },

    itens: {
        width: "100%"
    },

    logo: {
        width: 150,
        height: 150,
        alignSelf: "center"
    },

    subtitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2F1CA6",
        textAlign: "center",
        marginBottom: 10
    },

    form: {
        marginTop: 12,
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
        justifyContent: "center"
    },

    iconeOlho: {
        position: "absolute",
        right: 15,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1
    },

    termosContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 5
    },

    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#2F1CA6",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
    },

    checkboxTexto: {
        color: "#2F1CA6",
        fontSize: 18,
        fontWeight: "bold"
    },

    termosTexto: {
        flex: 1,
        fontSize: 14,
        color: "#333"
    },

    termosLink: {
        color: "#2F1CA6",
        fontWeight: "bold",
        textDecorationLine: "underline"
    },

    botaoContainer: {
        alignItems: "center",
        marginTop: 20
    },

    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500"
    }
});
