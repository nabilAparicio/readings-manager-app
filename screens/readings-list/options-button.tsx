import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Menu, Edit, Exit } from "@/assets/icons";

const OptionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isOpen ? 1 : 0, // 1 cuando está abierto, 0 cuando está cerrado
      duration: 200, // Duración de la animación (ms)
      useNativeDriver: true, // Habilita la aceleración nativa
    }).start();
  }, [isOpen, animationValue]);

  // Interpolaciones para opacidad y escala
  const opacity = animationValue; // Directo: 0->invisible, 1->visible

  const scale = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1], // Comienza un poco más pequeño y crece
  });

  const pointerEvents = isOpen ? "auto" : "none";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      {/* Menú envuelto en Animated.View para animar su aparición */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            opacity: opacity,
            transform: [{ scale: scale }],
          },
        ]}
        pointerEvents={pointerEvents}
      >
        <TouchableOpacity style={[styles.secondaryButton, styles.edit]}>
          <Edit />
          <Text style={styles.buttonText}>Editar nombres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryButton, styles.exit]}>
          <Exit />
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>
      </Animated.View>
      {/* Botón principal que abre/cierra el menú */}
      <TouchableOpacity style={styles.buttonContainer} onPress={toggleMenu}>
        <Menu />
      </TouchableOpacity>
    </View>
  );
};

export default OptionsButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 10,
    marginLeft: "auto",
    backgroundColor: "#92e3a9",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 42,
    height: 42,
  },
  menuContainer: {
    marginTop: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  exit: {
    backgroundColor: "#ff5e5e",
  },
  edit: {
    backgroundColor: "#5eafff",
  },
  buttonText: {
    marginLeft: 6,
    color: "#000",
    fontWeight: "600",
  },
});
