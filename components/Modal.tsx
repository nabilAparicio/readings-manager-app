import React, { useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";

interface ModalProps {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const { height } = Dimensions.get("window");

export const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  // Valor compartido para la animación (0 = cerrado, 1 = abierto)
  const modalAnimation = useSharedValue(0);

  // Efecto para animar cuando cambia el estado de visible
  useEffect(() => {
    if (visible) {
      modalAnimation.value = withTiming(1, { duration: 300 });
    } else {
      modalAnimation.value = withTiming(0, { duration: 300 }, (finished) => {
        // Cuando la animación de cierre termine, llamar a onClose si existe
        if (finished && onClose) {
          runOnJS(onClose)();
        }
      });
    }
  }, [visible, modalAnimation, onClose]);

  // Estilo animado para el fondo (fondo semitransparente)
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: modalAnimation.value,
    };
  });

  // Estilo animado para el contenedor del modal
  // Lo hacemos "subir" desde la parte inferior de la pantalla
  const modalContainerStyle = useAnimatedStyle(() => {
    // Interpolamos modalAnimation entre 'height' (abajo) y 0 (arriba)
    const translateY = interpolate(
      modalAnimation.value,
      [0, 1],
      [height, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  // Si no está visible y modalAnimation es 0, no renderizamos nada
  // Esto evita que el contenido quede “montado” cuando el modal está cerrado
  if (!visible && modalAnimation.value === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      {/* Fondo semitransparente */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        {/* Al presionar fuera del modal, cerramos (si se desea) */}
        <Pressable
          style={styles.overlay}
          onPress={() => (onClose ? onClose() : null)}
        />
      </Animated.View>

      {/* Contenedor animado del contenido del modal */}
      <Animated.View style={[styles.modalContainer, modalContainerStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Ocupa toda la pantalla
    justifyContent: "flex-end", // Alinea el modal al fondo de la pantalla
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});
