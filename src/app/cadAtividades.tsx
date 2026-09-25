import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { API_URL } from "./api";

export default function CadAtividade() {
  const [novoNomeAtividade, setNovoNomeAtividade] = useState('');
  const [loading, setLoading] = useState(false);


  const handleCadastrar = async () => {
    if (!novoNomeAtividade.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome da atividade.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/criar_atividade.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novoNomeAtividade: novoNomeAtividade.trim(),
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert('Sucesso!', data.mensagem);
        setNovoNomeAtividade(''); // Limpa o campo após cadastrar
      } else {
        Alert.alert('Erro', data.mensagem || 'Não foi possível cadastrar.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Cadastrar Atividade (ADM)</Text>

      <Text style={styles.label}>Nome da Atividade:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Leitura de Histórias, Pintura..."
        value={novoNomeAtividade}
        onChangeText={setNovoNomeAtividade}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCadastrar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar no Banco</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
