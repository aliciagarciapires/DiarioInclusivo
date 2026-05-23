import { Text, TextInput, View, StyleSheet, TouchableOpacity, Modal, Pressable, Image } from "react-native";  // são as ferramentas que utilizo no código
import { useState } from "react";
import {Link, router} from "expo-router"
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "../../components/Button"
import Footer from "../../components/Footer";

//Modal:utilizei para fazer a parte de escolher os dias da semana, ele sobe a janelinha
//useState:guarda temporariamente tudo o que muda enquanto o usuário utiliza o app
//DateTimePicker:biblioteca externa para data e hora
export default function CriarRotina() {
  // Estados para as Horas
  const [horaInicio, setHoraInicio] = useState<Date>(new Date()); //guarda a hora exata e começa com a hora atual
  const [horaFim, setHoraFim] = useState<Date>(new Date()); 
  const [mostrarInicio, setMostrarInicio] = useState(false);    //se o relogio deve aparecer ou não
  const [mostrarFim, setMostrarFim] = useState(false);

  // Estado para o Nome da Tarefa
  const [tarefa, setTarefa] = useState('');  //guarda o texto que o usuário digitou em "Nome"

  // Estados para a Repetição (Dias da Semana)
  const [mostrarRepetir, setMostrarRepetir] = useState(false);  //controla o Modal, se a janela aparece ou não e começa com falso pq ela fica escondida
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]); //guarda quais dias o usuário escolheu

 //Estado para a Data 
  const [data, setData] = useState('');  //guarda a data que o usuário digitou

  const aplicarMascaraData = (text: string) => {
    // Remove tudo o que não for número
    let num = text.replace(/\D/g, ''); 
    
    // Limita em no máximo 8 números impedindo que o usuário digite mais
    if (num.length > 8) {
        num = num.slice(0, 8);
    }

    // Aplica a formatação das barras de acordo com o tamanho do texto
    if (num.length > 4) {
        num = `${num.slice(0, 2)}/${num.slice(2, 4)}/${num.slice(4)}`;
    } else if (num.length > 2) {
        num = `${num.slice(0, 2)}/${num.slice(2)}`;
    }

  // Atualiza o estado com a string formatada (ex: 18/05/2026)
  setData(num);
};

  // Lista de dias para renderizar no Modal
  const diasDaSemana = [
    { id: 0, label: 'D' },
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
  ];

  // Função para marcar/desmarcar os dias no modal
  const alternarDia = (id: number) => {
    if (diasSelecionados.includes(id)) {                {/* varre o meu array e verifica qual numero foi clicado e se o dia já estava clicado ele vai desmarcar */}
      setDiasSelecionados(diasSelecionados.filter(dia => dia !== id)); {/* O filter cria uma lista nova sem o número */}
    } else {
      setDiasSelecionados([...diasSelecionados, id]);
    }
  };

  // Função que gera o texto dinâmico (Ex: "Nunca", "Todos os dias" ou "Seg, Qua")
  const obterTextoRepetir = () => {
    if (diasSelecionados.length === 0) return "Nunca >";
    if (diasSelecionados.length === 7) return "Todos os dias >";
    
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return diasSelecionados
      .sort((a, b) => a - b) //organiza os números do array em ordem crescente.
      .map(id => nomesDias[id])  //muda os números do ID para os respectivos dias da semana
      .join(', ') + " >";
  };

  return (
    <View style={styles.container}>

      <View style={styles.caixa}>
        <Text style={styles.caixaTitulo}>+ Adicionar tarefa</Text>
        
        {/* FILEIRA HORÁRIOS (INÍCIO / TERMINAR) */}
        <View style={styles.linha}>
          
          {/* Coluna Início */}
          <View style={styles.colunaBotao}>
            <Text style={styles.textoEtiqueta}>Iniciar</Text>
            <TouchableOpacity style={styles.botaoHora} onPress={() => setMostrarInicio(true)}>
              <Text style={styles.botaoHoraTexto}>
                {horaInicio.getHours().toString().padStart(2, "0")}:
                {horaInicio.getMinutes().toString().padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Coluna Terminar */}
          <View style={styles.colunaBotao}>
            <Text style={styles.textoEtiqueta}>Terminar</Text>
            <TouchableOpacity style={styles.botaoHora} onPress={() => setMostrarFim(true)}>
              <Text style={styles.botaoHoraTexto}>
                {horaFim.getHours().toString().padStart(2, "0")}:
                {horaFim.getMinutes().toString().padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

         {/* DATA */}
        <View style={styles.colunaData}>
            <Text style={styles.textoEtiqueta}>Data</Text>
            <TextInput
                style={styles.botaoData} 
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#4A4A46BF"
                keyboardType="numeric"    
                maxLength={10}            
                value={data}
                onChangeText={aplicarMascaraData} // Usa a função de barras que criamos antes
            />
        </View>
    
        {/* INPUT NOME DA TAREFA */}
        <TextInput 
          style={styles.inputLargo} 
          value={tarefa} 
          onChangeText={setTarefa} 
          placeholder="Nome"
          placeholderTextColor="#4A4A46BF"
        />

        {/* BOTÃO COMPONENTE REPETIR */}
        <TouchableOpacity style={styles.botaoRepetir} onPress={() => setMostrarRepetir(true)}>
          <Text style={styles.textoEtiquetaInput}>Repetir</Text>
          <Text style={styles.textoOpcaoRepetir}>{obterTextoRepetir()}</Text>
        </TouchableOpacity>

        {/* FILEIRA BOTÕES CANCELAR / SALVAR */}
        <View style={styles.linhaBotoesAcao}>
          <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]}>
        
             <Button style={styles.botaoAcao}  onPress={() => router.push("/rotina")}
               label="Cancelar"
               />    
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]}>
            <Button style={styles.botaoAcao}  onPress={() => router.push("/minhasRotinas")}
                label="Salvar"
              />    
  
    
          </TouchableOpacity>

        </View>


        {/* MODAL BOTTOM SHEET DOS DIAS DA SEMANA */}
        <Modal
          visible={mostrarRepetir} //true==modal aparece, false==não aparece
          animationType="slide" //efeito de suavidade, a janela sobe de baixo para cima
          transparent={true} //deixa o fundo um pouco preto enquanto o modal está aberto
          onRequestClose={() => setMostrarRepetir(false)} //faz o modal voltar caso o usuário queira, fznd o app não crachar
        >
          <View style={styles.fundoModal}>
            <View style={styles.conteudoModal}>
              <Text style={styles.tituloModal}>Repetir nos dias:</Text>
              
              <View style={styles.fileiraDias}>
                {diasDaSemana.map((dia) => {  // roda o array e cria um botão para cada dia
                  const selecionado = diasSelecionados.includes(dia.id); //verifica se o id foi selecionado
                  return (
                    <TouchableOpacity
                      key={dia.id} //Ajuda o motor do framework a identificar de forma única cada elemento da lista para atualizar a tela de forma rápida quando o usuário clica.
                      style={[styles.bolinhaDia, selecionado && styles.bolinhaSelecionada]}
                      onPress={() => alternarDia(dia.id)} //adicionando ou removendo o dia do array de escolhas.
                    >
                      <Text style={[styles.textoDia, selecionado && styles.textoDiaSelecionado]}>
                        {dia.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.botaoConfirmarModal} onPress={() => setMostrarRepetir(false)}>
                <Text style={styles.textoBotaoConfirmar}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* CONTROLES DO DATETIMEPICKER */}
        {mostrarInicio && ( //O relógio só é criado e jogado na tela se a variável antes do && for verdadeira.
          <DateTimePicker
            value={horaInicio}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) => {
              setMostrarInicio(false); //Fecha o relógio imediatamente para ele sumir da tela.
              if (selectedDate) setHoraInicio(selectedDate); //atualiza a hora caso o usuário tenha escolhido uma.
            }}
          />
        )}

        {mostrarFim && (
          <DateTimePicker
            value={horaFim}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) => {
              setMostrarFim(false);
              if (selectedDate) setHoraFim(selectedDate);
            }}
          />
        )}

      </View>
        <Footer />
                    <View style={styles.barraMenuGeral}>
                    
                    <Pressable style={styles.botaoMenu} onPress={() => router.push("/inicio")}>
                      <Image source={require("../../assets/images/home.png")} style={styles.iconeCustom} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F2E8",
    padding: 32
  },
  topo: {
    marginTop: 20,
    color: "#2F1CA6",
    fontWeight: "bold",
    fontSize: 18
  },
  
  caixa: {
    marginTop: 100, 
    width: 320,
    height: 380, // Aumentado um pouco para acomodar confortavelmente todos os novos botões
    borderWidth: 2,
    borderColor: "#2F1CA6",
    borderRadius: 20,
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  caixaTitulo: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2F1CA6",
    marginLeft: 17,
    marginTop: 10
  },
  linha: {
    flexDirection: "row",
    justifyContent: "space-around", 
    marginTop: 15,
    paddingHorizontal: 10
  },
  colunaBotao:{
    flexDirection: "column", 
    alignItems: "center",    
  },
  textoEtiqueta: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#7A7A76",
    marginBottom: 4,              
  },
  botaoHora: {
    width: 120,
    height: 35,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A4A46",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoHoraTexto: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4A4A46"
  },
  inputLargo: {
    width: '90%',
    height: 40,
    borderWidth: 2,
    borderColor: "#4A4A46",
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    fontWeight: "bold",
    fontSize: 16,
    color: "#4A4A46"
  },
  botaoRepetir: {
    width: '90%',
    height: 40,
    borderWidth: 2,
    borderColor: "#4A4A46",
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  textoEtiquetaInput: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4A4A46",
  },
  textoOpcaoRepetir: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#7A7A76",
  },
  linhaBotoesAcao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    paddingHorizontal: 10
  },
  botaoAcao: {
    width: 110,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botaoCancelar: {
    backgroundColor: '#E52222', // Vermelho correspondente ao print
  },
  botaoSalvar: {
    backgroundColor: '#76C813', // Verde correspondente ao print
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  
  // Estilos do Modal que simula Alarme
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'flex-end',            
  },
  conteudoModal: {
    backgroundColor: '#F5F2E8', 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    alignItems: 'center',
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F1CA6',
    marginBottom: 20,
  },
  fileiraDias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
  },
  bolinhaDia: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#4A4A46',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bolinhaSelecionada: {
    backgroundColor: '#2F1CA6', 
    borderColor: '#2F1CA6',
  },
  textoDia: {
    fontWeight: 'bold',
    color: '#4A4A46',
  },
  textoDiaSelecionado: {
    color: '#FFFFFF', 
  },
  botaoConfirmarModal: {
    backgroundColor: '#0477BF',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  textoBotaoConfirmar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  //DATAAAA

  colunaData: {
    flexDirection: "column", 
    alignItems: "flex-start", // Alinha a etiqueta "Data" com o começo do input    
    marginTop: 15,
    marginLeft: 17
  },
  botaoData: {
    width: 120,               // Mesma largura dos seus botões de hora (Iniciar/Terminar)
    height: 35,               // Mesma altura dos botões menores
    borderWidth: 2,
    borderColor: "#4A4A46",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontWeight: "bold",
    fontSize: 14,             // Fonte um pouco menor para caber a máscara perfeitamente
    color: "#4A4A46",
    textAlign: "center",       // Centraliza o texto digitado igual aos horários
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
    width: 200,                     
    height: 70,
    resizeMode: "contain",         
  },
  barraMenuGeral: {
    flexDirection: "row",          // Alinha os botões na horizontal
    justifyContent: "space-around",// Distribui igualmente o espaço entre eles
    alignItems: "center",
    backgroundColor: "#F5F2E8",    
    height: 90,                    
    paddingBottom: 30,             
    borderTopWidth: 3,             
    borderTopColor: "#F5F2E8",     
    borderTopLeftRadius: 35,       
    borderTopRightRadius: 35,      
    position: "absolute",          // Fixa no rodapé
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,                 
    shadowColor: "#000",
    marginTop: 20   
  },
});