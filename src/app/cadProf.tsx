import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
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

    const [documentoAberto, setDocumentoAberto] = useState<"termo" | "politica" | null>(null);

    const abrirDocumento = (tipo: "termo" | "politica") => {
        setDocumentoAberto(tipo);
    };

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

            if (data.sucesso) {

                

                Alert.alert(
                    "Professor cadastrado com sucesso!",
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
                                    ? "https://diarioinclusivo.linceonline.com.br/public/termo.html"
                                    : "https://diarioinclusivo.linceonline.com.br/public/politica.html"
                        }}
                        style={styles.webview}
                        startInLoadingState
                    />
                </View>
            </Modal>

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
                                onPress={cadastrarProfessor}
                            />

                        </View>

                    </View>

                </View>

            </ScrollView>

            <Footer />

      
      
          
     

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

    containerPrincipal: {
        flex: 1,
        backgroundColor: "#F5F2E8"
    },
    barraMenuGeral: {
    flexDirection: "row",          // Alinha os botões na horizontal
    justifyContent: "space-around",// Distribui igualmente o espaço entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",    
    height: 90,                    
    paddingBottom: 30,             
    borderTopWidth: 3,             
    borderTopColor: "#F5F2E8",     
    borderTopLeftRadius: 35,       
    borderTopRightRadius: 35,      
    position: "absolute",          // Fixa no rodapé
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,                 
    shadowColor: "#000",
    marginTop: 20,
    borderRadius: 20, // Adiciona bordas arredondadas
  },
  tabLabel: {
    fontSize: 14,                  
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 4,
  },
  iconeCustom: { 
    width: 80, 
    height: 80, 
    borderRadius: 15, 
    resizeMode: "cover" 
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
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

    modalContainer: {
        flex: 1,
        backgroundColor: "#F5F2E8"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 10, // Aumenta o espaço em cima (afasta do topo da tela)
        paddingBottom: 16, // Dá uma altura melhor para a barra
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
        flex: 0
    },

    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500"
    }
});
