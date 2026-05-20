import { router } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from "react-native"
import { Button } from "../../components/Button"
import { Input } from "../../components/input"
import { useState } from "react"

export default function CadDiscente(){
    {/**controla se a lista do slect ta aberta ou fechada */}
    const [aberto, setAberto] = useState(false) //inicialmente fechada, false, quando aberta, true
    const [grau, setGrau] = useState("Selecione o grau de suporte") //guarda o valor selecionado da opçao, inicialmente, apena o texto para selecionar

    {/**LISTA DE OPÇÕES */}
    const opcoes = [
        "Grau 1",
        "Grau 2",
        "Grau 3"
    ]

    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

            <View style={styles.container}>
                {/**TOPO */}
                <Text style={styles.topo}>
                    CADASTRO
                </Text>

                {/**LOGO */}
                <View style={styles.itens}>
                    <Image
                        source={require("../../assets/images/logoNome.png")}
                        style={styles.logo}>
                    </Image>
                </View>

                {/**FORMULÁRIO */}
                <View style={styles.form}>

                    <Text style={styles.title}>
                        Cadastro do Discente
                    </Text>

                    <Text style={styles.textoInput}>
                        Nome Completo do Discente:
                    </Text>
                    <Input
                        placeholder="Nome Completo"
                        placeholderTextColor="#0b8cbf5b">
                    </Input>

                    <Text style={styles.textoInput}>
                        Nome Completo do Responsável:
                    </Text>
                    <Input
                        placeholder="Nome Completo"
                        placeholderTextColor="#0b8cbf5b">
                    </Input>

                    <Text style={styles.textoInput}>
                        Data de Nascimento:
                    </Text>
                    <Input
                        placeholder="00/00/0000"
                        placeholderTextColor="#0b8cbf5b">
                    </Input>

                    <Text style={styles.textoInput}>
                        Grau de Suporte:
                    </Text>

                    {/**SELECT */}
                    <Pressable
                        style={styles.select}
                        onPress={() => setAberto(!aberto)}//!aberto inverte o valor, ou seja, se aberto = false, !aberto faz aberto = true, isso a cada clique, ou seja, ao clicar a primeira vez, abrir, será true
                    >
                        <Text style={styles.selectTexto}>{/**texto do select com cada opção */}
                            {grau}
                        </Text>
                    </Pressable>

                    {aberto && ( //SE aberto é igual a true, percorre a lista de opçoes, fazendo o código abaixo
                        <View style={styles.lista}>

                            {opcoes.map((item) => (
                                <Pressable //cria um pressable para cada opçao
                                    key={item}
                                    style={styles.opcao}
                                    onPress={() => { //quando clicar
                                        setGrau(item) //muda o texto do select para o selecionado
                                        setAberto(false) //fecha a lista
                                    }}
                                >
                                    <Text style={{ color: "#0b8cbf5b"}}>
                                        {item}
                                    </Text>
                                </Pressable>
                            ))}

                        </View>
                    )}

                    <View style={styles.botaoContainer}>
                        <Button
                            label="Cadastrar"
                            onPress={() => router.push("/discente")}
                        />
                    </View>

                </View>

            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#F5F2E8",
        padding: 32,
    },

    topo: {
        justifyContent: "flex-start",
        marginTop: 20,
        color: "#2F1CA6",
        fontWeight: "bold",
        fontSize: 18
    },

    itens: {
        justifyContent: "center",
        width: "100%"
    },

    logo:{
        width: 200,
        height: 200,
        marginTop: 25,
        alignSelf: "center"
    },

    form : {
        marginTop: 12,
        gap: 5,
        width: "100%"
    },

    textoInput: {
        fontSize: 15,
        color: "#2F1CA6",
        fontWeight: "bold",
        marginLeft: 8,
        marginTop: 8
    },

    botaoContainer:{
        alignItems: "center",
        marginTop: 20
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2F1CA6",
        marginLeft: 8,
        marginTop: 10
    },

    select: {
        borderWidth: 1,
        borderColor: "#2F1CA6",
        borderRadius: 50,
        padding: 15,
        backgroundColor: "#F5F2E8",
        marginTop: 5
    },

    selectTexto: {
        color: "#0b8cbf5b",
        fontSize: 14
    },

    lista: {
        borderWidth: 1,
        borderColor: "#2F1CA6",
        borderRadius: 10,
        backgroundColor: "#F5F2E8",
        marginTop: 5,
        overflow: "hidden",
        textShadowColor: "#2F1CA6"
    },

    opcao: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2e1ca667"
    }
})