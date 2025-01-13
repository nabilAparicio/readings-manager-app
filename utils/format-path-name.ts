export function getFolderName(contentUri?: string) {
  if (!contentUri) return null;

  const decodedUri = decodeURIComponent(contentUri);
  // 1) Revisamos si existe "tree/"
  let afterTree = decodedUri.split("tree/")[1];
  if (!afterTree) {
    // Si no existe "tree/", no es el tipo de URI que esperamos
    return null;
  }

  // 2) afterTree podría verse así:
  //    - "primary:Documents"
  //    - "primary:Documents/document/primary:Documents/miArchivo.jpg"
  //    Quitamos el 'document/' si está presente (solo en caso de carpeta+archivo)
  if (afterTree.includes("document/")) {
    afterTree = afterTree.split("document/")[1]; // -> "primary:Documents/miArchivo.jpg"
  }

  // 3) Eliminamos 'primary:' (usualmente "primary:" indica la memoria interna principal)
  afterTree = afterTree.replace("primary:", ""); // -> "Documents" o "Documents/miArchivo.jpg"

  // 4) Separamos por "/" para saber si hay archivo incluido o no
  const segments = afterTree.split("/");

  // Caso A: Solo hay 1 segmento => es el nombre de la carpeta
  if (segments.length === 1) {
    return segments[0]; // "Documents"
  }

  // Caso B: Hay más de 1 segmento => la(s) carpeta(s) es todo menos el último (el archivo)
  return segments.slice(0, -1).join("/");
}

export function getFileName(contentUri?: string) {
  if (!contentUri) return null;
  const decodedUri = decodeURIComponent(contentUri);
  const afterDocument = decodedUri.split("document/")[1];
  if (!afterDocument) return null;

  const path = afterDocument.replace("primary:", "");
  const segments = path.split("/");
  if (!segments.length) {
    return null;
  }

  // El último elemento del array es el nombre del archivo
  return segments[segments.length - 1];
}

export const getFileNameWithoutExtension = (filePath: string) => {
  // Obtenemos solo el nombre del archivo (sin la ruta)
  const fileName = filePath?.split("/").pop() || "";

  // Eliminamos la extensión si es .png o .jpg (ignorando mayúsculas/minúsculas)
  return fileName.replace(/\.(png|jpg)$/i, "");
};
