import {Text, View, StyleSheet, Image,Pressable,TouchableOpacity} from "react-native"
import {Link, router} from "expo-router"
import { Button } from "../../components/Button"
import Footer from "../../components/Footer"
import React from "react"

export default function Rotina(){
    return(
        <View style={styles.container}>

             <Image 
                    source={require("../../assets/images/logoNome.png")}
                    style={styles.logo}>
             </Image>

            <View style={styles.botaoContainer}>
                <Button
                  label="Criar Rotina"
                  onPress={() => router.push("/criarRotina")}/>
            </View>

             <View style={styles.botaoContainer}>
                <Button
                  label="Minhas Rotinas"
                  onPress={() => router.push("/minhasRotinas")}/>
            </View>
             
             <View style={styles.botaoContainer}>
                <Button
                  label="Rotina Pronta"
                  onPress={() => router.push("/minhasRotinas")}/>
            </View>
            
            <Footer children={undefined} />
                    <View style={styles.barraMenuGeral}>
                    
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                      <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
                      <Text style={styles.tabLabel}>Início</Text>
                    </Pressable>
            
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                      <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
                      <Text style={styles.tabLabel}>Diário</Text>
                    </Pressable>
            
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
                      <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
                      <Text style={styles.tabLabel}>Rotina</Text>
                    </Pressable>
            
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                      <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
                      <Text style={styles.tabLabel}>Conf.</Text>
                    </Pressable>
            
                  </View>
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
    caixa: {
       flex: 1, //faz a View ocupar a tela toda
       justifyContent: "center", //centraliza vertical
       alignItems: "center",
    },
   logo:{
        width: 150, //usar 100% da imagem
        height: 170, //altura
    },
    botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
  },
  tabLabel: {
    fontSize: 14,                  
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 4,
  },
  iconeCustom: {
    width: 200,                     
    height: 70,
    resizeMode: "contain",         
  },
  barraMenuGeral: {
    flexDirection: "row",          // Alinha os botões na horizontal
    justifyContent: "space-around",// Distribui igualmente o espaço entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",    
    height: 90,                    
    paddingBottom: 30,             
    borderTopWidth: 3,             
    borderTopColor: "#F5F2E8",     
    borderTopLeftRadius: 35,       
    borderTopRightRadius: 35,      
    position: "absolute",          // Fixa no rodapé
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,                 
    shadowColor: "#000",
    marginTop: 20   
  },
  botaoContainer:{
    width: 250,
    height: 55,
    backgroundColor: "#2F1CA6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35
  },
})
