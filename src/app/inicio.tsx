import {Text, View, StyleSheet, Image} from "react-native"
import{Button} from "../../components/Button"
import {Link, router} from "expo-router"

export default function Inicio(){
    return (
        <View style={styles.container}>
            {/**TITULO */}
            <Text style={styles.title}>
                Bem-vindo ao {"\n"}
                Diário Inclusivo
                {/**SUBTITULO */}
                <Text style={styles.subtitulo}>
                    {"\n\n"}O aplicativo que irá auxiliar na sua jornada.
                </Text>
            </Text>

            {/**LOGO */}
            <Image 
                source={require("../../assets/images/logo.png")}
                style={styles.logo}>
            </Image>

            {/**BOTAO INICIAR */}
            <Button 
                label="Iniciar"
                onPress={() => router.push("/discente")}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, //view ocupar a tela inteira
        justifyContent: "center", //centraliza na vertical 
        alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32 //margem
    },
    title: {
        fontSize: 36, //tamanho da fonte
        fontWeight: "bold", //texto em negrito
        color: "#2F1CA6", //cor do texto
        textAlign: "center" //alinhar o texto no centro horizontal
    },
    subtitulo: {
        fontSize: 15,
        color: "#0B8CBF"
    },
    logo:{
        width: "100%", //usar 100% da imagem
        height: 210, //altura
        marginTop: 10 //margem do topo
    },
    textoBotao: {
        fontSize: 25, 
        fontWeight: "bold", 
        color: "#F5F2E8", 
        textAlign: "center" 
    }
})