import { StyleSheet, TextInput, TextInputProps } from "react-native"; //TextInputProps apresenta todas as propriedades que o input pode ter

export function Input({...rest}: TextInputProps){ //o rest pega todas as propriedades enviadas
    return <TextInput style={styles.input} {...rest} /> //{...rest} passa todas as propriedades
}

{/**ESTILO DO INPUT */}
const styles = StyleSheet.create({
    input: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderColor: "#2F1CA6",
        borderRadius: 40,
        fontSize: 14,
        paddingLeft: 18
    }
})