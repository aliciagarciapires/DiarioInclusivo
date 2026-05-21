import { router } from "expo-router"
import { useState } from "react"; //useState cria as variáveis de estado
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"; //pressable cria áreas clicáveis; scrollview permite rolar a tela
import { Button } from "../../components/Button"
import { Input } from "../../components/input"; /**Componentes criados personalizados */

export default function CadResp(){
    const [tipoConta, setTipoConta] = useState("responsavel"); /*cria uma variável de estado, ela guarda qualtipo de conta foi selecionada e, quando ela muda, a tela muda tbm, iniciando ela como responsável*/ 
    /*tipoConta armazena o valor, e o setTipoConta altera o valor*/

    return(
        <ScrollView>
            <View style={styles.container}>

                {/**TITULO */}
                <Text style={styles.topo}>
                    CADASTRO
                </Text>

                <View style={styles.itens}>

                    {/**LOGO */}
                    <Image
                        source={require("../../assets/images/logoNome.png")}
                        style={styles.logo} />

                    <Text style={styles.subtitulo}>
                        Selecione a opção de cadastro
                    </Text>

                    {/**ÁREA DOS BOTÕES */}
                    <View style={styles.selectContainer}>

                        {/**BOTÃO OPÇAO RESPONSÁVEL */}
                        <Pressable style={[styles.botaoSelect, tipoConta === "responsavel" && styles.botaoAtivo]} /**SEMPRE aplica o botaoSelect, e so SE o tipoConta for responsavel, aplica o botaoAtivo */
                            onPress={() => setTipoConta("responsavel")}>  {/**ao botao ser selecionado, a variável de estado tipoConta recebe responsavel */}
                            {/**TEXTO DENTRO DO BOTÃO */}
                            <Text style={styles.textoSelect}>
                                Responsável
                            </Text>
                        </Pressable>

                        {/**BOTÃO OPÇAO ADMINISTRADOR */}
                        <Pressable style={[styles.botaoSelect, tipoConta === "administrador" && styles.botaoAtivo]} /**SEMPRE aplica o botaoSelect, e so SE o tipoConta for responsavel, aplica o botaoAtivo */
                            onPress={() => setTipoConta("administrador")}> {/**ao botao ser selecionado, a variável de estado tipoConta recebe responsavel */}
                            {/**TEXTO DENTRO DO BOTÃO */}
                            <Text style={styles.textoSelect}>
                                Administrador
                            </Text>
                        </Pressable>

                    </View>


                    {tipoConta === "responsavel" ? ( /**SE tipoConta for responsável, monta o código abaixo */
                        <View>
                            <View style={styles.form}>
                                {/**FORMULÁRIO DE CADASTRO RESPONSÁVEL*/}
                                <Text style={styles.textoInput}>
                                    Nome Completo:
                                </Text>
                                <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbf5b" />

                                <Text style={styles.textoInput}>
                                    E-mail:
                                </Text>
                                <Input placeholder="usuario@email.com"  placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                                <Text style={styles.textoInput}>
                                    Telefone:
                                </Text>
                                <Input placeholder="(xx) xxxx-xxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric" />

                                <Text style={styles.textoInput}>
                                    Senha:
                                </Text>
                                <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                                <View style={styles.botaoContainer}>
                                    <Button
                                        label="Cadastrar"
                                        onPress={() => router.push("/inicio")}
                                    />
                                </View>
                                
                            </View>
                            
                        </View>
                    ) : ( /**SE nao, monta esse */
                        <View>
                           <View style={styles.form}>
                                {/**FORMULÁRIO DE CADASTRO ADMINISTRADOR */}
                                <Text style={styles.textoInput}>
                                    Nome da Escola:
                                </Text>
                                <Input placeholder="Nome da Instituição" placeholderTextColor="#0b8cbf5b" />

                                <Text style={styles.textoInput}>
                                    E-mail Institucional:
                                </Text>
                                <Input placeholder="escola@email.com"  placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                                <Text style={styles.textoInput}>
                                    Código INEP:
                                </Text>
                                <Input placeholder="xxxxxxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric" />

                                <Text style={styles.textoInput}>
                                    Senha:
                                </Text>
                                <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                                <View style={styles.botaoContainer}>
                                    <Button
                                        label="Cadastrar"
                                        onPress={() => router.push("/cadProf")}
                                    />
                                </View>
                                
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, //view oc|upar a tela inteira
        alignItems: "center", //centraliza na horizontal
        backgroundColor: "#F5F2E8", //cor do fundo
        padding: 32 //margem
    },
    topo: {
        justifyContent: "flex-start", //elementos no início da direçao da flex
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
        width: 200, //usar 100% da imagem
        height: 200, //altura
        marginTop: 25, //margem do topo
        alignSelf: "center" //apenas esse item no centro
    },
    selectContainer:{
        flexDirection: "row", //coloca os elemento lado a lado
        gap: 8, //espaço entre os elementos
        justifyContent: "center"
    },
    botaoSelect: {
        backgroundColor: "#2e1ca63f",
        paddingVertical: 20,
        paddingHorizontal: 35,
        borderRadius: 40 //arrendonda as bordas
    },
    botaoAtivo:{
        backgroundColor: "#2F1CA6", //muda a cor quando selecionado
    },
    textoSelect: {
        color: "#F5F2E8",
        fontWeight: "bold"
    },
    subtitulo: {
        fontSize: 19, //tamanho da fonte
        fontWeight: "bold", //texto em negrito
        color: "#2F1CA6", //cor do texto
        textAlign: "center", //alinhar o texto no centro horizontal
        marginBottom: 10,
        marginTop: 25
    }, 
    form : {//organiza os campos
        marginTop: 12,
        gap: 5
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
    }
})