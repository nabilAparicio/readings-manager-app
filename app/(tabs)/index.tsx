import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface ReadingFile {
  id: string;
  title: string;
  content: string;
}

export default function ReadingList() {
  const [files, setFiles] = useState<ReadingFile[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Aquí cargarías los archivos de lectura. Por ahora usaremos datos simulados.
    const loadedFiles = [
      { id: "1", title: "Lectura 1", content: "Contenido de la lectura 1" },
      { id: "2", title: "Lectura 2", content: "Contenido de la lectura 2" },
      { id: "3", title: "Lectura 3", content: "Contenido de la lectura 2" },
      { id: "4", title: "Lectura 4", content: "Contenido de la lectura 2" },
      { id: "5", title: "Lectura 5", content: "Contenido de la lectura 2" },
      { id: "6", title: "Lectura 6", content: "Contenido de la lectura 2" },
    ];
    setFiles(loadedFiles);
  }, []);

  const currentDate = new Date().toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Reemplaza esto con tu logo real */}
        <View style={styles.logoPlaceholder} />
        <Text style={styles.title}>Lecturas del día {currentDate}</Text>
      </View>
      {files.length > 0 ? (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.readingItem}
              onPress={() =>
                navigation.navigate("ReadingScreen", {
                  title: item.title,
                  content: item.content,
                })
              }
            >
              <Text style={styles.readingTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>no files</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#ccc",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  readingItem: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
    borderRadius: 8,
  },
  readingTitle: {
    fontSize: 18,
  },
});
