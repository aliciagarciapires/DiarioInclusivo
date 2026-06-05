import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

export default function CadResp() {

    const [tipoConta, setTipoConta] = useState("1"); 
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const cadastrarResponsavel = async () => {
        // 1. Validação básica
        if (!nome || !email || !telefone || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        // 2. Envio para o Backend
        try {
            const response = await fetch('http://192.168.0.108/DiarioInclusivo/src/app/cadResp.php', { // Ajuste a URL conforme seu servidor
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, telefone, senha, tipoConta })
            });

            const textResponse = await response.text();

            if (response.ok) {
                Alert.alert('Sucesso', 'Cadastro realizado!');
                router.push("/inicio"); // Só redireciona se o servidor confirmar o sucesso
            } else {
                Alert.alert('Erro do Servidor', textResponse); 
                console.log("Erro bruto:", textResponse);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
        }
    };

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
                {/**LOGO */}
                <View style={styles.itens}>
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.logo} />
                </View>
                    

                    <Text style={styles.subtitulo}>
                        Selecione a opção de cadastro
                    </Text>

                    {/** ÁREA DOS BOTÕES */}
                    <View style={styles.selectContainer}>

                        {/** BOTÃO OPÇAO RESPONSÁVEL */}
                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "1" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("1")}
                        > 
                            <Text style={styles.textoSelect}>
                                Responsável
                            </Text>
                        </Pressable>

                        {/** BOTÃO OPÇAO ADMINISTRADOR */}
                        <Pressable 
                            style={[styles.botaoSelect, tipoConta === "2" && styles.botaoAtivo]} 
                            onPress={() => setTipoConta("2")}
                        > 
                            <Text style={styles.textoSelect}>
                                Administrador
                            </Text>
                        </Pressable>

                    </View>

                    {tipoConta === "1" ? ( 
                        <View style={styles.form}>
                           
                            {/** FORMULÁRIO DE CADASTRO RESPONSÁVEL */}
                            <Text style={styles.textoInput}>Nome Completo:</Text>
                            <Input 
                                placeholder="Nome Completo" 
                                placeholderTextColor="#0b8cbfd1" 
                                value={nome}
                                onChangeText={setNome}
                            />

                            <Text style={styles.textoInput}>E-mail:</Text>
                            <Input 
                                placeholder="usuario@email.com" 
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="email-address" 
                            />

                            <Text style={styles.textoInput}>Telefone:</Text>
                            <Input 
                                placeholder="(xx) xxxx-xxxx" 
                                placeholderTextColor="#0b8cbfd1" 
                                keyboardType="numeric" 
                                value={telefone}
                                onChangeText={setTelefone}
                            />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input 
                                placeholder="**********" 
                                placeholderTextColor="#0b8cbfd1" 
                                secureTextEntry 
                                value={senha}
                                onChangeText={setSenha}
                            />

                            <Text style={styles.textoInput}>Confirmar Senha:</Text>
                            <Input 
                                placeholder="**********" 
                                placeholderTextColor="#0b8cbfd1" 
                                secureTextEntry 
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                            />

                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Cadastrar"
                                    onPress={cadastrarResponsavel}
                                />
                            </View>
                        </View>
                    ) : ( 
                        <View style={styles.form}>
                            <Text style={styles.subtitulo2}>
                                Preencha os campos abaixo para nos enviar a solicitação de cadastro para a equipe do Diário Inclusivo.
                            </Text>
                            {/** FORMULÁRIO DE CADASTRO ADMINISTRADOR */}
                            <Text style={styles.textoInput}>Nome da Escola:</Text>
                            <Input placeholder="Nome da Instituição" placeholderTextColor="#0b8cbfd1" />

                            <Text style={styles.textoInput}>E-mail Institucional:</Text>
                            <Input placeholder="escola@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>E-mail do Administrador:</Text>
                            <Input placeholder="adm@email.com" placeholderTextColor="#0b8cbfd1" keyboardType="email-address" />

                            <Text style={styles.textoInput}>Senha:</Text>
                            <Input placeholder="**********" placeholderTextColor="#0b8cbfd1" secureTextEntry />


                            <View style={styles.botaoContainer}>
                                <Button
                                    label="Enviar Solicitação"
                                    onPress={() => router.push("/cadProf")}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
            <Footer>
                <Text style={styles.textoRodape}>
                    Diário Inclusivo.
                </Text>
            </Footer>

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
        paddingBottom: 50,          // Espaço para o rodapé fixo
    },
    itens: {
        justifyContent: "flex-start", // Garante que tudo fique no topo
        width: "100%",
        marginTop: -10,
    },
    logo:{
        width: 150, //usar 100% da imagem
        height: 150, //altura
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
        fontSize: 18,
        fontWeight: "bold",
        color: "#2F1CA6",
        textAlign: "center",
        marginBottom: 5, // Espaço mínimo entre o texto e os botões
    },
    subtitulo2: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#088CBF",
        textAlign: "center",
        marginBottom: 5, // Espaço mínimo entre o texto e os botões
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
