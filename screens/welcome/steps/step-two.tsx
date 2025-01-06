import { LecturasContext } from "@/components/context/LecturasContext";
import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

interface AuthorizeFolderScreenProps {
  handleNextStep: () => void;
}

export default function AuthorizeFolderScreen({
  handleNextStep,
}: AuthorizeFolderScreenProps) {
  const { directoryUri, requestPermissions } = useContext(LecturasContext);

  const folderName = directoryUri ? directoryUri.split("/").pop() : "";

  const isFolderAuthorized = Boolean(directoryUri && directoryUri.length > 0);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/ilustrations/confirmation-ilustration.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Autorizar Carpeta</Text>
      <Text style={styles.description}>
        Antes de conectar la tablet a la computadora, necesitamos que autorices
        el acceso a una carpeta para que esta app pueda guardar y leer tus
        lecturas devocionales.
      </Text>

      {/* Mostramos la info de la carpeta solamente si está autorizada */}
      {isFolderAuthorized && (
        <View style={styles.folderInfoContainer}>
          <Text style={styles.folderTitle}>Carpeta Seleccionada:</Text>
          <Text style={styles.folderName}>{folderName}</Text>
          <Text style={styles.folderPath}>{directoryUri}</Text>
        </View>
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>
            {!isFolderAuthorized ? "Autorizar ahora" : "Cambiar carpeta"}
          </Text>
        </TouchableOpacity>

        {/* El botón "Siguiente" solo se habilita cuando se ha autorizado la carpeta */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            !isFolderAuthorized && styles.disabledButton,
          ]}
          onPress={isFolderAuthorized ? handleNextStep : undefined}
          disabled={!isFolderAuthorized}
        >
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  image: {
    width: "100%",
    height: 650,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    paddingHorizontal: 50,
    marginVertical: 16,
    textAlign: "center",
    color: "#555",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  folderInfoContainer: {
    backgroundColor: "#F1F8E9",
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  folderName: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
  },
  folderPath: {
    fontSize: 14,
    marginTop: 4,
    color: "#666",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
});
