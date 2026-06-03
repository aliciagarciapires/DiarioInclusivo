import {Text, StyleSheet, TouchableOpacity, TouchableOpacityProps} from "react-native"
import {router} from "expo-router"

type ButtonProps = TouchableOpacityProps & { //representa todas as propriedades que o botao pode receber; terá todas e MAIS a label, obrigatoriamente
    label: string
}

export function Button ({label, ...rest}: ButtonProps){
    return(
        <TouchableOpacity style={styles.container} activeOpacity={0.5} {...rest}> {/**cria o botão clicável e define o tempo que a cor fica mais clara quando é clicado */}
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
