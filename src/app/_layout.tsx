import { Stack, router } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { Tabs } from "expo-router";
import { StyleSheet, Image } from "react-native";
import React from "react";

const LogoDireita = () => (
  <Image 
    source={require("../../assets/images/logo.png")} 
    style={{ width: 95, height: 45, }} 
    
  />
);

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F5F2E8", // Fundo do cabeçalho bege
        },
        headerTintColor: "#2F1CA6", // Cor da seta roxa
        contentStyle: {
          backgroundColor: "#F5F2E8",
        },
        headerShadowVisible: false, // Remove a sombra do cabeçalho
      }}
      
    >
      {/* Tela inicial */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />

      {/* Tela de cadastro: Seta pura, sem título */}
      <Stack.Screen 
        name="cadRespAdm" 
        options={{ 
          headerTitle: "CADASTRO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />

              
            </Pressable>
          ),
        }} 
      />

      {/* Tela de login: Seta pura, sem título */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerTitle: "LOGIN", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="inicio" 
        options={{ 
          headerShown: false,
        }} 
      />

      <Stack.Screen 
        name="discente" 
        options={{ 
          headerTitle: "DISCENTE", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="discenteResp" 
        options={{ 
          headerTitle: "DISCENTE", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="cadDiscente" 
        options={{ 
          headerTitle: "CADASTRO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="cadProf" 
        options={{ 
          headerTitle: "CADASTRO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="criarRotina" 
        options={{ 
          headerTitle: "ROTINA", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="menu" 
        options={{ 
          headerTitle: "MENU", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="minhasRotinas" 
        options={{ 
          headerTitle: "ROTINAS", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="diarioProf" 
        options={{ 
          headerTitle: "DIÁRIO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="diarioResp" 
        options={{ 
          headerTitle: "DIÁRIO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="professores" 
        options={{ 
          headerTitle: "PROFESSORES", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
              
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />

      <Stack.Screen 
        name="rotina" 
        options={{ 
          headerTitle: "ROTINA", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="infoProf" 
        options={{ 
          headerTitle: "INFORMAÇÕES DO PROFESSOR", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="infoDiscente" 
        options={{ 
          headerTitle: "INFORMAÇÕES DO DISCENTE", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
        }} 
      />

      <Stack.Screen 
        name="diario" 
        options={{ 
          headerTitle: "DIÁRIO", // <-- Deixa o centro do cabeçalho totalmente vazio
          headerBackVisible: false, 
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="chevron-back" size={26} color="#2F1CA6" />
            </Pressable>
          ),
          headerRight: () => <LogoDireita />
        }} 
      />
    </Stack>
  );
}

