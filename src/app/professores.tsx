import {Text, View, StyleSheet, Image, ScrollView, FlatList, Pressable} from "react-native"
import{Button} from "../../components/Button"
import {Link, router} from "expo-router"
import {useState} from "react"



export default function Login(){
    {/**ARRAY DE PROFESSORES */}
    const [professores, setProfessores] = useState([//professores guarda a lista atual e setProfessores atualiza
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

        const novaLista = professores.filter( //filter percorre toda a array
            (professor) => professor.id !== id //seleciona por id
        )

        setProfessores(novaLista) //atualiza a tela automaticamente
    }
    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {/**TITULO */}
                <Text style={styles.topo}>
                    PROFESSORES CADASTRADOS
                </Text>

                {/**LOGO */}
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.logo}>
                </Image>

                {/**LISTA DE PROFESSORES */}
                <FlatList
                    scrollEnabled={false} //bloqueia a rolagem
                    data={professores} //usar o array de professores
                    keyExtractor={(item) => item.id} //usa o id como chave identificadora para rodar o array todo
                    renderItem={({ item }) => ( //como cada item vai aparecer na tela

                            <Pressable style={styles.item}> {/**cada item vira uma área clicável */}
                            {/**CARD PROFESSORES */}
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

                                <Pressable onPress={() => excluirProfessor(item.id)}> {/**pega o id do item e chama a funçao excluirProfessor */}
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
        
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, //view oxupar a tela inteira
        //alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32 //margem
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
    textDecorationLine: "underline"
  },
  logo:{
    width: 200, //usar 100% da imagem
    height: 200, //altura
    alignSelf: "center"
    },
    botaoContainer:{
        alignItems: "center",
        marginTop: 20
    }
})
