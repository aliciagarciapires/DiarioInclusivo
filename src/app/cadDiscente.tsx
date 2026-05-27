import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/input";
import Footer from "../../components/Footer";

export default function CadDiscente() {
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

    return (
        <><ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.itens}>
                    <Image source={require("../../assets/images/logoNome.png")} style={styles.logo} />
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Cadastro do Discente</Text>

                    <Text style={styles.textoInput}>Nome Completo:</Text>
                    <Input placeholder="Nome Completo" placeholderTextColor="#0b8cbf5b" />

                    {/* CAMPO RESPONSÁVEL TRANSFORMÁVEL */}
                    <Text style={styles.textoInput}>Responsável:</Text>
                    {editando ? (
                        <Input 
                            placeholder="Digite o nome..." 
                            placeholderTextColor="#0b8cbf5b"
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
                    <Input placeholder="00/00/0000" placeholderTextColor="#0b8cbf5b" />

                    <Text style={styles.textoInput}>Grau de Suporte:</Text>
                    <Pressable style={styles.select} onPress={() => setAberto(!aberto)}>
                        <Text style={styles.selectTexto}>{grau}</Text>
                    </Pressable>

                    {aberto && (
                        <View style={styles.lista}>
                            {opcoes.map((item) => (
                                <Pressable key={item} style={styles.opcao} onPress={() => {
                                    setGrau(item);
                                    setAberto(false);
                                }}>
                                    <Text style={{ color: "#2F1CA6" }}>{item}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    <View style={styles.botaoContainer}>
                        <Button label="Cadastrar" onPress={() => router.push("/discente")} />
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
    itens: { justifyContent: "center", width: "100%" },
    logo: { width: 200, height: 200, marginTop: 25, alignSelf: "center" },
    form: { marginTop: 12, gap: 5, width: "100%" },
    textoInput: { fontSize: 15, color: "#2F1CA6", fontWeight: "bold", marginLeft: 8, marginTop: 8 },
    botaoContainer: { alignItems: "center", marginTop: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: "#2F1CA6", marginLeft: 8, marginTop: 10 },
    select: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 50, padding: 15, backgroundColor: "#F5F2E8", marginTop: 5 },
    selectTexto: { color: "#0b8cbf5b", fontSize: 14 },
    lista: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 10, backgroundColor: "#F5F2E8", marginTop: 5, overflow: "hidden" },
    opcao: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#2e1ca667" },
    textoRodape: { color: "#0B8CBF", fontSize: 12, fontWeight: "500" }
});