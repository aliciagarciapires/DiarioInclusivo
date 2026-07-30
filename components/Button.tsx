import { Text, StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native"
import React from "react"

type ButtonProps = TouchableOpacityProps & {
    label: string
}

export function Button ({label, ...rest}: ButtonProps){
    return(
        /* Cria o botão clicável e define a opacidade ao clicar */
        <TouchableOpacity style={styles.container} activeOpacity={0.5} {...rest}>
            <Text style={styles.label}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "70%",
        height: 50,
        backgroundColor: "#2F1CA6",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50
    },
    label: {
        color: "#F5F2E8",
        fontSize: 19,
        fontWeight: "bold"
    }
})