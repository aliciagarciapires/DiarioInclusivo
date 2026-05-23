import { router } from "expo-router";
import { useState } from "react"; 
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"; 
import { Button } from "../../components/Button";
import { Input } from "../../components/input"; 
import  Footer  from "../../components/Footer";

export default function CadResp(){
    const [tipoConta, setTipoConta] = useState("responsavel"); 

    return(
        // 1. ESTA VIEW PRINCIPAL AGORA ENVOLVE TUDO E SEGURA O RODAPÉ EMBAIXO
        <View style={styles.containerPrincipal}>
            
            {/* 2. O SCROLLVIEW FICA APENAS PARA O CONTEÚDO DO FORMULÁRIO */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.itens}>

                    {/** LOGO */}
                    <Image
                        source={require("../../assets/images/logoNome.png")}
                        style={styles.logo} 
                    />

                    <Text style={styles.subtitulo}>
                        Selecione a opção de cadastro
                    </Text>

                    {/** ÁREA DOS BOTÕES */}
                    <View style={styles.selectContainer}>

                        {/** BOTÃO OPÇAO RESPONSÁVEL */}
                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "responsavel" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("responsavel")}
                        > 
                            <Text style={styles.textoSelect}>
                                Responsável
                            </Text>
                        </Pressable>

                        {/** BOTÃO OPÇAO ADMINISTRADOR */}
                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "administrador" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("administrador")}
                        > 
                            <Text style={styles.textoSelect}>
                                Administrador
                            </Text>
                        </Pressable>

                    </View>

                    {tipoConta === "responsavel" ? ( 
                        <View style={styles.form}>
                            {/** FORMULÁRIO DE CADASTRO RESPONSÁVEL */}
                            <Text style={styles.textoInput}>Nome Completo:</Text>
                            <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbf5b" />

                            <Text style={styles.textoInput}>E-mail:</Text>
                            <Input placeholder="usuario@email.com" placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Telefone:</Text>
                            <Input placeholder="(xx) xxxx-xxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Cadastrar"
                                    onPress={() => router.push("/inicio")}
                                />
                            </View>
                        </View>
                    ) : ( 
                        <View style={styles.form}>
                            {/** FORMULÁRIO DE CADASTRO ADMINISTRADOR */}
                            <Text style={styles.textoInput}>Nome da Escola:</Text>
                            <Input placeholder="Nome da Instituição" placeholderTextColor="#0b8cbf5b" />

                            <Text style={styles.textoInput}>E-mail Institucional:</Text>
                            <Input placeholder="escola@email.com" placeholderTextColor="#0b8cbf5b" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Código INEP:</Text>
                            <Input placeholder="xxxxxxxx" placeholderTextColor="#0b8cbf5b" keyboardType="numeric" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbf5b" secureTextEntry />

                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Cadastrar"
                                    onPress={() => router.push("/cadProf")}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    // NOVOS ESTILOS ESTRUTURAIS:
    containerPrincipal: {
        flex: 1,                    // Ocupa a tela inteira para segurar o rodapé na base
        backgroundColor: "#F5F2E8",  // Cor bege de fundo
    },
    scrollContent: {
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 40,          // Espaço extra no fim do formulário para não colar no rodapé ao rolar
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
    selectContainer:{
        flexDirection: "row", 
        gap: 8, 
        justifyContent: "center"
    },
    botaoSelect: {
        backgroundColor: "#2e1ca63f",
        paddingVertical: 20,
        paddingHorizontal: 35,
        borderRadius: 40 
    },
    botaoAtivo:{
        backgroundColor: "#2F1CA6", 
    },
    textoSelect: {
        color: "#F5F2E8",
        fontWeight: "bold"
    },
    subtitulo: {
        fontSize: 19, 
        fontWeight: "bold", 
        color: "#2F1CA6", 
        textAlign: "center", 
        marginBottom: 10,
        marginTop: 25
    }, 
    form : {
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
    },
    // ESTILOS DO RODAPÉ FIXO:
    rodapeFixo: {
        backgroundColor: "#F5F2E8", // Mantém o fundo bege para parecer integrado
        paddingBottom: 28,          // Espaço de segurança para a barra de navegação/Home do iPhone
        paddingTop: 12,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        // Opcional: Uma linha sutil se quiser separar o rodapé (remover se preferir totalmente liso)
        borderTopWidth: 0.5,
        borderTopColor: "#0b8cbf33", 
    },
    textoRodape: {
        color: "#0B8CBF",
        fontSize: 12,
        fontWeight: "500",
    }
});