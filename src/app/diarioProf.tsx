import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  View
} from "react-native";

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

interface Discente {
  id?: number;
  idDiscente?: number;
  id_discente?: number;
  nome?: string;
  nomeDiscente?: string;
  nome_discente?: string;
  [key: string]: any;
}

export default function Diario() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados para seleção do Discente
  const [discentes, setDiscentes] = useState<Discente[]>([]);
  const [idDiscente, setIdDiscente] = useState<number | null>(
    params.idDiscente ? Number(params.idDiscente) : null
  );
  const [modalSelecaoDiscenteVisivel, setModalSelecaoDiscenteVisivel] = useState(false);

  // ID do usuário logado
  const [idUsuario, setIdUsuario] = useState<number | null>(null);

  // Estados dos Modais
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [modalAtividadesVisivel, setModalAtividadesVisivel] = useState(false);

  // Estados do Calendário Dinâmico
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number>(new Date().getDate());

  // Estados de Atividades vindo do Banco
  const [listaAtividades, setListaAtividades] = useState<Atividade[]>([]);
  const [idAtividades, setIdAtividades] = useState<number | null>(null);
  const [nomeAtividadeSelecionada, setNomeAtividadeSelecionada] = useState<string>("");
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);
  const [erroAtividades, setErroAtividades] = useState(false);

  // Demais estados do formulário de Entrada
  const [data, setData] = useState("");
  const [horaInicial, setHoraInicial] = useState("");
  const [horaFinal, setHoraFinal] = useState("");
  const [avaliacao, setAvaliacao] = useState<number>(5);
  const [complemento, setComplemento] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [diarios, setDiarios] = useState<any[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Estados para Sincronizar Rotina
  const [modalRotinaVisivel, setModalRotinaVisivel] = useState(false);
  const [rotinasUsuario, setRotinasUsuario] = useState<Rotina[]>([]);
  const [rotinaSelecionada, setRotinaSelecionada] = useState<Rotina | null>(null);
  const [atividadesRotinaEditavel, setAtividadesRotinaEditavel] = useState<AtividadeRotina[]>([]);
  const [dataRotina, setDataRotina] = useState("");
  const [obsRotina, setObsRotina] = useState("");
  const [loadingRotina, setLoadingRotina] = useState(false);

  // Funções para capturar IDs e Nomes independentemente da nomenclatura do banco/PHP
  const obterIdDiscente = (aluno: any) => {
    if (!aluno) return 0;
    return aluno.idDiscente ?? aluno.id_discente ?? aluno.id ?? aluno.codigo ?? aluno.id_aluno ?? 0;
  };

  const handleIrParaHistorico = () => {
    console.log("-> ID DISCENTE CLICADO NA TELA ANTERIOR:", idDiscente); 

    if (!idDiscente) {
      Alert.alert("Atenção", "Selecione um discente para consultar o histórico.");
      return;
    }

    // Navega para a tela historico.tsx enviando o ID
    router.push({
      pathname: '/historico',
      params: { idDiscente: String(idDiscente) }
    });
  };

  const obterNomeDiscente = (aluno: any) => {
    if (!aluno) return "Nome não encontrado";
    return aluno.nome ?? aluno.nomeDiscente ?? aluno.nome_discente ?? aluno.aluno ?? "Nome não encontrado";
  };

  // Carrega o Usuário Logado e a lista de Discentes vinculados de forma totalmente blindada
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

        if (currentUserId && !Number.isNaN(currentUserId)) {
          setIdUsuario(currentUserId);
        }

        const tipoLogado = await AsyncStorage.getItem("tipo_de_usuario");
        if (tipoLogado) {
          setTipoUsuario(String(tipoLogado).trim());
        }

        if (currentUserId) {
          const urlAPI = `http://192.168.0.107/DiarioInclusivo/src/app/listar_discentes_professor.php?idUsuario=${currentUserId}`;
          const response = await fetch(urlAPI);
          const result = await response.json();
          
          console.log("RESPOSTA DISCENTES:", result);

          let listaBruta = [];
          if (Array.isArray(result)) {
            listaBruta = result;
          } else if (result.dados && Array.isArray(result.dados)) {
            listaBruta = result.dados;
          } else if (result.discentes && Array.isArray(result.discentes)) {
            listaBruta = result.discentes;
          } else if (result.sucesso && Array.isArray(result.dados)) {
            listaBruta = result.dados;
          }

          setDiscentes(listaBruta);
        }
      } catch (error) {
        console.error("Erro no carregamento inicial:", error);
      }
    };

    carregarInicial();
    carregarAtividades();
  }, []);

  // Preenche a data do formulário ao clicar em um dia do calendário
  const selecionarDiaCalendario = (dia: number) => {
    setDiaSelecionado(dia);
    const mesFormatado = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const diaFormatado = String(dia).padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const dataString = `${diaFormatado}/${mesFormatado}/${ano}`;
    
    setData(dataString);
    setDataRotina(dataString);
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

  const carregarAtividades = async () => {
    setCarregandoAtividades(true);
    setErroAtividades(false);

    try {
      const response = await fetch(

        "http://192.168.0.107/DiarioInclusivo/src/app/listar_atividades.php"

      );
      const result = await response.json();

      if (result.sucesso && Array.isArray(result.dados)) {
        setListaAtividades(
          result.dados.map((atividade: any) => ({
            idAtividades: Number(atividade.idAtividades),
            nome: atividade.nome,
          }))
        );
      } else if (Array.isArray(result)) {
        setListaAtividades(
          result.map((atividade: any) => ({
            idAtividades: Number(atividade.idAtividades),
            nome: atividade.nome,
          }))
        );
      } else {
        setListaAtividades([]);
        setErroAtividades(true);
      }
    } catch (error) {
      setListaAtividades([]);
      setErroAtividades(true);
      console.error("Erro ao conectar com servidor de atividades:", error);
    } finally {
      setCarregandoAtividades(false);
    }
  };

  const abrirSeletorAtividades = () => {
    setModalAtividadesVisivel(true);
    carregarAtividades();
  };

  const handleAbrirModalSincronizarRotina = async () => {
    if (!idDiscente) {
      Alert.alert("Atenção", "Selecione um discente antes de sincronizar a rotina.");
      return;
    }

    setLoadingRotina(true);
    try {
      const resposta = await fetch(

        `http://192.168.0.107/DiarioInclusivo/src/app/listar_rotina.php?idUsuario=${idUsuario}`

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

  const handleSelecionarRotina = (rotina: Rotina) => {
    setRotinaSelecionada(rotina);
    const ativsComNota = rotina.atividades.map((a) => ({
      ...a,
      avaliacao: 5,
    }));
    setAtividadesRotinaEditavel(ativsComNota);
  };

  const handleMudarNotaAtividadeRotina = (index: number, nota: number) => {
    const novas = [...atividadesRotinaEditavel];
    novas[index].avaliacao = nota;
    setAtividadesRotinaEditavel(novas);
  };

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
        `http://192.168.0.107/DiarioInclusivo/src/app/sincronizar_rotina_diario.php`,

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
      } else {
        Alert.alert("Erro", result.mensagem);
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível sincronizar a rotina.");
    } finally {
      setLoadingRotina(false);
    }
  };

  const handleDataChange = (text: string) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let dataFormatada = apenasNumeros;

    if (apenasNumeros.length > 2 && apenasNumeros.length <= 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length > 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
    }

    setData(dataFormatada);
  };

  const handleHoraChange = (text: string, setHora: (v: string) => void) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let horaFormatada = apenasNumeros;

    if (apenasNumeros.length > 2) {
      horaFormatada = `${apenasNumeros.slice(0, 2)}:${apenasNumeros.slice(2, 4)}`;
    }

    setHora(horaFormatada);
  };

  const handleSalvarDiario = async () => {
    if (!idDiscente) {
      Alert.alert("Atenção", "Selecione um discente antes de criar o registro.");
      return;
    }
    if (!idAtividades) {
      Alert.alert("Atenção", "Por favor, selecione uma atividade.");
      return;
    }
    if (!data || data.length < 10) {
      Alert.alert("Atenção", "Por favor, digite a data completa (DD/MM/AAAA).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(

        "http://192.168.0.107/DiarioInclusivo/src/app/criar_diario.php",

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

      const result = await response.json();

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
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarHistorico = async () => {
    if (!idDiscente) {
      Alert.alert("Atenção", "Selecione um discente para consultar o histórico.");
      return;
    }

    setLoadingHistorico(true);
    try {
      const response = await fetch(

        `http://192.168.0.107/DiarioInclusivo/src/app/listar_diario.php?idDiscente=${idDiscente}`

      );
      const result = await response.json();

      if (result.sucesso) {
        setDiarios(result.dados);
        setModalHistoricoVisivel(true);
      } else {
        Alert.alert("Erro", result.mensagem || "Erro ao carregar histórico.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível buscar o histórico.");
    } finally {
      setLoadingHistorico(false);
    }
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

      {/* Seletor do Discente (Gatilho para o Modal) */}
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

      {/* Modal Seguro para Seleção do Discente */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSelecaoDiscenteVisivel}
        onRequestClose={() => setModalSelecaoDiscenteVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitulo}>Selecione um Discente</Text>

            {discentes.length === 0 ? (
              <Text style={styles.textoVazio}>Nenhum discente encontrado vinculado a este professor.</Text>
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

      {/* Botões de Ação */}
      <View style={styles.botoesAcaoContainer}>
        <Pressable
          style={[styles.botaoAcao, styles.botaoRoxo]}
          onPress={() => {
            if (!idDiscente) {
              Alert.alert("Atenção", "Selecione um discente antes de abrir uma nova entrada.");
              return;
            }
            setModalVisivel(true);
          }}
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
        onPress={handleIrParaHistorico}
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
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitulo}>Nova Entrada no Diário</Text>

                  <TouchableOpacity
                    style={styles.seletorAtividade}
                    onPress={abrirSeletorAtividades}
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

                  <TextInput
                    style={styles.input}
                    placeholder="Data (ex: 31/08/2026)"
                    placeholderTextColor="#888"
                    value={data}
                    onChangeText={handleDataChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />

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

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Observações do professor..."
                    placeholderTextColor="#888"
                    value={complemento}
                    onChangeText={setComplemento}
                    multiline={true}
                    numberOfLines={3}
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

      {/* Modal para Selecionar Atividade */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAtividadesVisivel}
        onRequestClose={() => setModalAtividadesVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitulo}>Selecione a Atividade</Text>

            {carregandoAtividades ? (
              <Text style={styles.textoVazio}>Carregando atividades...</Text>
            ) : erroAtividades ? (
              <TouchableOpacity onPress={carregarAtividades}>
                <Text style={styles.textoVazio}>Não foi possível carregar. Toque para tentar novamente.</Text>
              </TouchableOpacity>
            ) : listaAtividades.length === 0 ? (
              <Text style={styles.textoVazio}>Nenhuma atividade cadastrada.</Text>
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

      

      {/* Modal de Rotinas */}
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
                        <Text style={styles.cardHorario}>
                          Horário: {ativ.inicio} - {ativ.fim}
                        </Text>
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
                      numberOfLines={3}
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
                      {loadingRotina ? "Salvando..." : "Sincronizar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.barraMenuGeral}>
        {tipoUsuario === "2" ? (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/professores")}>
              <Image source={require("../../assets/images/prof.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Professores</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/discente")}>
              <Image source={require("../../assets/images/discente.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Discentes</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Rotina</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/configuracoes")}>
              <Image source={require("../../assets/images/confg.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Conf.</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
              <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Início</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/diarioProf")}>
              <Image source={require("../../assets/images/diarioD.png")} style={styles.iconeCustom} />
              <Text style={styles.tabLabel}>Diário</Text>
            </Pressable>

            <Pressable style={styles.botaoMenu} onPress={() => router.push("/rotina")}>
              <Image source={require("../../assets/images/rotina.png")} style={styles.iconeCustom} />
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
    backgroundColor: "#F5F2E8",
    padding: 16,
    paddingBottom: 95,
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
  },
  botaoMenu: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 30,
  },
  tabLabel: {
    fontSize: 12,
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
    marginTop: 5,
  },
  botaoAcao: {
    width: 270,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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