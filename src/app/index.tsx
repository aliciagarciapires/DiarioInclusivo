import { Link, router } from "expo-router"; 
import { Image, StyleSheet, Text, View } from "react-native"; 
import { Button } from "../../components/Button"; 
import Footer from "../../components/Footer";
import React from "react";

export default function Index(){
    return (
        <View style={styles.container}>

            <View style={{marginTop: 140}}>
                <Text style={styles.title}> 
                    Bem-vindo ao  
                </Text>
                <Text style={styles.title}> 
                    Diário Inclusivo 
                </Text>
            </View>
            

            <Text style={styles.subtitulo}> 
               O aplicativo que irá auxiliar na sua jornada. 
            </Text>
            
            <Image 
                source={require("../../assets/images/logo.png")}
                style={styles.logo} />

            
            <Button 
                label="Criar conta"
                onPress={() => router.push("/cadRespAdm")}/> 
            

           
            <Text style={styles.footerText}>
                Já possui uma conta?
            </Text>
            <Link href="/login" style={styles.link}>
                    <Text style={styles.footerText}>Fazer login</Text>
            </Link>

            <Footer children={undefined} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center",  
        alignItems: "center", 
        backgroundColor: "#F5F2E8", 
        padding: 32 
    },
    title: {
        fontSize: 36, 
        fontWeight: "bold", 
        color: "#2F1CA6", 
        textAlign: "center", 
    },
    subtitulo: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#0B8CBF",
        marginTop: 10,
    },
    logo:{
        width: "100%", 
        height: 210, 
        marginTop: 10 
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
        textDecorationLine: "underline", 
        marginBottom: 20
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
})