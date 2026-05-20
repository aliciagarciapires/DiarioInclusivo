import {Text, View, StyleSheet, Image, ScrollView} from "react-native"
import { Input } from "../../components/input"
import{Button} from "../../components/Button"
import {Link, router} from "expo-router"

export default function Login(){
    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {/**TOPO */}
                <Text style={styles.topo}>
                    CADASTRO
                </Text>
                
            {/**LOGO */}
            <View style={styles.itens}>
                <Image
                    source={require("../../assets/images/logoNome.png")}
                    style={styles.logo}>
                </Image>
            </View>

            {/**FORMULÁRIO */}
            <View style={styles.form}>

                <Text style={styles.title}>
                    Cadastro do Professor
                </Text>

                <Text style={styles.textoInput}>
                    Nome Completo:
                </Text>
                <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbf5b"></Input>

                <Text style={styles.textoInput}>
                    E-mail:
                </Text>
                <Input placeholder="professor@email.com"  placeholderTextColor="#0b8cbf5b" keyboardType="email-address"></Input>

                <Text style={styles.textoInput}>
                    MASP/Matrícula:
                </Text>
                <Input placeholder="xxxxxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric"></Input>

                <Text style={styles.textoInput}>
                    Senha:
                </Text>
                <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry></Input>

                <View style={styles.botaoContainer}>
                    <Button
                        label="Cadastrar"
                        onPress={() => router.push("/professores")}
                    />
                </View>
            </View>
            
                </View>
        </ScrollView>
            
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
    }
})