import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { Input } from "../../components/input";

interface Responsavel {
  id: number;
  nome: string;
}

export default function CadDiscente() {
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  
  const [aberto, setAberto] = useState(false);
  const [grau, setGrau] = useState("Selecione o grau de suporte");

  const [editando, setEditando] = useState(false);
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<Responsavel[]>([]);
  const [listaResponsaveis, setListaResponsaveis] = useState<Responsavel[]>([]);
  const [busca, setBusca] = useState("");

  const aplicarMascaraData = (text: string) => {
    const limpo = text.replace(/\D/g, "");
    let formatado = limpo;
    if (limpo.length > 2 && limpo.length <= 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    } else if (limpo.length > 4) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}/${limpo.slice(4, 8)}`;
    }
    setDataNasc(formatado);
  };

  const validarDataNascimento = (dataString: string) => {
    if (dataString.length < 10) return { valida: false, mensagem: 'Digite a data completa (DD/MM/AAAA).' };
    const partes = dataString.split('/');
    if (partes.length !== 3) return { valida: false, mensagem: 'Formato de data inválido.' };

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (mes < 1 || mes > 12) return { valida: false, mensagem: 'Mês inválido.' };

    const dataObjeto = new Date(ano, mes - 1, dia);
    if (dataObjeto.getFullYear() !== ano || dataObjeto.getMonth() !== mes - 1 || dataObjeto.getDate() !== dia) {
      return { valida: false, mensagem: 'Data inexistente.' };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataObjeto > hoje) return { valida: false, mensagem: 'Data não pode ser no futuro.' };
    if (ano < 1900) return { valida: false, mensagem: 'Ano inválido.' };

    return { valida: true };
  };

  useEffect(() => {
    const buscarResponsaveis = async () => {
      try {

        const response = await fetch('https://diarioinclusivo.linceonline.com.br/buscar_responsaveis.php');

        const dados = await response.json();
        if (Array.isArray(dados)) {
          setListaResponsaveis(dados);
        } else {
          setListaResponsaveis([]);
        }
      } catch (error) {
        console.error("Erro na busca de responsáveis:", error);
        setListaResponsaveis([]);
      }
    };

    buscarResponsaveis();
  }, []);

  const alternarSelecao = (item: Responsavel) => {
    const jaSelecionado = responsaveisSelecionados.some((r) => r.id === item.id);
    if (jaSelecionado) {
      setResponsaveisSelecionados(responsaveisSelecionados.filter((r) => r.id !== item.id));
    } else {
      setResponsaveisSelecionados([...responsaveisSelecionados, item]);
    }
  };

  const listaSegura = Array.isArray(listaResponsaveis) ? listaResponsaveis : [];
  const filtrados = listaSegura.filter((r) => {
    if (!busca || busca.trim() === "") return true;
    return r.nome ? r.nome.toLowerCase().includes(busca.toLowerCase()) : false;
  });

 const cadastrarDiscente = async () => {
  if (!nome.trim() || !dataNasc.trim() || grau === "Selecione o grau de suporte") {
    Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const validacaoData = validarDataNascimento(dataNasc);
  if (!validacaoData.valida) {
    Alert.alert('Data Inválida', validacaoData.mensagem);
    return;
  }

  if (responsaveisSelecionados.length === 0) {
    Alert.alert('Erro', 'Selecione pelo menos um responsável.');
    return;
  }

  // CHAVE CORRIGIDA PARA "idUsuario"
  const idUsuarioLogado = await AsyncStorage.getItem("idUsuario");

  if (!idUsuarioLogado) {
    Alert.alert('Erro de Autenticação', 'Sessão expirada ou não encontrada. Faça login novamente.');
    return;
  }

  const partes = dataNasc.split('/');
  const dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  const idsResponsaveis = responsaveisSelecionados.map((r) => r.id);

  try {
    const response = await fetch('https://diarioinclusivo.linceonline.com.br/cadDiscente.php', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nome: nome, 
        dataNasc: dataFormatada, 
        grau: grau,
        idUsuarioLogado: idUsuarioLogado, // Envia o idUsuario correto do login
        idsResponsaveis: idsResponsaveis 
      })
    });

    const resultado = await response.json();

    if (resultado.success) {
      Alert.alert('Sucesso', 'Discente cadastrado com sucesso!');
      router.push("/discente");
    } else {
      Alert.alert('Erro', resultado.message || 'Não foi possível realizar o cadastro.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
  }
};
  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}>
        <View style={styles.container}>
          <View style={styles.itens}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Cadastro do Discente</Text>

            <Text style={styles.textoInput}>Nome Completo:</Text>
            <Input 
              placeholder="Nome Completo" 
              placeholderTextColor="#0b8cbfd1" 
              value={nome} 
              onChangeText={setNome} 
            />

            <Text style={styles.textoInput}>Responsáveis:</Text>
            
            <View style={styles.containerTags}>
              {responsaveisSelecionados.map((item) => (
                <View key={item.id} style={styles.tag}>
                  <Text style={styles.tagTexto}>{item.nome}</Text>
                  <Pressable onPress={() => alternarSelecao(item)}>
                    <Text style={styles.tagFechar}> ✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {editando ? (
              <Input 
                placeholder="Digite para buscar..." 
                placeholderTextColor="#0b8cbfd1"
                value={busca} 
                onChangeText={setBusca} 
                autoFocus
              />
            ) : (
              <Pressable style={styles.select} onPress={() => setEditando(true)}>
                <Text style={styles.selectTexto}>
                  {responsaveisSelecionados.length > 0 
                    ? `+ Adicionar/Alterar Responsáveis (${responsaveisSelecionados.length})` 
                    : "Selecione os responsáveis"}
                </Text>
              </Pressable>
            )}

            {editando && ( 
              <View style={styles.lista}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                  {filtrados.length > 0 ? (
                    filtrados.map((item) => {
                      const selecionado = responsaveisSelecionados.some((r) => r.id === item.id);
                      return (
                        <Pressable 
                          key={item.id} 
                          style={[styles.opcao, selecionado && styles.opcaoSelecionada]} 
                          onPress={() => alternarSelecao(item)}
                        >
                          <Text style={{ color: selecionado ? "#FFF" : "#2F1CA6", fontWeight: selecionado ? "bold" : "normal" }}>
                            {selecionado ? `✓ ${item.nome}` : item.nome}
                          </Text>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Text style={{ padding: 15, color: "#0b8cbf5b" }}>Nenhum encontrado</Text>
                  )}
                </ScrollView>
                <Pressable style={styles.botaoConcluir} onPress={() => { setEditando(false); setBusca(""); }}>
                  <Text style={styles.textoConcluir}>Concluir Seleção</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.textoInput}>Data de Nascimento:</Text>
            <Input 
              placeholder="DD/MM/AAAA" 
              placeholderTextColor="#0b8cbfd1" 
              value={dataNasc} 
              onChangeText={aplicarMascaraData} 
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.textoInput}>Grau de Suporte:</Text>
            <Pressable style={styles.select} onPress={() => setAberto(!aberto)}>
              <Text style={styles.selectTexto}>
                {grau === "1" ? "Grau 1" : grau === "2" ? "Grau 2" : grau === "3" ? "Grau 3" : "Selecione o grau de suporte"}
              </Text>
            </Pressable>

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

            <View style={styles.botaoSubmitContainer}>
              <Button label="Cadastrar" onPress={cadastrarDiscente} />
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer>
        <Text style={styles.textoRodape}>Diário Inclusivo.</Text>
      </Footer>

      <View style={styles.barraMenuGeral}>
        <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
          <Image source={require("../../assets/images/homeD.png")} style={styles.iconeCustom} />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#F5F2E8", padding: 32 },
  itens: { justifyContent: "center", width: "100%", marginTop: -50 },
  logo: { width: 150, height: 150, alignSelf: "center" },
  form: { gap: 5, width: "100%" },
  textoInput: { fontSize: 15, color: "#2F1CA6", fontWeight: "bold", marginLeft: 8, marginTop: 8 },
  botaoSubmitContainer: { alignItems: "center", marginTop: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#2F1CA6", marginLeft: 8, marginTop: 10 },
  select: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 50, padding: 15, backgroundColor: "#F5F2E8", marginTop: 5 },
  selectTexto: { color: "#0b8cbfd1", fontSize: 14 },
  lista: { borderWidth: 1, borderColor: "#2F1CA6", borderRadius: 10, backgroundColor: "#F5F2E8", marginTop: 5, overflow: "hidden" },
  opcao: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#2e1ca667" },
  opcaoSelecionada: { backgroundColor: "#2F1CA6" },
  containerTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 5 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#2F1CA6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  tagTexto: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  tagFechar: { color: "#FF6B6B", fontWeight: "bold", fontSize: 14 },
  botaoConcluir: { backgroundColor: "#0B8CBF", padding: 12, alignItems: "center" },
  textoConcluir: { color: "#FFF", fontWeight: "bold" },
  textoRodape: { color: "#0B8CBF", fontSize: 12, fontWeight: "500" },
  botaoMenu: { alignItems: "center", justifyContent: "center", flex: 1, height: 30 },
  tabLabel: { fontSize: 14, fontWeight: "500", color: "#2F1CA6", marginTop: 4 },
  iconeCustom: { width: 80, height: 80, borderRadius: 15, resizeMode: "cover" },
  barraMenuGeral: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    backgroundColor: "#F5F2E8", height: 90, paddingBottom: 30,
    borderTopWidth: 3, borderTopColor: "#F5F2E8", borderTopLeftRadius: 35, borderTopRightRadius: 35,
    position: "absolute", bottom: 0, left: 0, right: 0, elevation: 10, shadowColor: "#000",
  }
});
