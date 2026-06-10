import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";

export default function Footer({children}: {children: React.ReactNode}) {
  return (
    <View style={styles.rodapeFixo}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  rodapeFixo: {
    backgroundColor: "#F5F2E8",   // Fundo bege padrão para sumir na tela
    paddingBottom: 28,            // Proteção para o notch inferior do iPhone
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderTopWidth: 0.5,
    borderTopColor: "#F5F2E8",   // Linha divisória bem sutil
  },
  
});
