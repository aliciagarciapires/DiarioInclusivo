import { Text, View, StyleSheet, Image } from "react-native";
import { Button } from "../../components/Button";
import { Link, router } from "expo-router";
import React from "react";

export default function Inicio(){
    return (
        <View style={styles.container}>
            {/* TÍTULO */}
            <Text style={styles.title}>
                Bem-vindo ao {"\n"}
                Diário Inclusivo
            </Text>

            {/* SUBTÍTULO */}
            <Text style={styles.subtitulo}>
                O aplicativo que irá auxiliar na sua jornada.
            </Text>

            {/* LOGO */}
            <Image 
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* BOTÃO INICIAR */}
            <Button 
                label="Iniciar"
                onPress={() => router.push("/discente")}
            />
        </View>
    );
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
        fontSize: 32, // Ajustado ligeiramente para evitar cortes em ecrãs menores
        fontWeight: "bold", 
        color: "#2F1CA6", 
        textAlign: "center" 
    },
    subtitulo: {
        fontSize: 15,
        color: "#0B8CBF",
        textAlign: "center",
        marginTop: 12, // Espaçamento adequado em relação ao título
        marginBottom: 20
    },
    logo: {
        width: "100%", 
        height: 200, 
        marginBottom: 30 // Espaçamento entre a imagem e o botão
    }
});