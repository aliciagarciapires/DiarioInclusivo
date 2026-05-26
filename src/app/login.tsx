import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/input";
import { router } from "expo-router";
import Footer from "../../components/Footer";

export default function Login() {
    // Estado para controlar qual tipo de conta está selecionada (padrão: responsavel)
    //Define uma variável de memória chamada 'tipoConta' e uma função 'setTipoConta' para alterá-la.
    const [tipoConta, setTipoConta] = useState("responsavel");

    return (
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.itens}>
                    <Image
                        source={require("../../assets/images/logoNome.png")}
                        style={styles.logo} />

                    <Text style={styles.subtitulo}>
                        Selecione a opção de login
                    </Text>

                    {/* CONTAINER DOS TRÊS BOTÕES DE SELEÇÃO */}
                    <View style={styles.selectContainer}>
                        <Pressable
                            style={[
                                styles.botaoSelect,
                                tipoConta === "responsavel" && styles.botaoAtivo
                                // se o requerimento for cumprido o botão vai mudar de cor pra
                                // sinalizar qual opção foi sinalizada, além de mudar a const
                                // para esse tipo
                            ]}
                            onPress={() => setTipoConta("responsavel")}
                        >
                            <Text style={styles.textoSelect}>Responsável</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.botaoSelect,
                                tipoConta === "professor" && styles.botaoAtivo
                            ]}
                            onPress={() => setTipoConta("professor")}
                        >
                            <Text style={styles.textoSelect}>Professor</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.botaoSelect,
                                tipoConta === "administrador" && styles.botaoAtivo
                            ]}
                            onPress={() => setTipoConta("administrador")}
                        >
                            <Text style={styles.textoSelect}>Administrador</Text>
                        </Pressable>
                    </View>

                    {/**RENDERIZAÇÃO CONDICIONAL DOS FORMULÁRIOS*/}
                    {tipoConta === "responsavel" && (
                        <View style={styles.form}>
                            <Text style={styles.textoInput}>E-mail do Responsável:</Text>
                            <Input placeholder="responsavel@email.com" placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button onPress={() => router.push("/inicio")}
                                    label="Entrar" />
                            </View>
                        </View>
                    )}

                    {tipoConta === "professor" && (
                        <View style={styles.form}>
                            <Text style={styles.textoInput}>E-mail do Professor:</Text>
                            <Input placeholder="professor@email.com" placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button onPress={() => router.push("/inicio")}
                                    label="Entrar" />
                            </View>
                        </View>
                    )}

                    {tipoConta === "administrador" && (
                        <View style={styles.form}>
                            <Text style={styles.textoInput}>E-mail do Administrador:</Text>
                            <Input placeholder="escola@email.com" placeholderTextColor="#0b8cbf5b" />

                            <Text style={styles.textoInput}>Código do Administrador:</Text>
                            <Input placeholder="xxxxxxxx" placeholderTextColor="#0b8cbf5b" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button onPress={() => router.push("/professores")}
                                    label="Entrar" />
                            </View>
                        </View>
                    )}

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
        padding: 32
    },
    topo: {
        justifyContent: "flex-start",
        marginTop: 20,
        color: "#2F1CA6",
        fontWeight: "bold",
        fontSize: 18
    },
    itens: {
        justifyContent: "center",
        width: "100%"
    },
    logo:{
        width: 180, //usar 100% da imagem
        height: 180, //altura
        alignSelf: "center" //apenas esse item no centro
    },
    selectContainer: {
        flexDirection: "row",
        gap: 6, // Diminuí um pouco o espaçamento para caber os 3 botões lado a lado
        justifyContent: "center",
        width: "100%"
    },
    botaoSelect: {
        backgroundColor: "#2e1ca63f",
        paddingVertical: 12, // Diminuí o padding vertical e horizontal para os 3 botões não "esmagarem" na tela
        paddingHorizontal: 14,
        borderRadius: 40,
        flex: 1, // Faz com que os 3 botões dividam o espaço igualmente
        alignItems: "center"
    },
    botaoAtivo: {
        backgroundColor: "#2F1CA6",
    },
    textoSelect: {
        color: "#F5F2E8",
        fontWeight: "bold",
        fontSize: 10 // Fonte ligeiramente menor para garantir que "Administrador" ou "Professor" caibam bem
    },
    subtitulo: {
        fontSize: 19,
        fontWeight: "bold",
        color: "#2F1CA6",
        textAlign: "center",
        marginBottom: 15,
        marginTop: 25
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
    botaoContainer: {
        alignItems: "center",
        marginTop: 17,
        fontSize: 10,
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
})