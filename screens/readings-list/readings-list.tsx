import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { LecturasContext } from "@/components/context/LecturasContext";
import { router } from "expo-router";

export default function ReadingList() {
  const { directoryUri, lecturasFiles, readLecturasFiles } =
    useContext(LecturasContext);
  const folderName = directoryUri ? directoryUri.split("/").pop() : "";

  const isFolderAuthorized = Boolean(directoryUri && directoryUri.length > 0);

  // Cada vez que tengas un URI de carpeta, intentas leer los archivos
  useEffect(() => {
    if (directoryUri) {
      readLecturasFiles();
    }
  }, [directoryUri]);

  // Función para renderizar cada ítem de la lista
  const renderFileItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* Asume que 'item' puede ser un objeto con nombre o una string con el nombre del archivo */}
      <Text style={styles.itemText}>{item.name || item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus archivos</Text>

      {lecturasFiles && lecturasFiles.length > 0 ? (
        // Si hay archivos, los mostramos en un FlatList
        <FlatList
          data={lecturasFiles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderFileItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        // Si no hay archivos, mostramos el mensaje amigable
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/ilustrations/no-data-ilustration.png")}
            style={styles.image}
          />
          <Text style={styles.emptyText}>
            Aún no hay archivos en la carpeta.
          </Text>
          {isFolderAuthorized && (
            <View style={styles.folderInfoContainer}>
              <Text style={styles.folderTitle}>Carpeta Seleccionada:</Text>
              <Text style={styles.folderName}>{folderName}</Text>
              <Text style={styles.folderPath}>{directoryUri}</Text>
            </View>
          )}
          <Text style={styles.instructionsText}>
            Conecta tu tablet en modo almacenamiento masivo a la computadora y
            coloca los archivos en la carpeta autorizada.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
    marginBottom: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 24,
  },
  itemContainer: {
    backgroundColor: "#f1f1f1",
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
});
