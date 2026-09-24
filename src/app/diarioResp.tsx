import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Footer from "../../components/Footer";
import { API_URL } from "./api";

interface Discente {
  id?: number;
  idDiscente?: number;
  id_discente?: number;
  nome?: string;
  nomeDiscente?: string;
  nome_discente?: string;
  [key: string]: any;
}

export default function DiarioResp() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados para seleção/carregamento do Discente
  const [discentes, setDiscentes] = useState<Discente[]>([]);
  const [idDiscente, setIdDiscente] = useState<number | null>(
    params.idDiscente ? Number(params.idDiscente) : null
  );
  const [modalSelecaoDiscenteVisivel, setModalSelecaoDiscenteVisivel] = useState(false);

  // ID e Tipo do usuário logado
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<number | null>(null);

  // Estados do Calendário Dinâmico
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number>(new Date().getDate());

  // Funções para capturar IDs e Nomes
  const obterIdDiscente = (aluno: any) => {
    if (!aluno) return 0;
    return aluno.idDiscente ?? aluno.id_discente ?? aluno.id ?? aluno.codigo ?? aluno.id_aluno ?? 0;
  };

  const obterNomeDiscente = (aluno: any) => {
    if (!aluno) return "Nome não encontrado";
    return aluno.nome ?? aluno.nomeDiscente ?? aluno.nome_discente ?? aluno.aluno ?? "Nome não encontrado";
  };

  // Carrega o usuário logado e busca os discentes conforme o tipo
  useEffect(() => {
    const carregarInicial = async () => {
      try {
        let currentUserId: number | null = null;
        const usuarioJson = await AsyncStorage.getItem("@usuario_logado");

        if (usuarioJson) {
          const usuario = JSON.parse(usuarioJson);
          currentUserId = Number(
            usuario.idUsuario ?? usuario.id_usuario ?? usuario.id ?? usuario.codigo
          );
        } else {
          const idSalvo = await AsyncStorage.getItem("idUsuario");
          if (idSalvo) {
            currentUserId = Number(idSalvo);
          }
        }

        // Pega o tipo de usuário de forma segura
        let tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
        if (!tipoLogado) {
          tipoLogado = await AsyncStorage.getItem("tipoUsuario");
        }

        if (tipoLogado) {
          setTipoUsuario(Number(tipoLogado));
        }

        // Recebe o idDiscente se tiver sido passado pela navegação
        const idParam = params.idDiscente || params.id;
        if (idParam) {
          setIdDiscente(Number(idParam));
        }

        if (currentUserId && !Number.isNaN(currentUserId)) {
          setIdUsuario(currentUserId);

          let urlAPI = "";

          // Se o tipo for 2, busca TODOS os discentes no discenteAdm.php
          if (tipoLogado && String(tipoLogado).trim() === "2") {
            urlAPI = `${API_URL}/discenteAdm.php`;
          } else {
            // Se for 1, busca apenas os vinculados ao responsável
            urlAPI = `${API_URL}/discenteResp.php?idResp=${currentUserId}`;
          }

          const response = await fetch(urlAPI);
          const result = await response.json();

          let listaBruta = [];
          if (Array.isArray(result)) {
            listaBruta = result;
          } else if (result.dados && Array.isArray(result.dados)) {
            listaBruta = result.dados;
          }

          setDiscentes(listaBruta);

          // Se nenhum ID veio via rota/URL, seleciona o primeiro discente por padrão
          if (!idParam && listaBruta.length > 0) {
            const primeiroId = obterIdDiscente(listaBruta[0]);
            if (primeiroId) setIdDiscente(primeiroId);
          }
        }
      } catch (error) {
        console.error("Erro no carregamento inicial:", error);
      }
    };

    carregarInicial();
  }, [params.idDiscente, params.id]);

  // Redireciona para a tela de histórico
  const handleIrParaHistorico = () => {
    if (!idDiscente) {
      Alert.alert("Atenção", "Selecione um discente para consultar o histórico.");
      return;
    }

    router.push({
      pathname: "/historico",
      params: { idDiscente: String(idDiscente) },
    });
  };

  const selecionarDiaCalendario = (dia: number) => {
    setDiaSelecionado(dia);
  };

  const gerarGradeCalendario = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    const dias = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push({ tipo: "vazio", id: `vazio-${i}` });
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      dias.push({ tipo: "dia", dia, id: `dia-${dia}` });
    }

    return dias;
  };

  const mesesAno = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  const hoje = new Date();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: "#2F1CA6" }}>←</Text>
        </TouchableOpacity>

        <View style={styles.navegacaoMes}>
          <Text style={styles.mesTexto}>
            {`${mesesAno[dataAtual.getMonth()]} DE ${dataAtual.getFullYear()}`}
          </Text>
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Seletor do Discente */}
      <View style={styles.seletorDiscenteContainer}>
        <Text style={styles.labelDiscente}>Discente:</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.campoSeletorDiscente}
          onPress={() => setModalSelecaoDiscenteVisivel(true)}
        >
          <Text style={styles.textoSeletorDiscente}>
            {idDiscente
              ? obterNomeDiscente(discentes.find((d) => obterIdDiscente(d) === idDiscente))
              : "Selecione um Aluno..."}
          </Text>
          <Text style={{ color: "#2F1CA6", fontSize: 12 }}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Seleção do Discente */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSelecaoDiscenteVisivel}
        onRequestClose={() => setModalSelecaoDiscenteVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitulo}>Selecione o Discente</Text>

            {discentes.length === 0 ? (
              <Text style={styles.textoVazio}>Nenhum discente encontrado.</Text>
            ) : (
              <FlatList
                data={discentes}
                keyExtractor={(item, index) => {
                  const id = obterIdDiscente(item);
                  return id ? id.toString() : index.toString();
                }}
                renderItem={({ item }) => {
                  const alunoId = obterIdDiscente(item);
                  const alunoNome = obterNomeDiscente(item);
                  const selecionado = idDiscente === alunoId;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.itemAtividade,
                        selecionado && styles.itemAtividadeSelecionada,
                      ]}
                      onPress={() => {
                        setIdDiscente(alunoId);
                        setModalSelecaoDiscenteVisivel(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.textoAtividade,
                          selecionado && styles.textoAtividadeSelecionada,
                        ]}
                      >
                        {alunoNome}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.modalBotao, styles.botaoCancelar, { marginTop: 15 }]}
              onPress={() => setModalSelecaoDiscenteVisivel(false)}
            >
              <Text style={styles.textoBotaoModal}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendário Dinâmico */}
      <View style={styles.calendarioContainer}>
        <View style={styles.semanaContainer}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
            <Text key={i} style={styles.diaSemanaTexto}>
              {dia}
            </Text>
          ))}
        </View>

        <View style={styles.gradeDias}>
          {gerarGradeCalendario().map((item) => {
            if (item.tipo === "vazio") {
              return <View key={item.id} style={styles.diaInvisivel} />;
            }

            const eHoje =
              item.dia === hoje.getDate() &&
              dataAtual.getMonth() === hoje.getMonth() &&
              dataAtual.getFullYear() === hoje.getFullYear();

            const eSelecionado = item.dia === diaSelecionado;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => selecionarDiaCalendario(item.dia!)}
                style={[
                  styles.diaBotao,
                  eSelecionado && styles.diaSelecionado,
                  eHoje && !eSelecionado && styles.diaHojeBorder,
                ]}
              >
                <Text
                  style={[
                    styles.diaTexto,
                    eSelecionado && styles.diaTextoNoCirculo,
                    eHoje && !eSelecionado && styles.diaTextoHoje,
                  ]}
                >
                  {item.dia}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Botão de Ação */}
      <View style={styles.botoesAcaoContainer}>
        <Pressable
          style={[styles.botaoAcao, styles.botaoAzul]}
          onPress={handleIrParaHistorico}
        >
          <Text style={styles.botaoAcaoTexto}>Histórico</Text>
        </Pressable>
      </View>

      {/* Footer Padrão */}
      <Footer children={undefined} />

      {/* Barra de Menu Dinâmica (Tipo 1 e Tipo 2) */}
      <View style={styles.barraMenuGeral}>
        {tipoUsuario === 1 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discenteResp")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioResp")}>
              <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        )}

        {tipoUsuario === 2 && (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discenteD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Atividades</Text>
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
    backgroundColor: "#F5F2E8",
    padding: 16,
    paddingBottom: 95,
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
    marginTop: 20,
    borderRadius: 20,
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
    resizeMode: "cover" 
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  navegacaoMes: {
    flexDirection: "row",
    alignItems: "center",
  },
  mesTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  seletorDiscenteContainer: {
    marginBottom: 10,
  },
  labelDiscente: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 4,
  },
  campoSeletorDiscente: {
    borderWidth: 1,
    borderColor: "#2F1CA6",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textoSeletorDiscente: {
    color: "#2F1CA6",
    fontSize: 14,
    fontWeight: "500",
  },
  calendarioContainer: {
    marginTop: 5,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  semanaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  diaSemanaTexto: {
    color: "#ED3C3C",
    fontWeight: "bold",
    fontSize: 16,
    width: 40,
    textAlign: "center",
  },
  gradeDias: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  diaBotao: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  diaTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  diaHojeBorder: {
    borderWidth: 1.5,
    borderColor: "#1797CD",
    borderRadius: 20,
  },
  diaTextoHoje: {
    color: "#1797CD",
  },
  diaSelecionado: {
    backgroundColor: "#1797CD",
    borderRadius: 20,
  },
  diaTextoNoCirculo: {
    color: "#FFFFFF",
  },
  diaInvisivel: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  botoesAcaoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  botaoAcao: {
    width: 270,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoAzul: {
    backgroundColor: "#1797CD",
  },
  botaoAcaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 15,
    textAlign: "center",
  },
  itemAtividade: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    borderRadius: 8,
    marginBottom: 4,
  },
  itemAtividadeSelecionada: {
    backgroundColor: "#E2E0F8",
  },
  textoAtividade: {
    fontSize: 15,
    color: "#333",
  },
  textoAtividadeSelecionada: {
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  modalBotao: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  botaoCancelar: {
    backgroundColor: "#ED3C3C",
  },
  textoBotaoModal: {
    color: "#FFF",
    fontWeight: "bold",
  },
  textoVazio: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
    fontSize: 14,
  },
});