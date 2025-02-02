import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Asegúrate de tener instalado @expo/vector-icons

interface PaginationButtonsProps {
  onPressLeft: () => void;
  onPressRight: () => void;
  titleLeft?: string;
  subtitleLeft?: string;
  titleRight?: string;
  subtitleRight?: string;
}

const PaginationButtons = ({
  onPressLeft,
  onPressRight,
  titleLeft = "Salir",
  subtitleLeft,
  titleRight = "Salir",
  subtitleRight,
}: PaginationButtonsProps) => {
  return (
    <View style={styles.container}>
      {/* Botón Izquierdo */}
      <TouchableOpacity style={styles.buttonLeft} onPress={onPressLeft}>
        <Ionicons
          name="chevron-back"
          size={24}
          color="black"
          style={styles.icon}
        />
        <View>
          <Text style={styles.title}>{titleLeft}</Text>
          {subtitleLeft !== "Sin lector" && (
            <Text style={styles.subtitle}>{subtitleLeft}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Botón Derecho */}
      <TouchableOpacity style={styles.buttonRight} onPress={onPressRight}>
        <View>
          <Text style={styles.title}>{titleRight}</Text>
          {subtitleRight !== "Sin lector" && (
            <Text style={styles.subtitle}>{subtitleRight}</Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="black"
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  buttonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
});

export default PaginationButtons;
