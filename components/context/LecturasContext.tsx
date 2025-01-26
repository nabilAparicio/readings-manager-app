import React, { createContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import * as FileSystem from "expo-file-system";
import * as SplashScreen from "expo-splash-screen";
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Estructura de cada archivo/lectura */
interface Lectura {
  id: string; // ID único (draggable, etc.)
  uri: string; // Path completo al archivo
  nombre: string; // Nombre sin extensión (lo que se muestra)
  lector: string; // Nombre del lector asignado (o metadato)
  orden: number; // Índice/orden en la lista
}

/** Tipos para el contexto */
interface LecturasContextType {
  directoryUri: string | null;
  lecturas: Lectura[];
  editMode: boolean;

  // Acciones
  setLecturas: (items: Lectura[]) => void;
  requestPermissions: () => Promise<void>;
  createLecturaFile: (filename: string, content: string) => Promise<void>;
  readLecturasFiles: () => Promise<void>;

  // Cambio de modo edición
  ActiveEditMode: () => void;
  DisableEditMode: () => void;

  // Funciones para editar lecturas
  renameLecturaFile: (id: string, newName: string) => Promise<void>;
  setLectorName: (id: string, lector: string) => void;
}

/** Exporta el contexto con valores por defecto */
export const LecturasContext = createContext<LecturasContextType>({
  directoryUri: null,
  lecturas: [],
  editMode: false,
  setLecturas: () => {},
  requestPermissions: async () => {},
  createLecturaFile: async () => {},
  readLecturasFiles: async () => {},
  ActiveEditMode: () => {},
  DisableEditMode: () => {},
  renameLecturaFile: async () => {},
  setLectorName: () => {},
});

/** Claves en AsyncStorage donde guardamos */
const DIRECTORY_URI_KEY = "myApp.directoryUri";
const LECTURAS_KEY = "myApp.lecturas";

/** Provider principal */
export function LecturasProvider({ children }: { children: ReactNode }) {
  const [directoryUri, setDirectoryUri] = useState<string | null>(null);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);

  /**
   * Pide al usuario que seleccione (y autorice) una carpeta.
   * Guarda la URI en el estado y en AsyncStorage.
   */
  const requestPermissions = async () => {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        // Guardamos en el estado
        setDirectoryUri(permissions.directoryUri);

        // Guardamos en AsyncStorage
        await AsyncStorage.setItem(DIRECTORY_URI_KEY, permissions.directoryUri);

        console.log("Carpeta seleccionada:", permissions.directoryUri);
      } else {
        console.log("Permisos denegados por el usuario.");
      }
    } catch (error) {
      console.error("Error al pedir permisos SAF:", error);
    }
  };

  /**
   * Crea un archivo (texto) dentro de la carpeta seleccionada,
   * y luego invoca readLecturasFiles() para volver a hacer el merge.
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

      // Escribe el contenido en el archivo
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        newFileUri,
        content
      );

      // Después de crear, hacemos el merge
      await readLecturasFiles();
    } catch (error) {
      console.error("Error al crear archivo:", error);
    }
  };

  /**
   * Lee todos los archivos .png/.jpg de la carpeta y los
   * "mergea" con los datos locales que haya en AsyncStorage.
   * - Elimina del estado aquellos que ya no existen en el disco.
   * - Añade los nuevos que aparezcan en el disco.
   * - Conserva `lector` (y otras props) de los que coincidan en `uri`.
   * - Actualiza el nombre desde el archivo real si fuera necesario.
   * - Finalmente, guarda la lista resultante en AsyncStorage.
   */
  const readLecturasFiles = async () => {
    const directoryUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
    if (!directoryUri) {
      console.warn("No se ha seleccionado ninguna carpeta para leer archivos.");
      return;
    }

    try {
      // 1. Leer la lista local desde AsyncStorage (si existe)
      const storedLecturasStr = await AsyncStorage.getItem(LECTURAS_KEY);
      const localLecturas: Lectura[] = storedLecturasStr
        ? JSON.parse(storedLecturasStr)
        : [];

      // 2. Listar archivos en la carpeta
      const allFiles =
        await FileSystem.StorageAccessFramework.readDirectoryAsync(
          directoryUri
        );

      // 3. Filtrar sólo .png / .jpg
      const filteredFiles = allFiles.filter((file) => {
        const lower = file.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg");
      });

      // 4. Generamos la nueva lista de lecturas
      const mergedLecturas: Lectura[] = filteredFiles.map((fileUri, index) => {
        // Nombre real del archivo
        const decodedUri = decodeURIComponent(fileUri);
        const splitted = decodedUri.split("/");
        const fileName = splitted[splitted.length - 1] || decodedUri;
        const fileNameWithoutExt = fileName.replace(/\.(png|jpg)$/i, "");

        // ¿Existen metadatos previos en local?
        const oldLectura = localLecturas.find((l) => l.uri === fileUri);

        if (oldLectura) {
          // Usamos su id, su lector, etc.
          return {
            ...oldLectura,
            nombre: fileNameWithoutExt, // El nombre lo actualizamos desde el FS
            orden: index, // Actualizamos el orden si lo deseas
          };
        } else {
          // Archivo nuevo, no hay metadatos
          return {
            id: `${Date.now()}-${index}`, // Crea un id único
            uri: fileUri,
            nombre: fileNameWithoutExt,
            lector: "",
            orden: index,
          };
        }
      });

      // 5. Guardamos en estado
      setLecturas(mergedLecturas);
      // 6. Persistimos en AsyncStorage
      await AsyncStorage.setItem(LECTURAS_KEY, JSON.stringify(mergedLecturas));

      console.log("Merge completado. Archivos en disco:", filteredFiles);
    } catch (error) {
      console.error("Error al leer archivos de la carpeta:", error);
    }
  };

  /**
   * useEffect que se dispara al montar el Provider:
   * 1) Busca el directoryUri guardado en AsyncStorage.
   * 2) Si existe, lo pone en estado y luego hace `readLecturasFiles()`.
   * 3) Si no existe, navega a /welcome.
   * 4) Finalmente, quita el SplashScreen.
   */
  useEffect(() => {
    (async () => {
      try {
        const storedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
        if (storedUri) {
          setDirectoryUri(storedUri);
          // Ahora que tenemos la carpeta, hacemos el merge
          await readLecturasFiles();
          router.replace("/");
        } else {
          // No hay carpeta en memoria
          router.replace("/welcome");
        }
      } catch (error) {
        console.error("Error cargando directoryUri:", error);
      } finally {
        // Oculamos el SplashScreen
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  /** Activar modo edición */
  const ActiveEditMode = () => setEditMode(true);

  /** Desactivar modo edición */
  const DisableEditMode = () => setEditMode(false);

  /**
   * Renombrar físicamente un archivo en la carpeta SAF y actualizar la lista.
   * - Copiamos el contenido en base64, creamos nuevo archivo, borramos el anterior.
   * - Actualizamos en el estado con la nueva URI y el nuevo nombre.
   * - Guardamos en AsyncStorage.
   */
  const renameLecturaFile = async (id: string, newName: string) => {
    try {
      if (!directoryUri) {
        console.warn("No se ha seleccionado ninguna carpeta.");
        return;
      }

      // 1. Buscar la lectura en la lista actual
      const lecturaIndex = lecturas.findIndex((item) => item.id === id);
      if (lecturaIndex < 0) {
        console.warn("Archivo no encontrado en la lista.");
        return;
      }

      const oldLectura = lecturas[lecturaIndex];
      const oldUri = oldLectura.uri;
      const fileExtension = oldUri.toLowerCase().endsWith(".png")
        ? "png"
        : "jpg";

      // 2. Leer su contenido en base64
      const base64Data =
        await FileSystem.StorageAccessFramework.readAsStringAsync(oldUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

      // 3. Crear un nuevo archivo con el nuevo nombre
      const newFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          `${newName}.${fileExtension}`,
          `image/${fileExtension}`
        );

      // 4. Escribir contenido base64 en el nuevo archivo
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        newFileUri,
        base64Data,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // 5. Eliminar el anterior
      await FileSystem.StorageAccessFramework.deleteAsync(oldUri);

      // 6. Actualizar en estado
      setLecturas((prev) => {
        const copy = [...prev];
        copy[lecturaIndex] = {
          ...oldLectura,
          uri: newFileUri,
          nombre: newName,
          id: id, // Podemos usar la nueva URI como id
        };
        return copy;
      });

      // 7. Guardar en AsyncStorage la lista actualizada
      setLecturas((prev) => {
        AsyncStorage.setItem(LECTURAS_KEY, JSON.stringify(prev));
        return prev;
      });

      console.log(`Archivo renombrado de ${oldUri} a ${newFileUri}`);
    } catch (error) {
      console.error("Error al renombrar archivo:", error);
    }
  };

  /**
   * Actualiza en memoria el nombre del lector para la lectura, y persiste en AsyncStorage.
   */
  const setLectorName = (id: string, lectorName: string) => {
    setLecturas((prev) => {
      const newList = prev.map((lectura) =>
        lectura.id === id ? { ...lectura, lector: lectorName } : lectura
      );
      AsyncStorage.setItem(LECTURAS_KEY, JSON.stringify(newList));
      return newList;
    });
  };

  /**
   * Retornamos el Provider con todas las funciones y estados expuestos.
   */
  return (
    <LecturasContext.Provider
      value={{
        directoryUri,
        lecturas,
        editMode,
        setLecturas,
        requestPermissions,
        createLecturaFile,
        readLecturasFiles,
        ActiveEditMode,
        DisableEditMode,
        renameLecturaFile,
        setLectorName,
      }}
    >
      {children}
    </LecturasContext.Provider>
  );
}
