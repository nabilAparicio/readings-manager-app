import React, { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import * as FileSystem from "expo-file-system";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";

// Tipos para el contexto
interface LecturasContextType {
  directoryUri: string | null;
  lecturasFiles: string[];
  editMode: boolean;
  setLecturasFiles: (files: string[]) => void;
  requestPermissions: () => Promise<void>;
  createLecturaFile: (filename: string, content: string) => Promise<void>;
  readLecturasFiles: () => Promise<void>;
  ActiveEditMode: () => void;
  DisableEditMode: () => void;
}

// Creación del contexto con valores por defecto
export const LecturasContext = createContext<LecturasContextType>({
  directoryUri: "",
  lecturasFiles: [],
  editMode: false,
  setLecturasFiles: () => {},
  requestPermissions: async () => {},
  createLecturaFile: async () => {},
  readLecturasFiles: async () => {},
  ActiveEditMode: () => {},
  DisableEditMode: () => {},
});

export function LecturasProvider({ children }: { children: ReactNode }) {
  // URI de la carpeta que el usuario selecciona vía SAF
  const [directoryUri, setDirectoryUri] = useState<string | null>(null);
  // Lista de archivos en la carpeta elegida
  const [lecturasFiles, setLecturasFiles] = useState<string[]>([]);
  // Modo edicion
  const [editMode, setEditMode] = useState<boolean>(false);

  /**
   * 1. Pide al usuario que seleccione (y autorice) una carpeta.
   *    Guarda la URI resultante en 'directoryUri'.
   */
  const requestPermissions = async () => {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        setDirectoryUri(permissions.directoryUri);
        console.log("Carpeta seleccionada:", permissions.directoryUri);
      } else {
        console.log("Permisos denegados por el usuario.");
      }
    } catch (error) {
      console.error("Error al pedir permisos SAF:", error);
    }
  };

  /**
   * 2. Crea un archivo dentro de la carpeta seleccionada y escribe contenido en él.
   */
  const createLecturaFile = async (filename: string, content: string) => {
    if (!directoryUri) {
      console.warn(
        "No se ha seleccionado ninguna carpeta para guardar archivos."
      );
      return;
    }

    try {
      // Crea el archivo en la carpeta SAF seleccionada
      const newFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          filename,
          "text/plain"
        );
      console.log("Archivo creado en:", newFileUri);
      // Escribe el contenido en ese archivo
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        newFileUri,
        content
      );

      // Después de crear, volvemos a listar los archivos
      await readLecturasFiles();
    } catch (error) {
      console.error("Error al crear archivo:", error);
    }
  };

  /**
   * 3. Lee todos los archivos que haya en la carpeta seleccionada (si existe la URI).
   */
  const readLecturasFiles = async () => {
    if (!directoryUri) {
      console.warn("No se ha seleccionado ninguna carpeta para leer archivos.");
      return;
    }

    try {
      // Obtiene la lista de archivos en la carpeta
      const allFiles =
        await FileSystem.StorageAccessFramework.readDirectoryAsync(
          directoryUri
        );

      // Filtra los archivos para incluir solo .png y .jpg
      const filteredFiles = allFiles.filter((file) => {
        const lowerFile = file.toLowerCase();
        return lowerFile.endsWith(".png") || lowerFile.endsWith(".jpg");
      });

      setLecturasFiles(filteredFiles);
      console.log("Archivos en carpeta seleccionada (png/jpg):", filteredFiles);
    } catch (error) {
      console.error("Error al leer archivos de la carpeta:", error);
    }
  };

  // 4. (Opcional) Si quisieras re-leer archivos al cambiar de carpeta automáticamente.
  useEffect(() => {
    if (directoryUri) {
      readLecturasFiles();
    } else {
      router.replace("/welcome");
    }
    SplashScreen.hideAsync();
  }, [directoryUri]);

  // 5. Activa el modo edición
  const ActiveEditMode = () => {
    setEditMode(true);
  };

  // 6. Desactiva el modo edición
  const DisableEditMode = () => {
    setEditMode(false);
  };

  // Retornamos el proveedor con las funciones y estados expuestos
  return (
    <LecturasContext.Provider
      value={{
        directoryUri,
        lecturasFiles,
        editMode,
        setLecturasFiles,
        requestPermissions,
        createLecturaFile,
        readLecturasFiles,
        ActiveEditMode,
        DisableEditMode,
      }}
    >
      {children}
    </LecturasContext.Provider>
  );
}
