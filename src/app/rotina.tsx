import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import { API_URL } from "./api";

interface Atividade {
  idAtividades?: string | number;
  id?: string | number;
  titulo?: string;
  nome?: string;
  descricao?: string;
  [key: string]: any;
}

export default function Rotina() {
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);

  // Estados do Modal e Formulário (Cadastro / Edição)
  const [modalVisivel, setModalVisivel] = useState<boolean>(false);
  const [modoEdicao, setModoEdicao] = useState<boolean>(false);
  const [idAtividadeSelecionada, setIdAtividadeSelecionada] = useState<string | number | null>(null);
  const [nomeAtividadeInput, setNomeAtividadeInput] = useState<string>("");
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [salvando, setSalvando] = useState<boolean>(false);

  const carregarAtividades = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`${API_URL}/listar_atividades.php`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAtividades(data);
      } else if (data && Array.isArray(data.atividades)) {
        setAtividades(data.atividades);
      } else if (data && Array.isArray(data.dados)) {
        setAtividades(data.dados);
      } else if (data && Array.isArray(data.data)) {
        setAtividades(data.data);
      } else {
        setAtividades([]);
      }
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    } finally {
      setCarregando(false);
    }
  };

  const carregarTipoUsuario = async () => {
    try {
      let tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
      if (tipoLogado) {
        const tipoFormatado = String(tipoLogado).trim();
        setTipoUsuario(tipoFormatado);

        if (tipoFormatado !== "3") {
          carregarAtividades();
        }
      }
    } catch (error) {
      console.error("Erro ao carregar tipo de usuário:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTipoUsuario();
    }, [])
  );

  const abrirModalAdicionar = () => {
    setModoEdicao(false);
    setIdAtividadeSelecionada(null);
    setNomeAtividadeInput("");
    setMensagemErro("");
    setModalVisivel(true);
  };

  const abrirModalEditar = (item: Atividade) => {
    setModoEdicao(true);
    setIdAtividadeSelecionada(item.idAtividades || item.id || item.codigo);
    setNomeAtividadeInput(item.titulo || item.nome || item.descricao || "");
    setMensagemErro("");
    setModalVisivel(true);
  };

  const handleSalvarAtividade = async () => {
    if (!nomeAtividadeInput.trim()) {
      setMensagemErro("Digite o nome da atividade.");
      return;
    }

    try {
      setSalvando(true);
      setMensagemErro("");

      const endpoint = modoEdicao ? `${API_URL}/updateAtividade.php` : `${API_URL}/criar_atividade.php`;
      const corpoRequisicao = modoEdicao 
        ? { idAtividades: idAtividadeSelecionada, novoNomeAtividade: nomeAtividadeInput }
        : { novoNomeAtividade: nomeAtividadeInput };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(corpoRequisicao),
      });

      const respostaTexto = await response.text();
      
      if (!respostaTexto || respostaTexto.trim() === "") {
        setMensagemErro("Erro de comunicação com o servidor.");
        setSalvando(false);
        return;
      }

      const resultado = JSON.parse(respostaTexto);

      if (resultado.sucesso) {
        setModalVisivel(false);
        setNomeAtividadeInput("");
        setMensagemErro("");
        carregarAtividades();
      } else {
        setMensagemErro(resultado.mensagem || "Erro ao salvar atividade.");
      }

    } catch (error) {
      console.error("Erro na requisição:", error);
      setMensagemErro("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletarAtividade = (idAtividades: string | number) => {
    Alert.alert(
      "Confirmação",
      "Vai apagar esta atividade, tem certeza?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, apagar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/deleteAtividade.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
                body: JSON.stringify({ idAtividades }),
              });

              const respostaTexto = await response.text();
              
              if (!respostaTexto || respostaTexto.trim() === "") {
                Alert.alert("Erro", "O servidor retornou uma resposta vazia.");
                return;
              }

              let resultado;
              try {
                resultado = JSON.parse(respostaTexto);
              } catch (e) {
                console.error("Resposta inválida do servidor:", respostaTexto);
                Alert.alert("Erro", "Erro no servidor (Formato inválido). Veja o console para detalhes.");
                return;
              }

              if (resultado.sucesso) {
                carregarAtividades();
              } else {
                Alert.alert("Erro", resultado.mensagem || "Erro ao excluir atividade.");
              }
            } catch (error) {
              console.error("Erro ao deletar:", error);
              Alert.alert("Erro", "Não foi possível conectar ao servidor para excluir.");
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      {tipoUsuario === "3" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/logoNome.png")}
            style={styles.logo}
          />
          <View style={styles.botaoContainer}>
            <Button label="Criar Rotina" onPress={() => router.push("/criarRotina")} />
          </View>

          <View style={styles.botaoContainer}>
            <Button label="Minhas Rotinas" onPress={() => router.push("/minhasRotinas")} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.listaContainer}>
          <Text style={styles.tituloSecao}>Lista de Atividades</Text>

          {/* Botão padronizado com ícone do Ionicons */}
          <Pressable style={styles.botaoAdicionarTopo} onPress={abrirModalAdicionar}>
            <Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.textoBotaoAdicionar}>Adicionar Atividades</Text>
          </Pressable>

          {carregando ? (
            <ActivityIndicator size="large" color="#2F1CA6" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={atividades}
              keyExtractor={(item, index) => String(item.idAtividades || item.id || item.codigo || index)}
              renderItem={({ item }) => (
                <View style={styles.cardAtividade}>
                  <View style={styles.pontoDetalhe} />
                  <Text style={styles.textoAtividade}>
                    {item.titulo || item.nome || item.descricao || JSON.stringify(item)}
                  </Text>
                  
                  {/* Botões de Ação com os mesmos ícones de InfoUsuario */}
                  <View style={styles.containerAcoes}>
                    <TouchableOpacity 
                      style={styles.botaoAcao} 
                      onPress={() => abrirModalEditar(item)}
                    >
                      <Ionicons name="create-outline" size={22} color="#2F1CA6" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.botaoAcao} 
                      onPress={() => handleDeletarAtividade(item.idAtividades || item.id || item.codigo)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.vazioTexto}>Nenhuma atividade encontrada.</Text>
              }
              contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* POP-UP (MODAL) PARA ADICIONAR / EDITAR ATIVIDADE */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {modoEdicao ? "Editar Atividade" : "Nova Atividade"}
            </Text>
            
            <TextInput
              style={styles.inputModal}
              placeholder="Digite o nome da atividade..."
              placeholderTextColor="#888"
              value={nomeAtividadeInput}
              onChangeText={(texto) => {
                setNomeAtividadeInput(texto);
                if (mensagemErro) setMensagemErro("");
              }}
            />

            {mensagemErro ? (
              <Text style={styles.textoErro}>{mensagemErro}</Text>
            ) : null}

            <View style={styles.modalBotoesContainer}>
              <Pressable 
                style={[styles.modalBotao, styles.botaoCancelar]} 
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </Pressable>

              <Pressable 
                style={[styles.modalBotao, styles.botaoSalvar]} 
                onPress={handleSalvarAtividade}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.textoBotaoSalvar}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Footer children={undefined} />

      {/* Renderização Condicional da Barra Inferior */}
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discentes.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Atividades</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diario.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotinaD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    padding: 24,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 140,
  },
  logo: {
    width: 150,
    height: 170,
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2F1CA6",
    marginTop: 4,
  },
  iconeCustom: {
    width: 80,
    height: 80,
    borderRadius: 15,
    resizeMode: "cover",
  },
  barraMenuGeral: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    height: 120,
    paddingBottom: 10,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
  },
  botaoContainer: {
    width: 250,
    height: 55,
    backgroundColor: "#2F1CA6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
  botaoAdicionarTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#2F1CA6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoBotaoAdicionar: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  listaContainer: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    marginBottom: 80,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 12,
    textAlign: "center",
  },
  cardAtividade: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: "#E2DCC9",
  },
  pontoDetalhe: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2F1CA6",
    marginRight: 12,
  },
  textoAtividade: {
    flex: 1,
    fontSize: 16,
    color: "#2F1CA6",
    fontWeight: "600",
  },
  containerAcoes: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  botaoAcao: {
    padding: 5,
    marginLeft: 4,
  },
  vazioTexto: {
    textAlign: "center",
    color: "#666",
    marginTop: 30,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#F5F2E8",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2DCC9",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 16,
    textAlign: "center",
  },
  inputModal: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCD7C9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  textoErro: {
    color: "#D9534F",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalBotoesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBotao: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoCancelar: {
    backgroundColor: "#E2DCC9",
  },
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
  },
  textoBotaoCancelar: {
    color: "#2F1CA6",
    fontWeight: "600",
    fontSize: 15,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
});