import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer"; // 1. IMPORTA O MENU DO STACK

export default function Login(){
    {/**ARRAY DE PROFESSORES */}
    const [professores, setProfessores] = useState([
      {
        id: "1",
        nome: "Professor 1",
        email: "professor1@escola.com",
        masp_matricula: "1234567"
      },
      {
        id: "2",
        nome: "Professor 2",
        email: "professor2@escola.com",
        masp_matricula: "7654321"
      }
    ])

    {/**FUNÇÃO DE EXCLUIR DA LISTA */}
    function excluirProfessor(id: string){
        const novaLista = professores.filter( 
            (professor) => professor.id !== id 
        )
        setProfessores(novaLista) 
    }

    return(
        // 2. VIEW PRINCIPAL ENVOLVENDO TUDO PARA FIXAR A BARRA EMBAIXO
        <View style={styles.containerPrincipal}>
            
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                <View style={styles.container}>

                    {/**LOGO */}
                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo} 
                    />

                    {/**LISTA DE PROFESSORES */}
                    <FlatList
                        scrollEnabled={false} 
                        data={professores} 
                        keyExtractor={(item) => item.id} 
                        renderItem={({ item }) => ( 

                            <Pressable style={styles.item}> 
                                <View>
                                    <Text style={styles.nome}>
                                        {item.nome}
                                    </Text>

                                    <Text style={styles.info}>
                                        {item.email}
                                    </Text>

                                    <Text style={styles.info}>
                                        {item.masp_matricula}
                                    </Text>

                                    <Pressable onPress={() => excluirProfessor(item.id)}> 
                                        <Text style={styles.excluir}>
                                            Excluir
                                        </Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                        )}
                    />

                    <View style={styles.botaoContainer}>
                        <Button
                            label="Adicionar Mais"
                            onPress={() => router.push("/cadProf")}
                        />
                    </View>
                </View>
            </ScrollView>

            {/** 3. CHAMA O MENU INFERIOR FIXO */}
            <Footer />
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
    // Novo contêiner pai
    containerPrincipal: {
        flex: 1,
        backgroundColor: "#F5F2E8",
    },
    container: {
        flex: 1, 
        backgroundColor: "#F5F2E8", 
        padding: 32,
        paddingBottom: 120 // Espaço de segurança essencial para o conteúdo não sumir atrás do MenuBar
    },
    topo: {
        justifyContent: "flex-start",
        textAlign: "center",
        marginTop: 20,
        color: "#2F1CA6",
        fontWeight: "bold",
        fontSize: 18
    },
    item: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#2F1CA6",
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        backgroundColor: "#F5F2E8",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    nome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2F1CA6",
        marginBottom: 4
    },
    info: {
        fontSize: 14,
        color: "#2e1ca687",
        marginBottom: 2
    },
    excluir: {
        fontSize: 16,
        color: "#F22222",
        textDecorationLine: "underline",
        marginTop: 6 // Um espacinho a mais para o botão de excluir não colar nos dados
    },
    logo:{
        width: 200, 
        height: 200, 
        alignSelf: "center"
    },
    botaoContainer:{
        alignItems: "center",
        marginTop: 20
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
});