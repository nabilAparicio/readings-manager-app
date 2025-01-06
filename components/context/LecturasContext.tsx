import React, { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import * as FileSystem from "expo-file-system";

// Tipos para el contexto
interface LecturasContextType {
  directoryUri: string;
  lecturasFiles: string[];
  requestPermissions: () => Promise<void>;
  createLecturaFile: (filename: string, content: string) => Promise<void>;
  readLecturasFiles: () => Promise<void>;
}

// Creación del contexto con valores por defecto
export const LecturasContext = createContext<LecturasContextType>({
  directoryUri: "",
  lecturasFiles: [],
  requestPermissions: async () => {},
  createLecturaFile: async () => {},
  readLecturasFiles: async () => {},
});

export function LecturasProvider({ children }: { children: ReactNode }) {
  // URI de la carpeta que el usuario selecciona vía SAF
  const [directoryUri, setDirectoryUri] = useState<string>("");
  // Lista de archivos en la carpeta elegida
  const [lecturasFiles, setLecturasFiles] = useState<string[]>([]);

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
      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(
        directoryUri
      );

      setLecturasFiles(files);
      console.log("Archivos en carpeta seleccionada:", files);
    } catch (error) {
      console.error("Error al leer archivos de la carpeta:", error);
    }
  };

  // 4. (Opcional) Si quisieras re-leer archivos al cambiar de carpeta automáticamente.
  useEffect(() => {
    // Cada vez que el usuario seleccione una carpeta distinta, podríamos leerla
    // automáticamente. Eso depende de tu preferencia.
    if (directoryUri) {
      readLecturasFiles();
    }
  }, [directoryUri]);

  // Retornamos el proveedor con las funciones y estados expuestos
  return (
    <LecturasContext.Provider
      value={{
        directoryUri,
        lecturasFiles,
        requestPermissions,
        createLecturaFile,
        readLecturasFiles,
      }}
    >
      {children}
    </LecturasContext.Provider>
  );
}
