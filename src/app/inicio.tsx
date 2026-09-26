import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "../../components/Button";

export default function Inicio(){
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F2E8",
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    title: {
        width: "100%",
        flexShrink: 1,
        fontSize: 32,
        fontWeight: "bold", 
        color: "#2F1CA6", 
        textAlign: "center" 
    },
    subtitulo: {
        width: "100%",
        flexShrink: 1,
        fontSize: 15,
        color: "#0B8CBF",
        textAlign: "center",
        marginTop: 12,
        marginBottom: 20
    },
    logo: {
        width: "100%",
        maxWidth: 320,
        height: 200,
        marginBottom: 30
    }
});