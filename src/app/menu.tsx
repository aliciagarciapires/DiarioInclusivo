import {Text, View, StyleSheet, Image} from "react-native"

export default function Menu(){
    return(
        <View style={styles.container}>
            <Text style={styles.topo}>
                MENU
            </Text>
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, //view oxupar a tela inteira
        alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32 //margem
    },
    topo: {
        justifyContent: "flex-start",
        marginTop: 20,
        color: "#2F1CA6",
        fontWeight: "bold",
        fontSize: 18
    }
})