import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/input";
import Footer from "../../components/Footer";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CadDiscente() {

    const [nome, setNome] = useState("");
    const [dataNasc, setDataNasc] = useState("");
    // Estados para Grau de Suporte
    const [aberto, setAberto] = useState(false);
    const [grau, setGrau] = useState("Selecione o grau de suporte");

    // Estados para Responsável (Pesquisa)
    const [editando, setEditando] = useState(false);
    const [responsavel, setResponsavel] = useState("Selecione o responsável");
    const [busca, setBusca] = useState("");

    const opcoes = ["Grau 1", "Grau 2", "Grau 3"];
    const listaResponsaveis = ["Alícia Garcia", "Clarice Peixoto", "Laura Barreto"];
    
    // Filtro para a busca
    const filtrados = listaResponsaveis.filter(r => 
        r.toLowerCase().includes(busca.toLowerCase())
    );

    const cadastrarDiscente = async () => {
        // 1. Validações básicas
        if (!nome || !dataNasc || grau === "Selecione o grau de suporte") {
            Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
            return;
        }

        // 2. Formatação da data
        let dataFormatada = dataNasc;
        if (dataNasc.includes('/')) {
            const partes = dataNasc.split('/');
            if (partes.length === 3) {
                const dia = partes[0].padStart(2, '0');
                const mes = partes[1].padStart(2, '0');
                const ano = partes[2];
                dataFormatada = `${ano}-${mes}-${dia}`;
            }
        }

        // 3. Envio para o Backend
        try {
            const response = await fetch('http://192.168.0.106/DiarioInclusivo/src/app/cadDiscente.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome: nome, 
                    dataNasc: dataFormatada, 
                    grau: grau 
                })
            });

            const resultado = await response.json();

            // 4. Verificação de sucesso
            if (resultado.success) {
                await AsyncStorage.setItem('@id_usuario_logado', resultado.idUsuario.toString());
                Alert.alert('Sucesso', 'Discente cadastrado com sucesso!');
                router.push("/inicio");
            } else {
                Alert.alert('Erro', resultado.message || 'Não foi possível realizar o cadastro.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
    };

    return (
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.itens}>
                    <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Cadastro do Discente</Text>

                    <Text style={styles.textoInput}>Nome Completo:</Text>
                    <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbfd1" value={nome} onChangeText={setNome} />

                    {/* CAMPO RESPONSÁVEL TRANSFORMÁVEL */}
                    <Text style={styles.textoInput}>Responsável:</Text>
                    {editando ? (
                        <Input 
                            placeholder="Digite o nome..." 
                            placeholderTextColor="#0b8cbfd1"
                            value={busca} 
                            onChangeText={setBusca} 
                            autoFocus
                        />
                    ) : (
                        <Pressable style={styles.select} onPress={() => setEditando(true)}> {/**ao clicar, muda para o modo de ediçao, que passa a ser true */}
                            <Text style={styles.selectTexto}>{responsavel}</Text> {/**mostra o nome do responsável selecionado ou a mensagem padrão */}
                        </Pressable>
                    )}

                     {/**se estiver editando, aparece a lista de responsaveis */}
                    {editando && ( 
                        <View style={styles.lista}>
                            <ScrollView style={{ maxHeight: 150 }}>
                                {/**percorre a lista com o método map */}
                                {filtrados.length > 0 ? (
                                    filtrados.map((item) => (
                                        <Pressable key={item} style={styles.opcao} onPress={() => {
                                            setResponsavel(item);
                                            setEditando(false);
                                            setBusca("");
                                        }}>
                                            <Text style={{ color: "#2F1CA6" }}>{item}</Text>
                                        </Pressable>
                                    ))
                                ) : (
                                    <Text style={{ padding: 15, color: "#0b8cbf5b" }}>Nenhum encontrado</Text> /**se nao mostra quenao foi encontrado */
                                )}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={styles.textoInput}>Data de Nascimento:</Text>
                    <Input placeholder="00/00/0000" placeholderTextColor="#0b8cbfd1" value={dataNasc} onChangeText={setDataNasc} />

                    {/* CAMPO GRAU DE SUPORTE */}
                    <Text style={styles.textoInput}>Grau de Suporte:</Text>

                    {/* Botão que abre a lista */}
                    <Pressable style={styles.select} onPress={() => setAberto(!aberto)}>
                        {/* Exibe o texto correspondente ao valor, ou o padrão */}
                        <Text style={styles.selectTexto}>
                            {grau === "1" ? "Grau 1" : grau === "2" ? "Grau 2" : grau === "3" ? "Grau 3" : "Selecione o grau de suporte"}
                        </Text>
                    </Pressable>

                    {/* Lista de opções */}
                    {aberto && (
                        <View style={styles.lista}>
                            <Pressable style={styles.opcao} onPress={() => { setGrau("1"); setAberto(false); }}>
                                <Text style={{ color: "#2F1CA6" }}>Grau 1</Text>
                            </Pressable>

                            <Pressable style={styles.opcao} onPress={() => { setGrau("2"); setAberto(false); }}>
                                <Text style={{ color: "#2F1CA6" }}>Grau 2</Text>
                            </Pressable>

                            <Pressable style={styles.opcao} onPress={() => { setGrau("3"); setAberto(false); }}>
                                <Text style={{ color: "#2F1CA6" }}>Grau 3</Text>
                            </Pressable>
                        </View>
                    )}
                    <View style={styles.botaoContainer}>
                        <Button label="Cadastrar" onPress={cadastrarDiscente} />
                    </View>
                </View>
            </View>
        </ScrollView>
        <Footer>
            <Text style={styles.textoRodape}>Diário Inclusivo.</Text>
        </Footer></>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", backgroundColor: "#F5F2E8", padding: 32 },
    itens: { justifyContent: "center", width: "100%", marginTop: -50},
    logo:{ width: 150, height: 150, alignSelf: "center",  },
    form: { gap: 5, width: "100%" },
    textoInput: { fontSize: 15, color: "#2F1CA6", fontWeight: "bold", marginLeft: 8, marginTop: 8 },
    botaoContainer: { alignItems: "center", marginTop: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: "#2F1CA6", marginLeft: 8, marginTop: 10 },
    select: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 50, padding: 15, backgroundColor: "#F5F2E8", marginTop: 5 },
    selectTexto: { color: "#0b8cbf5b", fontSize: 14 },
    lista: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 10, backgroundColor: "#F5F2E8", marginTop: 5, overflow: "hidden" },
    opcao: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#2e1ca667" },
    textoRodape: { color: "#0B8CBF", fontSize: 12, fontWeight: "500" }
});
