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
import { Reorder } from "@/assets/icons";

const List = () => {
  const { lecturasFiles, editMode, setLecturasFiles } =
    useContext(LecturasContext);

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
      <ScaleDecorator activeScale={1.03}>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            isActive ? styles.activeItem : styles.inactiveItem,
          ]}
          onPress={() => openReading(getIndex() || 0)}
          disabled={isActive || editMode}
        >
          <View style={styles.rowBetween}>
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.itemText}>
                  {getFileNameWithoutExtension(getFileName(item) || "")}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemSubText}>Orlando Aparicio</Text>
              </View>
            </View>
            {editMode && (
              <>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onLongPress={drag}
                  style={styles.reorderButton}
                >
                  <Reorder />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <>
      <DraggableFlatList
        data={lecturasFiles}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderItem}
        onDragEnd={({ data }) => setLecturasFiles(data)}
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
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: "#ccc", // feedback de arrastre al hacer drag
  },
  inactiveItem: {
    backgroundColor: "#f1f1f1",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    alignSelf: "flex-start",
    padding: 1,
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginLeft: "auto",
    marginRight: 8,
    backgroundColor: "#5eafff",
  },
  editButtonText: {
    color: "#000",
  },
  reorderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
