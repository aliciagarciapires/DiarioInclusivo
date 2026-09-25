import { router } from "expo-router"
import React from "react"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { Button } from "../../components/Button"

export default function Rotina(){
    return(
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >

             <Image 
                    source={require("../../assets/images/logoNome.png")}
                    style={styles.logo}>
             </Image>

            <View style={styles.caixa}>
                 <View style={styles.botao}>
                   
                    <Text style={styles.textoBotao}>Diário</Text>       
            </View>
             <Button style={styles.botao}  onPress={() => router.push("/rotina")}
              label="Rotina"
             />
             <View style={styles.botao}>
                <Text style={styles.textoBotao}>Configurações</Text>
            </View>
            </View>
           
        </ScrollView>
        
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, //view oxupar a tela inteira
        alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32 //margem
    },
     contentContainer: {
         flexGrow: 1,
         alignItems: "center",
         paddingBottom: 24,
     },
    topo: {
        justifyContent: "flex-start",
        marginTop: 20,
        color: "#2F1CA6",
        fontWeight: "bold",
        fontSize: 18
    },
    caixa: {
       flex: 1, //faz a View ocupar a tela toda
       justifyContent: "center", //centraliza vertical
       alignItems: "center",
       marginBottom: 230
    },
    botao: {
       marginTop: 50,
       width: 250,
       height: 50,
       backgroundColor: "#2F1CA6",
       borderRadius: 15,
       justifyContent: "center", //centraliza vertical
       alignItems: "center" //centraliza horizontal
    },
    textoBotao: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
   logo:{
        width: "60%", //usar 100% da imagem
        height: 200, //altura
        marginTop: 20 //margem do topo
    },
})
