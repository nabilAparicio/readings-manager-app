import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { Image, TouchableOpacity } from "react-native";
import { LecturasContext } from "@/components/context/LecturasContext";
import { getFolderName } from "@/utils/format-path-name";

const NoFiles = () => {
  const { directoryUri, requestPermissions } = useContext(LecturasContext);

  const isFolderAuthorized = Boolean(directoryUri && directoryUri.length > 0);
  const handleChangeFolder = () => {
    requestPermissions();
  };
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/ilustrations/no-data-ilustration.png")}
        style={styles.image}
      />
      <View style={styles.emptySubContainer}>
        <Text style={styles.emptyText}>Aún no hay archivos en la carpeta.</Text>
        {isFolderAuthorized && (
          <>
            <View style={styles.folderInfoContainer}>
              <Text style={styles.folderTitle}>Carpeta Seleccionada:</Text>
              <Text style={styles.folderName}>
                {getFolderName(directoryUri || "")}
              </Text>
              <Text style={styles.folderPath}>{directoryUri}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleChangeFolder}
              >
                <Text style={styles.buttonText}>
                  {!isFolderAuthorized ? "Autorizar ahora" : "Cambiar carpeta"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Text style={styles.instructionsText}>
          Conecta tu tablet en modo almacenamiento masivo a la computadora y
          coloca los archivos en la carpeta autorizada.
        </Text>
      </View>
    </View>
  );
};

export default NoFiles;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: "contain",
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptySubContainer: {
    flex: 1,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  folderInfoContainer: {
    backgroundColor: "#F1F8E9",
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
});
