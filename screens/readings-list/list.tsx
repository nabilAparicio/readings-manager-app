import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { LecturasContext } from "@/components/context/LecturasContext";
import { router } from "expo-router";
import {
  getFileName,
  getFileNameWithoutExtension,
} from "@/utils/format-path-name";
import OptionsButton from "./options-button";

const List = () => {
  const { lecturasFiles } = useContext(LecturasContext);

  // Guardamos el array de archivos en un estado local para poder actualizar su orden.
  const [data, setData] = useState<string[]>([]);

  // Cuando lecturasFiles cambie (por ejemplo, si se vuelve a leer la carpeta),
  // sincronizamos el estado local para reflejar esos cambios.
  useEffect(() => {
    setData(lecturasFiles);
  }, [lecturasFiles]);

  // Al hacer clic, navegamos a la lectura correspondiente.
  const openReading = (index: number) => {
    router.push(`/reading?readingIndex=${index}`);
  };

  // Render de cada ítem, incluyendo la lógica para permitir arrastre
  const renderItem = ({
    item,
    drag,
    getIndex,
    isActive,
  }: RenderItemParams<string>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            { backgroundColor: isActive ? "#ccc" : "#f1f1f1" }, // feedback de arrastre
          ]}
          onPress={() => openReading(getIndex() || 0)}
          onLongPress={drag}
          disabled={isActive}
        >
          <View>
            <Text style={styles.itemText}>
              {getFileNameWithoutExtension(getFileName(item) || "")}
            </Text>
            <Text style={styles.itemSubText}>Orlando Aparicio</Text>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <>
      <DraggableFlatList
        data={data}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderItem}
        // Se llama cuando sueltas el ítem arrastrado;
        // aquí actualizamos el orden final de 'data'.
        onDragEnd={({ data }) => setData(data)}
        contentContainerStyle={styles.listContainer}
      />
      <OptionsButton />
    </>
  );
};

export default List;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 24,
  },
  itemContainer: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemSubText: {
    fontSize: 14,
    color: "#666",
  },
});
