import { Link, router } from "expo-router"; //link cria links e o router vai para outra página
import { Image, StyleSheet, Text, View } from "react-native"; //blibiotecas importadas: View=> tipo o div no html; StyleSheet=> cria os estilos (parte parecida com o css)
import { Button } from "../../components/Button"; //puxa o componente Button criado, para ficar padrão, como uma função
import Footer from "../../components/Footer";

export default function Index(){
    return (
        <View style={styles.container}>

            {/*FRASE PRINCIPAL*/}
            <Text style={styles.title}> 
                Bem-vindo ao 
            </Text>
            <Text style={styles.title}> 
                Diário Inclusivo
            </Text>

                {/*SUBTITULO*/}
                <Text style={styles.subtitulo}>
                    O aplicativo que irá auxiliar na sua jornada.
                </Text>

            

            {/*LOGO DO SISTEMA*/}
            <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
            {/*Importa a imagem*/}

            {/*BOTÃO COM LINK PARA O CADASTRO*/}
            <Button 
                label="Criar conta"
                onPress={() => router.push("/cadRespAdm")}> {/*quando clicar, vai para a página do cadastro*/}
            </Button>

            {/*LINK PARA LOGIN*/}
            <Text style={styles.footerText}>
                Já possui uma conta?
                <Link href="/login" style={styles.link}>
                    <Text>Fazer login</Text>
                </Link>
            </Text>

            <Footer children={undefined} />

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
        textAlign: "center", //alinhar o texto no centro horizontal
        marginTop: 130 //margem em cima
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
    },
    footerText: {
        textAlign: "center",
        marginTop: "auto",
        color: "#0B8CBF",
        fontWeight: "bold",
        fontSize: 12
    },
    link: {
        textDecorationLine: "underline", //sublinhar o texto
        marginBottom: 20
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
})
