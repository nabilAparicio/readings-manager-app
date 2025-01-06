import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

interface StepOneProps {
  handleNextStep: () => void;
}

export default function StepOne({ handleNextStep }: StepOneProps) {
  return (
    <>
      {/* Si quieres agregar un logo o imagen de bienvenida */}
      <Image
        source={require("../../../assets/ilustrations/welcome-ilustration.png")}
        style={styles.image}
      />
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>
        Gracias por utilizar nuestra app para gestionar tu período devocional.
      </Text>
      <Text style={styles.description}>
        A continuación te guiaremos para configurar los permisos y poder
        comenzar.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>Empezar</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 650,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    color: "#555",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
    color: "#888",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
