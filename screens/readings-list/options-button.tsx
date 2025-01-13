import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { Menu, Edit, Exit } from "@/assets/icons";
import { LecturasContext } from "@/components/context/LecturasContext";

const OptionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { ActiveEditMode, editMode, DisableEditMode } =
    useContext(LecturasContext);

  // Valor compartido de Reanimated para controlar la apertura/cierre
  const progress = useSharedValue(0);

  const toggleMenu = () => {
    if (!isOpen) {
      // Abrimos el menú
      progress.value = withTiming(1, {
        duration: 200,
      });
    } else {
      // Cerramos el menú con una animación más suave
      progress.value = withTiming(0, { duration: 200 });
    }
    setIsOpen(!isOpen);
  };

  const HandleActiveEditMode = () => {
    progress.value = withTiming(0, { duration: 200 });
    setIsOpen(false);
    ActiveEditMode();
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  // Estilo animado para la opacidad y escala
  const animatedMenuStyle = useAnimatedStyle(() => {
    return {
      // Control de opacidad
      opacity: progress.value,
      // Control de escala interpolada
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
      // Control de pointerEvents (si quieres deshabilitar clics cuando está cerrado)
      // Se puede usar un valor umbral, por ejemplo: > 0.1
    };
  });

  return (
    <View style={styles.container}>
      {/* Menú envuelto en un Animated.View con Reanimated */}
      <Animated.View style={[styles.menuContainer, animatedMenuStyle]}>
        <TouchableOpacity
          onPress={HandleActiveEditMode}
          style={[styles.secondaryButton, styles.edit]}
        >
          <Edit />
          <Text style={styles.buttonText}>Editar nombres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExit}
          style={[styles.secondaryButton, styles.exit]}
        >
          <Exit />
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Botón principal que abre/cierra el menú */}
      {editMode ? (
        <TouchableOpacity
          onPress={DisableEditMode}
          style={[styles.secondaryButton, styles.exitEditMode]}
        >
          <Edit />
          <Text style={styles.buttonText}>Finalizar Edición</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.buttonContainer} onPress={toggleMenu}>
          <Menu />
        </TouchableOpacity>
      )}
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
  exitEditMode: {
    backgroundColor: "#92e3a9",
  },
  buttonText: {
    marginLeft: 6,
    color: "#000",
    fontWeight: "600",
  },
});
