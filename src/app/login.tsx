import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

export default function Login() {
    // Estado para controlar qual tipo de conta está selecionada (padrão: responsavel)
    //Define uma variável de memória chamada 'tipoConta' e uma função 'setTipoConta' para alterá-la.
    const [tipoConta, setTipoConta] = useState("responsavel");

    return (
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.itens}>
                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo} />

                    <View style={styles.form}>
                            <Text style={styles.textoInput}>E-mail:</Text>
                            <Input placeholder="usuario@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button onPress={() => router.push("/inicio")}
                                    label="Entrar" />
                            </View>
                    </View>

                    {/* BOTÃO | LINK: ESQUECER A SENHA */}
                        <Pressable 
                            style={styles.esqueceuSenhaBotao} 
                            onPress={() => router.push("/inicio")} // na prática vai para a configuraçao, que ainda n existe
                        >
                            <Text style={styles.esqueceuSenhaTexto}>
                                Esqueceu sua senha? Clique aqui para recuperar
                            </Text>
                        </Pressable>

                </View>
            </View>
        </ScrollView><Footer>
                <Text style={styles.textoRodape}>
                    Diário Inclusivo.
                </Text>
            </Footer></>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#F5F2E8",
        paddingHorizontal: 32,
    },
    itens: {
        justifyContent: "flex-start", // Garante que tudo fique no topo
        width: "100%",
        marginTop: -10, // Sobe a logo e os botões para o topo
    },
    logo:{
        width: 150, 
        height: 160,
        alignSelf: "center",
        
    },
    
    form: {
        marginTop: 60,
        gap: 5
    },
    textoInput: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "bold",
        marginLeft: 8,
        marginTop: 8
    },
    botaoContainer: {
        alignItems: "center",
        marginTop: 40,
        fontSize: 10,
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
        textDecorationLine: "underline", // Dá o efeito de link sublinhado
        textAlign: "center",
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }

})
