import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import WebView from "react-native-webview";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";
import { API_URL } from "./api";

export default function CadResp() {

    const [tipoConta, setTipoConta] = useState("1");

    // Estados Responsável
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    // Estados Administrador
    const [nomeEscola, setNomeEscola] = useState("");
    const [emailInst, setEmailInst] = useState("");
    const [emailAdm, setEmailAdm] = useState("");
    const [senhaAdm, setSenhaAdm] = useState("");

    // Termos de Uso
    const [aceitouTermos, setAceitouTermos] = useState(false);

    // Visibilidade de senha
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    // Tratamento e validação de e-mail
    const tratarEmail = (text: string, setter: (val: string) => void) => {
        setter(text.trim().toLowerCase());
    };

    const validarEmail = (emailParaTestar: string) => {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(emailParaTestar);
    };

    const validarTelefone = (telefoneParaTestar: string) => {
        const telefoneLimpo = telefoneParaTestar.replace(/\D/g, "");
        return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
    };

    // Máscara de telefone
    const validarSenha = (senhaParaTestar: string) =>
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(senhaParaTestar);

    const [documentoAberto, setDocumentoAberto] = useState<"termo" | "politica" | null>(null);

    const abrirDocumento = (tipo: "termo" | "politica") => {
        setDocumentoAberto(tipo);
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

    const cadastrarResponsavel = async () => {

        if (email && !validarEmail(email)) {
            Alert.alert("Aviso", "Por favor, insira um e-mail válido.");
            return;
        }

        if (!validarTelefone(telefone)) {
            Alert.alert("Aviso", "Por favor, insira um número de telefone válido.");
            return;
        }

        if (!validarSenha(senha)) {
            Alert.alert("Aviso", "A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo.");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Aviso", "As senhas não coincidem.");
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

            const response = await fetch(`${API_URL}/cadResp.php`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome,
                    email,
                    telefone,
                    senha,
                    confirmarSenha,
                    aceitouTermos
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

    // Cadastro da solicitação do Administrador
    const enviarCadastro = async () => {

        if (!validarSenha(senhaAdm)) {
            Alert.alert(
                "Aviso",
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

        const urlAPI = `${API_URL}/cadAdm.php`;

        try {

            const resposta = await fetch(urlAPI, {

                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome_escola: nomeEscola,
                    email_institucional: emailInst,
                    email_adm: emailAdm,
                    senha_adm: senhaAdm,
                    aceitouTermos
                })
            });

            const textoResposta = await resposta.text();

            console.log("Resposta bruta do servidor:", textoResposta);

            const dados = JSON.parse(textoResposta);

            if (dados.sucesso) {
                alert("Sucesso: " + dados.mensagem);
            } else {
                alert("Aviso: " + dados.mensagem);
            }

        } catch (erro) {

            console.error("Erro detalhado do fetch:", erro);

            alert(
                "Falha na conexão. Verifique se o IP " +
                urlAPI +
                " está acessível."
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.containerPrincipal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >

            <Modal
                visible={documentoAberto !== null}
                animationType="slide"
                onRequestClose={() => setDocumentoAberto(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitulo}>
                            {documentoAberto === "termo" ? "Termos de Uso" : "Política de Privacidade"}
                        </Text>
                        <TouchableOpacity onPress={() => setDocumentoAberto(null)} style={styles.modalCloseButton}>
                            <Text style={styles.modalCloseText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>

                    <WebView
                        source={{
                            uri:
                                documentoAberto === "termo"
                                    ? "https://diarioinclusivo.linceonline.com.br/termo.html"
                                    : "https://diarioinclusivo.linceonline.com.br/politica.html"
                        }}
                        style={styles.webview}
                        startInLoadingState
                    />
                </View>
            </Modal>

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
                            style={[
                                styles.botaoSelect,
                                tipoConta === "1" && styles.botaoAtivo
                            ]}
                            onPress={() => setTipoConta("1")}
                        >
                            <Text style={styles.textoSelect}>
                                Responsável
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.botaoSelect,
                                tipoConta === "2" && styles.botaoAtivo
                            ]}
                            onPress={() => setTipoConta("2")}
                        >
                            <Text style={styles.textoSelect}>
                                Administrador
                            </Text>
                        </Pressable>

                    </View>

                    {tipoConta === "1" ? (

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
                                value={email}
                                onChangeText={(txt) =>
                                    tratarEmail(txt, setEmail)
                                }
                                placeholderTextColor="#0b8cbfd1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.textoInput}>
                                Telefone:
                            </Text>

                            <Input
                                placeholder="(xx) xxxxx-xxxx"
                                placeholderTextColor="#0b8cbfd1"
                                keyboardType="numeric"
                                maxLength={15}
                                value={telefone}
                                onChangeText={aplicarMascaraTelefone}
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
                                        onPress={() => abrirDocumento("termo")}
                                    >
                                        os Termos de Uso
                                    </Text>
                                    {" "}e com a{" "}
                                    <Text
                                        style={styles.termosLink}
                                        onPress={() => abrirDocumento("politica")}
                                    >
                                        Política de Privacidade
                                    </Text>
                                </Text>

                            </View>

                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Cadastrar"
                                    onPress={cadastrarResponsavel}
                                />
                            </View>

                        </View>

                    ) : (

                        <View style={styles.form}>

                            <Text style={styles.subtitulo2}>
                                Preencha os campos abaixo para nos enviar a
                                solicitação de cadastro para a equipe do
                                Diário Inclusivo.
                            </Text>

                            <Text style={styles.textoInput}>
                                Nome da Escola:
                            </Text>

                            <Input
                                placeholder="Nome da Instituição"
                                placeholderTextColor="#0b8cbfd1"
                                value={nomeEscola}
                                onChangeText={setNomeEscola}
                            />

                            <Text style={styles.textoInput}>
                                E-mail Institucional:
                            </Text>

                            <Input
                                placeholder="escola@email.com"
                                placeholderTextColor="#0b8cbfd1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={emailInst}
                                onChangeText={(txt) =>
                                    tratarEmail(txt, setEmailInst)
                                }
                            />

                            <Text style={styles.textoInput}>
                                E-mail do Administrador:
                            </Text>

                            <Input
                                placeholder="adm@email.com"
                                placeholderTextColor="#0b8cbfd1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={emailAdm}
                                onChangeText={(txt) =>
                                    tratarEmail(txt, setEmailAdm)
                                }
                            />

                            <Text style={styles.textoInput}>
                                Senha:
                            </Text>

                            <View style={styles.senhaWrapper}>

                                <Input
                                    placeholder="**********"
                                    placeholderTextColor="#0b8cbfd1"
                                    secureTextEntry={!mostrarSenha}
                                    value={senhaAdm}
                                    onChangeText={setSenhaAdm}
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
                                        onPress={() => abrirDocumento("termo")}
                                    >
                                        os Termos de Uso
                                    </Text>
                                    {" "}e com a{" "}
                                    <Text
                                        style={styles.termosLink}
                                        onPress={() => abrirDocumento("politica")}
                                    >
                                        Política de Privacidade
                                    </Text>
                                </Text>

                            </View>

                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Enviar Solicitação"
                                    onPress={enviarCadastro}
                                />
                            </View>

                        </View>
                    )}

                    <View style={styles.loginContainer}>

                        <Text style={styles.textoJaTemConta}>
                            Já tem uma conta?
                        </Text>

                        <Pressable
                            onPress={() => router.push("/login")}
                        >
                            <Text style={styles.textoEntrar}>
                                Entrar
                            </Text>
                        </Pressable>

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
        justifyContent: "flex-start",
        width: "100%",
        marginTop: -10
    },

    logo: {
        width: 150,
        height: 150,
        alignSelf: "center"
    },

    selectContainer: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "center"
    },

    botaoSelect: {
        backgroundColor: "#2e1ca63f",
        paddingVertical: 20,
        paddingHorizontal: 35,
        borderRadius: 40
    },

    botaoAtivo: {
        backgroundColor: "#2F1CA6"
    },

    textoSelect: {
        color: "#F5F2E8",
        fontWeight: "bold"
    },

    subtitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2F1CA6",
        textAlign: "center",
        marginBottom: 5
    },

    subtitulo2: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#088CBF",
        textAlign: "center",
        marginBottom: 5
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

    modalContainer: {
        flex: 1,
        backgroundColor: "#F5F2E8"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5"
    },
    modalTitulo: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2F1CA6"
    },
    modalCloseButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#0B8CBF",
        borderRadius: 8
    },
    modalCloseText: {
        color: "#FFF",
        fontWeight: "700"
    },
    webview: {
        flex: 1
    },

    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500"
    },

    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10
    },

    textoJaTemConta: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "500"
    },

    textoEntrar: {
        fontSize: 15,
        color: "#0B8CBF",
        fontWeight: "bold",
        textDecorationLine: "underline",
        marginLeft: 5
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
    }
});
