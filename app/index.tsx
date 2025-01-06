import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
import { Link } from "expo-router";
import { LecturasContext } from "@/components/context/LecturasContext";

interface ReadingFile {
  id: string;
  title: string;
  content: string;
}

export default function ReadingList() {
  const [files, setFiles] = useState<ReadingFile[]>([]);

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

  const {
    directoryUri,
    lecturasFiles,
    requestPermissions,
    createLecturaFile,
    readLecturasFiles,
  } = useContext(LecturasContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Reemplaza esto con tu logo real */}
        <View style={styles.logoPlaceholder} />
        <Text style={styles.title}>Lecturas del día {currentDate}</Text>
      </View>
      {false ? (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.readingItem}>
              <Link href={{ pathname: "/Lectura", params: { id: item.id } }}>
                <Text style={styles.readingTitle}>{item.title}</Text>
              </Link>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={{ padding: 20 }}>
          <Button
            title="Seleccionar carpeta (SAF)"
            onPress={requestPermissions}
          />
          <Button
            title="Crear archivo de prueba"
            onPress={() =>
              createLecturaFile("mi-archivo.txt", "Contenido de prueba")
            }
            disabled={!directoryUri}
          />
          <Button
            title="Leer archivos en la carpeta"
            onPress={readLecturasFiles}
            disabled={!directoryUri}
          />

          <Text style={{ marginTop: 20 }}>Carpeta actual: {directoryUri}</Text>
          <Text>Archivos listados:</Text>
          {lecturasFiles.map((file, index) => (
            <Text key={index}>{file}</Text>
          ))}
          <Link href={"/welcome"}>Ir a la pantalla de bienvenida</Link>
        </View>
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
