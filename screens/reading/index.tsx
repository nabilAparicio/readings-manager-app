import { LecturasContext } from "@/components/context/LecturasContext";
import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import Pdf from "react-native-pdf";
import * as FileSystem from "expo-file-system";
import PaginationButtons from "@/components/pagination-buttons";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/custom-header";

interface ReadingViewProps {
  lecturaID: string | string[];
}

export default function ReadingView({ lecturaID }: ReadingViewProps) {
  const router = useRouter();
  const { lecturas } = useContext(LecturasContext);

  const [currentReading, setCurrentReading] = useState(lecturaID);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const readingToShow = lecturas.find(
    (lectura) => lectura.id === currentReading
  );

  // Encuentra lectura previa y siguiente con base en "orden"
  const prevReading = lecturas.find(
    (lectura) =>
      lectura.orden === ((readingToShow && readingToShow?.orden - 1) || 0)
  );
  const nextReading = lecturas.find(
    (lectura) =>
      lectura.orden === ((readingToShow && readingToShow?.orden + 1) || 0)
  );

  const isPDF = readingToShow?.uri.includes(".pdf");

  // Manejo de lecturas siguiente y previa
  function handleNextReading() {
    if (!nextReading) {
      // Si no existe la siguiente lectura, ir a la ruta raíz
      router.push("/");
    } else {
      setCurrentReading(nextReading.id);
    }
  }

  function handlePrevReading() {
    if (!prevReading) {
      // Si no existe la lectura previa, ir a la ruta raíz
      router.push("/");
    } else {
      setCurrentReading(prevReading.id);
    }
  }

  useEffect(() => {
    const loadPdf = async () => {
      if (isPDF && readingToShow?.uri) {
        try {
          const localUri = `${FileSystem.documentDirectory}${Date.now()}.pdf`;
          await FileSystem.copyAsync({
            from: readingToShow.uri,
            to: localUri,
          });
          setPdfUri(localUri);
        } catch (error) {
          console.error("Error loading PDF:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Si NO es PDF, no hay que cargar nada especial
        setLoading(false);
      }
    };

    loadPdf();
  }, [readingToShow?.uri]);

  if (loading && isPDF) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {isPDF ? (
        <View style={styles.pdfcontainer}>
          <CustomHeader
            title={readingToShow?.nombre || "Sin nombre"}
            subtitle={readingToShow?.lector}
          />
          <Pdf
            trustAllCerts={false}
            source={{ uri: pdfUri || "", cache: true }}
            onLoadComplete={(numberOfPages) => {
              console.log(`Pages: ${numberOfPages}`);
            }}
            style={styles.pdf}
          />
          <PaginationButtons
            onPressLeft={handlePrevReading}
            onPressRight={handleNextReading}
            titleLeft={prevReading?.nombre}
            subtitleLeft={prevReading?.lector || "Sin lector"}
            titleRight={nextReading?.nombre}
            subtitleRight={nextReading?.lector || "Sin lector"}
          />
        </View>
      ) : (
        <View style={[styles.container, { paddingBottom: 60 }]}>
          <CustomHeader
            title={readingToShow?.nombre || "Sin nombre"}
            subtitle={readingToShow?.lector}
          />
          <ScrollView style={styles.container}>
            {readingToShow?.uri && (
              <Image
                source={{ uri: readingToShow.uri }}
                style={{
                  width: screenWidth,
                  height: screenHeight,
                  resizeMode: "contain",
                }}
              />
            )}
          </ScrollView>
          <PaginationButtons
            onPressLeft={handlePrevReading}
            onPressRight={handleNextReading}
            titleLeft={prevReading?.nombre}
            subtitleLeft={prevReading?.lector || "Sin lector"}
            titleRight={nextReading?.nombre}
            subtitleRight={(nextReading && nextReading?.lector) || "Sin lector"}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "#fff",
    flex: 1,
  },
  pdfcontainer: {
    position: "relative",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  pdf: {
    backgroundColor: "#fff",
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  readingName: {
    color: "#4d4d4d",
    paddingTop: 20,
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  readerName: {
    color: "#4d4d4d",
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "600",
  },
});
