import React, { useEffect } from 'react';
import { StyleSheet, Animated, View, Dimensions } from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
    // 1. O valor mestre da animação começa em 0 e vai até 1
    const progressoAnimacao = new Animated.Value(0);

    useEffect(() => {
        // 2. Dispara a animação para rodar em 1.5 segundos
        Animated.timing(progressoAnimacao, {
            toValue: 1,
            duration: 1500, // 1500 milissegundos = 1,5 segundos
            useNativeDriver: true, // Garante que a animação rode lisa a 60 FPS
        }).start(() => {
            // 3. Quando a animação termina, redireciona para a próxima tela
            // Mude "/login" para a rota correta da sua próxima página
            router.replace("/login"); 
        });
    }, []);

    // 4. Configura o efeito de AMPLIAR (Scale)
    // Começa no tamanho original (1) e termina 10 vezes maior (10)
    const escalaDaLogo = progressoAnimacao.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 10] 
    });

    // 5. Configura o efeito de APAGAR (Opacity)
    // Começa 100% visível (1) e termina totalmente invisível (0)
    const opacidadeDaLogo = progressoAnimacao.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
    });

    return (
        <View style={styles.container}>
            {/* Imagem Animada aplicando os dois efeitos juntos no transform */}
            <Animated.Image 
                source={require("../assets/images/logo.png")} // Ajuste o caminho da sua logo se necessário
                style={[
                    styles.logo,
                    {
                        opacity: opacidadeDaLogo,
                        transform: [{ scale: escalaDaLogo }]
                    }
                ]} 
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F2E8", // Mantendo o fundo bege padrão do seu app
        justifyContent: "center",   // Centraliza a logo no meio vertical
        alignItems: "center",       // Centraliza a logo no meio horizontal
    },
    logo: {
        width: 160,
        height: 160
    }
});