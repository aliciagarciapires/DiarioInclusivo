import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { API_URL } from "./api";

export default function AtualizarSenha() {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState<number | null>(null);

    useEffect(() => {
        const carregarTipoUsuario = async () => {
            try {
                const idSalvo = await AsyncStorage.getItem("idUsuario");
                if (idSalvo) {
                    const response = await fetch(`${API_URL}/getUsuario.php?id=${idSalvo}`);
                    const json = await response.json();
                    
                    if (json.success && json.dados?.tipo_de_usuario) {
                        setTipoUsuario(Number(json.dados.tipo_de_usuario));
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar tipo de usuário:", error);
            }
        };

        carregarTipoUsuario();
    }, []);

    const validarSenha = (senhaParaTestar: string) => {
        return /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(senhaParaTestar);
    };

    const handleSalvarSenha = async () => {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            Alert.alert("Aviso", "Por favor, preencha todos os campos.");
            return;
        }

        if (!validarSenha(novaSenha)) {
            Alert.alert(
                "Aviso",
                "A nova senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo."
            );
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert("Aviso", "As novas senhas não coincidem.");
            return;
        }

        if (senhaAtual === novaSenha) {
            Alert.alert("Aviso", "A nova senha deve ser diferente da senha atual.");
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem("idUsuario");

            if (!userId) {
                setLoading(false);
                Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
                router.replace("/");
                return;
            }

            const response = await fetch(`${API_URL}/alterar_senha.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    senha_atual: senhaAtual,
                    nova_senha: novaSenha
                })
            });

            const text = await response.text();
            console.log("RESPOSTA DO SERVIDOR:", text);

            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                throw new Error(`Resposta do servidor não é JSON. Status: ${response.status}`);
            }

            setLoading(false);

            if (data.sucesso) {
                Alert.alert("Sucesso", data.mensagem, [
                    { text: "OK", onPress: () => router.back() }
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
                    <View style={styles.form}>
                        <Text style={styles.tituloSecao}>Alterar Senha</Text>
                        <Text style={styles.subtituloSecao}>Digite sua senha atual e crie uma nova senha de acesso.</Text>

                        <Text style={styles.textoInput}>Senha Atual:</Text>
                        <View style={styles.senhaWrapper}>
                            <Input 
                                placeholder="**********" 
                                placeholderTextColor="#0b8cbfd1" 
                                secureTextEntry={!mostrarSenhaAtual} 
                                value={senhaAtual} 
                                onChangeText={setSenhaAtual} 
                            />
                            <TouchableOpacity 
                                style={styles.iconeOlho} 
                                onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                            >
                                <Ionicons 
                                    name={mostrarSenhaAtual ? "eye-off-outline" : "eye-outline"} 
                                    size={22} 
                                    color="#0B8CBF" 
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.textoInput}>Nova Senha:</Text>
                        <View style={styles.senhaWrapper}>
                            <Input 
                                placeholder="**********" 
                                placeholderTextColor="#0b8cbfd1" 
                                secureTextEntry={!mostrarNovaSenha} 
                                value={novaSenha} 
                                onChangeText={setNovaSenha} 
                            />
                            <TouchableOpacity 
                                style={styles.iconeOlho} 
                                onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                            >
                                <Ionicons 
                                    name={mostrarNovaSenha ? "eye-off-outline" : "eye-outline"} 
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
                                <Button onPress={handleSalvarSenha} label="Salvar Nova Senha" />
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Footer>
                <Text style={styles.textoRodape}>
                    Diário Inclusivo.
                </Text>
            </Footer>

            {/* Menu Inferior Condicional por Tipo de Usuário */}
            <View style={styles.barraMenuGeral}>
                {tipoUsuario === 1 && (
                    <>
                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
                            <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Início</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
                            <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Diário</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
                            <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Conf.</Text>
                        </Pressable>
                    </>
                )}

                {tipoUsuario === 2 && (
                    <>
                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
                            <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Professores</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
                            <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Discentes</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
                            <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Rotina</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
                            <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Conf.</Text>
                        </Pressable>
                    </>
                )}

                {tipoUsuario === 3 && (
                    <>
                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
                            <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Início</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
                            <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Diário</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
                            <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Rotina</Text>
                        </Pressable>

                        <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
                            <Image source={require("../../assets/images/confgD.png")} style={styles.iconeCustom} />
                            <Text style={styles.tabLabel}>Conf.</Text>
                        </Pressable>
                    </>
                )}
            </View>
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
        paddingBottom: 110, // Aumentado para evitar que o conteúdo fique escondido atrás da barra fixa
        flexGrow: 1,
    },
    itens: {
        justifyContent: "flex-start",
        width: "100%",
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
    botaoContainer: {
        alignItems: "center",
        marginTop: 30,
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    },
    botaoMenu: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2F1CA6",
        marginTop: 4,
    },
    iconeCustom: {
        width: 80,
        height: 80,
        borderRadius: 15,
        resizeMode: "cover",
    },
    barraMenuGeral: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#F5F2E8",
        height: 90,
        paddingBottom: 30,
        borderTopWidth: 3,
        borderTopColor: "#F5F2E8",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: "#000",
    },
});
