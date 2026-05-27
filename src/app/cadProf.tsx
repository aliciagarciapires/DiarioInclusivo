import { router } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { Button } from "../../components/Button"
import { Input } from "../../components/input"
import Footer from "../../components/Footer"

export default function Login(){
    return(
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>


                {/**LOGO */}
                <View style={styles.itens}>
                    <Image
                        source={require("../../assets/images/logoNome.png")}
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
                    <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbf5b" />

                    <Text style={styles.textoInput}>
                        E-mail:
                    </Text>
                    <Input placeholder="professor@email.com" placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                    <Text style={styles.textoInput}>
                        MASP/Matrícula:
                    </Text>
                    <Input placeholder="xxxxxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric" />

                    <Text style={styles.textoInput}>
                        Senha:
                    </Text>
                    <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                    <Text style={styles.textoInput}>
                        Confirmar Senha:
                    </Text>
                    <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                    <View style={styles.botaoContainer}>
                        <Button
                            label="Cadastrar"
                            onPress={() => router.push("/professores")} />
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
        width: 200, //usar 100% da imagem
        height: 200, //altura
        marginTop: 25, //margem do topo
        alignSelf: "center"
    }, 
    form : {
        marginTop: 12,
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