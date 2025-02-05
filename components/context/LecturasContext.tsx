import React, { createContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import * as FileSystem from "expo-file-system";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Lectura {
  id: string;
  uri: string;
  nombre: string;
  lector: string;
  orden: number;
}

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
        await readLecturasFiles();

        console.log("Carpeta seleccionada:", permissions.directoryUri);
      } else {
        console.log("Permisos denegados por el usuario.");
      }
    } catch (error) {
      console.error("Error al pedir permisos SAF:", error);
    }
  };

  /**
   * Crea un archivo en la carpeta seleccionada.
   * - Detecta la extensión para asignar mime-type (PNG, JPG, PDF o texto).
   * - Después lo escribe con el contenido que se pase.
   * - Finalmente, vuelve a leer la carpeta para hacer el merge (readLecturasFiles).
   */
  const createLecturaFile = async (filename: string, content: string) => {
    if (!directoryUri) {
      console.warn(
        "No se ha seleccionado ninguna carpeta para guardar archivos."
      );
      return;
    }

    // Detectar la extensión para asignar el mime-type correcto
    const extension = filename.split(".").pop()?.toLowerCase();
    let mimeType = "text/plain";
    if (extension === "pdf") {
      mimeType = "application/pdf";
    } else if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "jpg" || extension === "jpeg") {
      mimeType = "image/jpg";
    }

    try {
      // Crea el archivo en la carpeta SAF seleccionada
      const newFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          filename,
          mimeType
        );
      console.log("Archivo creado en:", newFileUri);

      // Escribe el contenido en el archivo
      // - Para PDFs o imágenes, probablemente quieras escribir en base64.
      //   En este ejemplo asumimos que "content" es texto o base64 según corresponda.
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
   * Lee todos los archivos .png/.jpg/.pdf de la carpeta y los
   * "mergea" con los datos locales que haya en AsyncStorage.
   * - Elimina del estado aquellos que ya no existen en el disco.
   * - Añade los nuevos que aparezcan en el disco.
   * - Conserva `lector` (y otras props) de los que coincidan en `uri`.
   * - Actualiza el nombre desde el archivo real si fuera necesario.
   * - Finalmente, guarda la lista resultante en AsyncStorage.
   */
  const readLecturasFiles = async () => {
    const dirUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
    if (!dirUri) {
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
        await FileSystem.StorageAccessFramework.readDirectoryAsync(dirUri);

      // 3. Filtrar sólo .png / .jpg / .pdf
      const filteredFiles = allFiles.filter((file) => {
        const lower = file.toLowerCase();
        return (
          lower.endsWith(".png") ||
          lower.endsWith(".jpg") ||
          lower.endsWith(".pdf")
        );
      });

      // 4. Generar la nueva lista de lecturas
      const mergedLecturas: Lectura[] = filteredFiles.map((fileUri, index) => {
        // Nombre real del archivo
        const decodedUri = decodeURIComponent(fileUri);
        const splitted = decodedUri.split("/");
        const fileName = splitted[splitted.length - 1] || decodedUri;
        // Quitamos la extensión (.png, .jpg, .pdf)
        const fileNameWithoutExt = fileName.replace(/\.(png|jpg|pdf)$/i, "");

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
   * 3) Si no existe, navega a /welcome (o la ruta que prefieras).
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
        // Ocultamos el splash tras un pequeño retraso para asegurarnos de que la app
        setTimeout(() => SplashScreen.hideAsync(), 1000);
      }
    })();
  }, []);

  /** Activar modo edición */
  const ActiveEditMode = () => setEditMode(true);

  /** Desactivar modo edición */
  const DisableEditMode = () => setEditMode(false);

  /**
   * Renombrar físicamente un archivo en la carpeta SAF y actualizar la lista.
   * - Copiamos el contenido en base64, creamos nuevo archivo con el nuevo nombre,
   *   y borramos el anterior.
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
      const lowerUri = oldUri.toLowerCase();

      // Detectar extensión original
      let fileExtension = "";
      if (lowerUri.endsWith(".png")) {
        fileExtension = "png";
      } else if (lowerUri.endsWith(".jpg")) {
        fileExtension = "jpg";
      } else if (lowerUri.endsWith(".pdf")) {
        fileExtension = "pdf";
      } else {
        // Por defecto, asumimos jpg si no encontramos nada
        fileExtension = "jpg";
      }

      // Determinar mime-type
      let mimeType = "";
      if (fileExtension === "png") {
        mimeType = "image/png";
      } else if (fileExtension === "jpg") {
        mimeType = "image/jpg";
      } else if (fileExtension === "pdf") {
        mimeType = "application/pdf";
      }

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
          mimeType
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
          // Conservamos el mismo id,
          id,
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
