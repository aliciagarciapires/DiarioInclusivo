import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Termos()
{
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
            <Text style={styles.titulo}>Termos de Uso</Text>

            <Text style={styles.subtitulo}>1. Aceitação dos termos</Text>
            <Text style={styles.texto}>
                Ao utilizar o Diário Inclusivo, o usuário declara que leu e
                concorda com estes Termos de Uso.
            </Text>

            <Text style={styles.subtitulo}>2. Sobre o aplicativo</Text>
            <Text style={styles.texto}>
                O Diário Inclusivo é uma ferramenta destinada à comunicação
                entre responsáveis, professores e demais usuários autorizados,
                permitindo o registro e o acompanhamento de informações
                relacionadas à rotina da criança.
            </Text>

            <Text style={styles.subtitulo}>3. Uso da conta</Text>
            <Text style={styles.texto}>
                O usuário é responsável pelas informações fornecidas durante
                o cadastro e pelo uso de sua conta. As informações de acesso
                devem ser mantidas em segurança e não devem ser compartilhadas
                com terceiros.
            </Text>

            <Text style={styles.subtitulo}>4. Informações registradas</Text>
            <Text style={styles.texto}>
                As informações inseridas no aplicativo devem ser utilizadas
                exclusivamente para as finalidades relacionadas ao
                acompanhamento e à comunicação permitidos pelo sistema.
            </Text>

            <Text style={styles.subtitulo}>5. Uso adequado</Text>
            <Text style={styles.texto}>
                O usuário concorda em utilizar o aplicativo de forma adequada,
                respeitando os demais usuários e não inserindo informações
                falsas, ofensivas ou que possam prejudicar terceiros.
            </Text>

            <Text style={styles.subtitulo}>6. Encerramento da conta</Text>
            <Text style={styles.texto}>
                O cadastro poderá ser encerrado conforme as funcionalidades
                disponibilizadas pelo aplicativo e as regras estabelecidas
                pelos responsáveis pelo sistema.
            </Text>

            <Text style={styles.subtitulo}>7. Alterações dos termos</Text>
            <Text style={styles.texto}>
                Estes Termos de Uso poderão ser atualizados quando necessário.
                Caso sejam realizadas alterações relevantes, uma nova versão
                poderá ser apresentada aos usuários.
            </Text>

            <Text style={styles.subtitulo}>8. Concordância</Text>
            <Text style={styles.texto}>
                Ao marcar a opção de concordância durante o cadastro, o usuário
                confirma que teve acesso a estes Termos de Uso e concorda com
                as condições apresentadas.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F2E8"
    },

    conteudo: {
        padding: 24,
        paddingBottom: 40
    },

    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2F1CA6",
        marginBottom: 25
    },

    subtitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2F1CA6",
        marginTop: 18,
        marginBottom: 8
    },

    texto: {
        fontSize: 15,
        lineHeight: 23,
        color: "#333"
    }
});