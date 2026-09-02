import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Footer from "../../components/Footer";

// 1. Definição correta das interfaces
interface Atividade {
  idAtividades: number;
  nome: string;
}

interface AtividadeRotina {
  id: number;
  nome?: string;
  inicio: string;
  fim: string;
  avaliacao?: number;
}

interface Rotina {
  idRotina: number;
  nome?: string;
  atividades: AtividadeRotina[];
}

export default function Diario() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [modalAtividadesVisivel, setModalAtividadesVisivel] = useState(false);

  // Estados de Atividades vindo do Banco
  const [listaAtividades, setListaAtividades] = useState<Atividade[]>([]);
  const [idAtividades, setIdAtividades] = useState<number | null>(null);
  const [nomeAtividadeSelecionada, setNomeAtividadeSelecionada] = useState<string>("");

  // Demais estados do formulário
  const [data, setData] = useState("");
  const [horaInicial, setHoraInicial] = useState("");
  const [horaFinal, setHoraFinal] = useState("");
  const [avaliacao, setAvaliacao] = useState<number>(5);
  const [complemento, setComplemento] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [diarios, setDiarios] = useState<any[]>([]);

  // --- ESTADOS PARA SINCRONIZAR ROTINA ---
  const [modalRotinaVisivel, setModalRotinaVisivel] = useState(false);
  const [rotinasUsuario, setRotinasUsuario] = useState<Rotina[]>([]);
  const [rotinaSelecionada, setRotinaSelecionada] = useState<Rotina | null>(null);
  const [atividadesRotinaEditavel, setAtividadesRotinaEditavel] = useState<AtividadeRotina[]>([]);
  const [dataRotina, setDataRotina] = useState("");
  const [obsRotina, setObsRotina] = useState("");
  const [loadingRotina, setLoadingRotina] = useState(false);

  const idUsuario = 1;
  const idDiscente = 2;

  // Carrega as atividades do banco ao abrir a tela
  useEffect(() => {
    carregarAtividades();
  }, []);

  const carregarAtividades = async () => {
    try {
      const response = await fetch(
        "http://10.0.0.100/DiarioInclusivo/src/app/listar_atividades.php"
      );
      const text = await response.text();
      const result = JSON.parse(text);

      if (result.sucesso) {
        setListaAtividades(result.dados);
      } else {
        console.error("Erro ao buscar atividades:", result.mensagem);
      }
    } catch (error) {
      console.error("Erro ao conectar com servidor de atividades:", error);
    }
  };

  // --- FUNÇÃO PARA BUSCAR AS ROTINAS DO USUÁRIO ---
  const handleAbrirModalSincronizarRotina = async () => {
    setLoadingRotina(true);
    try {
      const resposta = await fetch(
        `http://10.0.0.100/DiarioInclusivo/src/app/listar_rotina.php?idUsuario=${idUsuario}`
      );
      const resultado = await resposta.json();

      if (resultado.sucesso && Array.isArray(resultado.dados)) {
        setRotinasUsuario(resultado.dados);
        setModalRotinaVisivel(true);
      } else {
        Alert.alert("Aviso", "Nenhuma rotina cadastrada encontrada.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as rotinas.");
    } finally {
      setLoadingRotina(false);
    }
  };

  // --- QUANDO SELECIONA UMA ROTINA DA LISTA ---
  const handleSelecionarRotina = (rotina: Rotina) => {
    setRotinaSelecionada(rotina);
    const ativsComNota = rotina.atividades.map((a) => ({
      ...a,
      avaliacao: 5,
    }));
    setAtividadesRotinaEditavel(ativsComNota);
  };

  // --- ALTERAR NOTA DE UMA ATIVIDADE ESPECÍFICA NA ROTINA ---
  const handleMudarNotaAtividadeRotina = (index: number, nota: number) => {
    const novas = [...atividadesRotinaEditavel];
    novas[index].avaliacao = nota;
    setAtividadesRotinaEditavel(novas);
  };

  // --- SALVAR ROTINA SINCRONIZADA NO DIÁRIO ---
  const handleSalvarSincronizacaoRotina = async () => {
    if (!dataRotina) {
      Alert.alert("Atenção", "Por favor, preencha a data.");
      return;
    }
    if (!rotinaSelecionada || atividadesRotinaEditavel.length === 0) {
      Alert.alert("Atenção", "Selecione uma rotina com atividades.");
      return;
    }

    setLoadingRotina(true);
    try {
      const payload = {
        data: dataRotina,
        idUsuario: idUsuario,
        idDiscente: idDiscente,
        complemento: obsRotina,
        atividades: atividadesRotinaEditavel.map((a) => ({
          idAtividades: a.id,
          hora_inicial: a.inicio,
          hora_final: a.fim,
          avaliacao_1_5: a.avaliacao,
        })),
      };
    const response = await fetch(
        `http://10.0.0.100/DiarioInclusivo/src/app/sincronizar_rotina_diario.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.sucesso) {
        Alert.alert("Sucesso", result.mensagem);
        setModalRotinaVisivel(false);
        setRotinaSelecionada(null);
        setDataRotina("");
        setObsRotina("");
        handleBuscarHistorico();
      } else {
        Alert.alert("Erro", result.mensagem);
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível sincronizar a rotina.");
    } finally {
      setLoadingRotina(false);
    }
  };

  // Máscara para Data: DD/MM/AAAA
  const handleDataChange = (text: string) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let dataFormatada = apenasNumeros;

    if (apenasNumeros.length > 2 && apenasNumeros.length <= 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length > 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(
        2,
        4
      )}/${apenasNumeros.slice(4, 8)}`;
    }

    setData(dataFormatada);
  };

  // Máscara para Horário: HH:MM
  const handleHoraChange = (text: string, setHora: (v: string) => void) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let horaFormatada = apenasNumeros;

    if (apenasNumeros.length > 2) {
      horaFormatada = `${apenasNumeros.slice(0, 2)}:${apenasNumeros.slice(2, 4)}`;
    }

    setHora(horaFormatada);
  };

  const validarDataFutura = (dataString: string): boolean => {
    if (dataString.length !== 10) return false;

    const [dia, mes, ano] = dataString.split("/").map(Number);
    const dataDigitada = new Date(ano, mes - 1, dia);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return dataDigitada >= hoje;
  };

  const handleSalvarDiario = async () => {
    if (!idAtividades) {
      Alert.alert("Atenção", "Por favor, selecione uma atividade.");
      return;
    }

    if (!data) {
      Alert.alert("Atenção", "Por favor, digite a data.");
      return;
    }

    if (data.length < 10) {
      Alert.alert(
        "Atenção",
        "Por favor, digite a data completa no formato DD/MM/AAAA."
      );
      return;
    }

    if (!validarDataFutura(data)) {
      Alert.alert(
        "Data Inválida",
        "A data deve ser o dia de hoje ou uma data futura."
      );
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        "http://10.0.0.100/DiarioInclusivo/src/app/criar_diario.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            data: data,
            hora_inicial: horaInicial,
            hora_final: horaFinal,
            avaliacao_1_5: avaliacao,
            complemento: complemento,
            idAtividades: idAtividades,
            idUsuario: idUsuario,
            idDiscente: idDiscente,
          }),
        }
      );

      clearTimeout(timeoutId);
      const text = await response.text();

      try {
        const result = JSON.parse(text);

        if (result.sucesso) {
          Alert.alert("Sucesso", result.mensagem);
          setIdAtividades(null);
          setNomeAtividadeSelecionada("");
          setData("");
          setHoraInicial("");
          setHoraFinal("");
          setAvaliacao(5);
          setComplemento("");
          setModalVisivel(false);
          handleBuscarHistorico();
        } else {
          Alert.alert("Erro", result.mensagem);
        }
      } catch (jsonError) {
        console.error("Resposta em formato inválido:", text);
        const mensagemLimpa = text.replace(/<[^>]*>?/gm, "").trim();
        Alert.alert(
          "Erro do Servidor",
          `O servidor retornou uma resposta inesperada:\n\n${mensagemLimpa.substring(
            0,
            150
          )}`
        );
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        Alert.alert(
          "Tempo Excedido",
          "O servidor demorou para responder. Verifique se o PHP e o MySQL estão ativos."
        );
      } else {
        Alert.alert("Erro de Conexão", "Não foi possível se conectar ao servidor.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const response = await fetch(
        `http://10.0.0.100/DiarioInclusivo/src/app/listar_diario.php?idDiscente=${idDiscente}`
      );
      const text = await response.text();

      try {
        const result = JSON.parse(text);
        if (result.sucesso) {
          setDiarios(result.dados);
          setModalHistoricoVisivel(true);
        } else {
          Alert.alert("Erro", result.mensagem || "Erro ao carregar histórico.");
        }
      } catch (e) {
        console.error("Erro JSON no Histórico:", text);
        Alert.alert("Erro de Resposta", "Resposta inválida ao buscar histórico.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível buscar o histórico.");
      console.error(error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 24, color: "#2F1CA6" }}>←</Text>
        <Text style={styles.mesTexto}>AGOSTO DE 2026</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Calendário */}
      <View style={styles.calendarioContainer}>
        <View style={styles.semanaContainer}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
            <Text key={i} style={styles.diaSemanaTexto}>
              {dia}
            </Text>
          ))}
        </View>

        <View style={styles.gradeDias}>
          <Text style={[styles.diaTexto, styles.diaCinza]}>26</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>27</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>28</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>29</Text>
          <Text style={[styles.diaTexto, styles.diaCinza]}>30</Text>
          <Text style={styles.diaTexto}>31</Text>
          <Text style={styles.diaTexto}>1</Text>

          <Text style={styles.diaTexto}>2</Text>
          <Text style={styles.diaTexto}>3</Text>
          <Text style={styles.diaTexto}>4</Text>
          <Text style={styles.diaTexto}>5</Text>
          <Text style={styles.diaTexto}>6</Text>
          <Text style={styles.diaTexto}>7</Text>
          <Text style={styles.diaTexto}>8</Text>

          <Text style={styles.diaTexto}>9</Text>
          <Text style={styles.diaTexto}>10</Text>
          <Text style={styles.diaTexto}>11</Text>
          <Text style={styles.diaTexto}>12</Text>
          <Text style={styles.diaTexto}>13</Text>
          <Text style={styles.diaTexto}>14</Text>
          <Text style={styles.diaTexto}>15</Text>

          <Text style={styles.diaTexto}>16</Text>
          <Text style={styles.diaTexto}>17</Text>
          <Text style={styles.diaTexto}>18</Text>
          <Text style={styles.diaTexto}>19</Text>
          <Text style={styles.diaTexto}>20</Text>
          <Text style={styles.diaTexto}>21</Text>
          <Text style={styles.diaTexto}>22</Text>

          <Text style={styles.diaTexto}>23</Text>
          <Text style={styles.diaTexto}>24</Text>
          <Text style={styles.diaTexto}>25</Text>
          <Text style={styles.diaTexto}>26</Text>
          <Text style={styles.diaTexto}>27</Text>
          <Text style={styles.diaTexto}>28</Text>
          <Text style={styles.diaTexto}>29</Text>

          <Text style={styles.diaTexto}>30</Text>
          <View style={styles.diaSelecionado}>
            <Text style={styles.diaTextoNoCirculo}>31</Text>
          </View>
          <View style={styles.diaInvisivel} />
          <View style={styles.diaInvisivel} />
          <View style={styles.diaInvisivel} />
          <View style={styles.diaInvisivel} />
          <View style={styles.diaInvisivel} />
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.botoesAcaoContainer}>
        <Pressable
          style={[styles.botaoAcao, styles.botaoRoxo]}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.botaoAcaoTexto}>Nova Entrada</Text>
        </Pressable>

          <Pressable
          style={[styles.botaoAcao, styles.botaoVerde]}
          onPress={handleAbrirModalSincronizarRotina}
          disabled={loadingRotina}
        >
          <Text style={styles.botaoAcaoTexto}>
            {loadingRotina ? "Carregando..." : "Sincronizar Rotina"}
          </Text>
        </Pressable>


        <Pressable
          style={[styles.botaoAcao, styles.botaoAzul]}
          onPress={handleBuscarHistorico}
          disabled={loadingHistorico}
        >
          <Text style={styles.botaoAcaoTexto}>
            {loadingHistorico ? "Carregando..." : "Histórico"}
          </Text>
        </Pressable>
      </View>

      {/* Modal para Nova Entrada */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={styles.modalContent}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.modalTitulo}>Nova Entrada no Diário</Text>

                  {/* SELETOR DA ATIVIDADE */}
                  <TouchableOpacity
                    style={styles.seletorAtividade}
                    onPress={() => setModalAtividadesVisivel(true)}
                  >
                    <Text
                      style={[
                        styles.seletorTexto,
                        !nomeAtividadeSelecionada && { color: "#888" },
                      ]}
                    >
                      {nomeAtividadeSelecionada || "Selecione uma atividade..."}
                    </Text>
                  </TouchableOpacity>

                  {/* CAMPO DE DATA */}
                  <TextInput
                    style={styles.input}
                    placeholder="Data (ex: 31/08/2026)"
                    placeholderTextColor="#888"
                    value={data}
                    onChangeText={handleDataChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />

                  {/* CAMPOS DE HORÁRIO */}
                  <View style={styles.horasRow}>
                    <TextInput
                      style={[styles.input, styles.inputMetade]}
                      placeholder="Início (08:00)"
                      placeholderTextColor="#888"
                      value={horaInicial}
                      onChangeText={(text) => handleHoraChange(text, setHoraInicial)}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.input, styles.inputMetade]}
                      placeholder="Fim (09:00)"
                      placeholderTextColor="#888"
                      value={horaFinal}
                      onChangeText={(text) => handleHoraChange(text, setHoraFinal)}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  {/* AVALIAÇÃO */}
                  <Text style={styles.labelAvaliacao}>
                    Avaliação do desempenho (1 a 5):
                  </Text>
                  <View style={styles.notasContainer}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.botaoNota,
                          avaliacao === num && styles.botaoNotaSelecionado,
                        ]}
                        onPress={() => setAvaliacao(num)}
                      >
                        <Text
                          style={[
                            styles.textoNota,
                            avaliacao === num && styles.textoNotaSelecionado,
                          ]}
                        >
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* COMPLEMENTO / OBSERVAÇÕES */}
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Observações do professor..."
                    placeholderTextColor="#888"
                    value={complemento}
                    onChangeText={setComplemento}
                    multiline={true}
                    numberOfLines={3}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  <View style={styles.modalBotoes}>
                    <TouchableOpacity
                      style={[styles.modalBotao, styles.botaoCancelar]}
                      onPress={() => setModalVisivel(false)}
                    >
                      <Text style={styles.textoBotaoModal}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalBotao, styles.botaoSalvar]}
                      onPress={handleSalvarDiario}
                      disabled={loading}
                    >
                      <Text style={styles.textoBotaoModal}>
                        {loading ? "Salvando..." : "Salvar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Selecionar Atividade da Lista */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAtividadesVisivel}
        onRequestClose={() => setModalAtividadesVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitulo}>Selecione a Atividade</Text>

            {listaAtividades.length === 0 ? (
              <Text style={styles.textoVazio}>Carregando atividades...</Text>
            ) : (
              <FlatList
                data={listaAtividades}
                keyExtractor={(item) => item.idAtividades.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.itemAtividade,
                      idAtividades === item.idAtividades && styles.itemAtividadeSelecionada,
                    ]}
                    onPress={() => {
                      setIdAtividades(item.idAtividades);
                      setNomeAtividadeSelecionada(item.nome);
                      setModalAtividadesVisivel(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.textoAtividade,
                        idAtividades === item.idAtividades && styles.textoAtividadeSelecionada,
                      ]}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={[styles.modalBotao, styles.botaoCancelar, { marginTop: 15 }]}
              onPress={() => setModalAtividadesVisivel(false)}
            >
              <Text style={styles.textoBotaoModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Histórico */}
      {/* Modal de Histórico */}
<Modal
  animationType="slide"
  transparent={true}
  visible={modalHistoricoVisivel}
  onRequestClose={() => setModalHistoricoVisivel(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { maxHeight: "80%" }]}>
      <Text style={styles.modalTitulo}>Histórico de Entradas</Text>

      {diarios.length === 0 ? (
        <Text style={styles.textoVazio}>
          Nenhum registro encontrado para este aluno.
        </Text>
      ) : (
        <FlatList
          data={diarios}
          keyExtractor={(item) => item.idDiario.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardDiario}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardData}>{item.data}</Text>
                {item.avaliacao_1_5 && (
                  <Text style={styles.cardNota}>
                    Nota: {item.avaliacao_1_5}/5
                  </Text>
                )}
              </View>

              {/* NOME DA ATIVIDADE */}
              {item.atividade && (
                <Text style={styles.cardAtividade}>
                  Atividade: {item.atividade}
                </Text>
              )}

              {(item.hora_inicial || item.hora_final) && (
                <Text style={styles.cardHorario}>
                  Horário: {item.hora_inicial} - {item.hora_final}
                </Text>
              )}
              
              <Text style={styles.cardTexto}>
                {item.complemento || "Sem anotações."}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.modalBotao, styles.botaoCancelar, { marginTop: 15 }]}
        onPress={() => setModalHistoricoVisivel(false)}
      >
        <Text style={styles.textoBotaoModal}>Fechar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
        animationType="slide"
        transparent={true}
        visible={modalRotinaVisivel}
        onRequestClose={() => setModalRotinaVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "85%" }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitulo}>Sincronizar Rotina no Diário</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Data (ex: 31/08/2026)"
                  placeholderTextColor="#888"
                  value={dataRotina}
                  onChangeText={(text) => {
                    const apenasNums = text.replace(/\D/g, "");
                    let dataF = apenasNums;
                    if (apenasNums.length > 2 && apenasNums.length <= 4) {
                      dataF = `${apenasNums.slice(0, 2)}/${apenasNums.slice(2)}`;
                    } else if (apenasNums.length > 4) {
                      dataF = `${apenasNums.slice(0, 2)}/${apenasNums.slice(2, 4)}/${apenasNums.slice(4, 8)}`;
                    }
                    setDataRotina(dataF);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />

                <Text style={styles.labelAvaliacao}>Selecione uma Rotina:</Text>
                {rotinasUsuario.map((rot) => (
                  <TouchableOpacity
                    key={rot.idRotina}
                    style={[
                      styles.itemAtividade,
                      rotinaSelecionada?.idRotina === rot.idRotina && styles.itemAtividadeSelecionada,
                    ]}
                    onPress={() => handleSelecionarRotina(rot)}
                  >
                    <Text
                      style={[
                        styles.textoAtividade,
                        rotinaSelecionada?.idRotina === rot.idRotina && styles.textoAtividadeSelecionada,
                      ]}
                    >
                      {rot.nome || `Rotina #${rot.idRotina}`}
                    </Text>
                  </TouchableOpacity>
                ))}

                {rotinaSelecionada && (
                  <View style={{ marginTop: 15 }}>
                    <Text style={styles.labelAvaliacao}>Avalie as atividades da rotina:</Text>
                    {atividadesRotinaEditavel.map((ativ, idx) => (
                      <View key={idx} style={styles.cardDiario}>
                        <Text style={styles.cardAtividade}>{ativ.nome || `Atividade #${ativ.id}`}</Text>
                        <Text style={styles.cardHorario}>Horário: {ativ.inicio} - {ativ.fim}</Text>
                        <View style={styles.notasContainer}>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <TouchableOpacity
                              key={num}
                              style={[
                                styles.botaoNota,
                                ativ.avaliacao === num && styles.botaoNotaSelecionado,
                              ]}
                              onPress={() => handleMudarNotaAtividadeRotina(idx, num)}
                            >
                              <Text
                                style={[
                                  styles.textoNota,
                                  ativ.avaliacao === num && styles.textoNotaSelecionado,
                                ]}
                              >
                                {num}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}

                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Observações da rotina..."
                      placeholderTextColor="#888"
                      value={obsRotina}
                      onChangeText={setObsRotina}
                      multiline={true}
                    />
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={[styles.modalBotao, styles.botaoCancelar]}
                    onPress={() => setModalRotinaVisivel(false)}
                  >
                    <Text style={styles.textoBotaoModal}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBotao, styles.botaoSalvar]}
                    onPress={handleSalvarSincronizacaoRotina}
                    disabled={loadingRotina}
                  >
                    <Text style={styles.textoBotaoModal}>
                      {loadingRotina ? "Sincronizando..." : "Salvar Rotina"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rodapé e Menu */}
      <Footer children={undefined} />
      <View style={styles.barraMenuGeral}>
        <Pressable
          style={styles.botaoMenu}
          onPress={() => router.push("/discente")}
        >
          <Image
            source={require("../../assets/images/home.png")}
            style={styles.iconeCustom}
          />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>

        <Pressable
          style={styles.botaoMenu}
          onPress={() => router.push("/diarioProf")}
        >
          <Image
            source={require("../../assets/images/diarioD.png")}
            style={styles.iconeCustom}
          />
          <Text style={styles.tabLabel}>Diário</Text>
        </Pressable>

        <Pressable
          style={styles.botaoMenu}
          onPress={() => router.push("/rotina")}
        >
          <Image
            source={require("../../assets/images/rotina.png")}
            style={styles.iconeCustom}
          />
          <Text style={styles.tabLabel}>Rotina</Text>
        </Pressable>

        <Pressable
          style={styles.botaoMenu}
          onPress={() => router.push("/configuracoes")}
        >
          <Image
            source={require("../../assets/images/confg.png")}
            style={styles.iconeCustom}
          />
          <Text style={styles.tabLabel}>Conf.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2E8",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  mesTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  calendarioContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  semanaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
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
  diaTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F1CA6",
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 40,
  },
  diaCinza: {
    color: "#1796cd5c",
  },
  diaSelecionado: {
    backgroundColor: "#1797CD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  diaTextoNoCirculo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  diaInvisivel: {
    width: 40,
    height: 40,
  },
  botoesAcaoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  botaoAcao: {
    width: 270,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  botaoRoxo: {
    backgroundColor: "#2F1CA6",
  },
  botaoAzul: {
    backgroundColor: "#1797CD",
  },
  botaoVerde: {
    backgroundColor: "#28A745",
  },
  botaoAcaoTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
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
    height: 90,
    paddingBottom: 30,
    borderTopWidth: 3,
    borderTopColor: "#F5F2E8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    marginTop: 20,
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
  seletorAtividade: {
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    justifyContent: "center",
  },
  seletorTexto: {
    fontSize: 14,
    color: "#333",
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
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    color: "#333",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  horasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputMetade: {
    width: "48%",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  labelAvaliacao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F1CA6",
    marginBottom: 8,
  },
  notasContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  botaoNota: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2F1CA6",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoNotaSelecionado: {
    backgroundColor: "#2F1CA6",
  },
  textoNota: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  textoNotaSelecionado: {
    color: "#FFF",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
  botaoSalvar: {
    backgroundColor: "#2F1CA6",
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
  cardDiario: {
    backgroundColor: "#F5F2E8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2F1CA6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  cardData: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F1CA6",
  },
  cardNota: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1797CD",
  },
  cardHorario: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  cardTexto: {
    fontSize: 14,
    color: "#333",
  },
  cardAtividade: {
  fontSize: 15,
  fontWeight: "bold",
  color: "#2F1CA6",
  marginBottom: 4,
  },
});