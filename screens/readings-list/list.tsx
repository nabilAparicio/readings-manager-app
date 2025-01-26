import { Reorder } from "@/assets/icons";
import { LecturasContext } from "@/components/context/LecturasContext";
import { router } from "expo-router";
import React, { useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import OptionsButton from "./options-button";

const List = () => {
  const { lecturas, editMode, setLecturas, renameLecturaFile, setLectorName } =
    useContext(LecturasContext);

  // Estado para manejar las ediciones
  const [editingItems, setEditingItems] = useState<{
    [key: string]: { nombre: string; lector: string };
  }>({});

  // Limpiar ediciones al salir del modo edición
  useEffect(() => {
    if (!editMode) setEditingItems({});
  }, [editMode]);

  const openReading = (ID: string) => {
    router.push(`/reading?lecturaID=${ID}`);
  };

  const handleEdit = (item: any) => {
    setEditingItems((prev) => ({
      ...prev,
      [item.id]: { nombre: item.nombre, lector: item.lector },
    }));
  };

  const handleSave = async (itemId: string) => {
    const tempItem = editingItems[itemId];
    const originalItem = lecturas.find((l) => l.id === itemId);

    if (!tempItem || !originalItem) return;

    try {
      if (tempItem.nombre !== originalItem.nombre) {
        await renameLecturaFile(itemId, tempItem.nombre);
      }

      if (tempItem.lector !== originalItem.lector) {
        setLectorName(itemId, tempItem.lector);
      }

      setEditingItems((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const renderItem = ({
    item,
    drag,
    getIndex,
    isActive,
  }: RenderItemParams<{
    id: string;
    uri: string;
    nombre: string;
    lector: string;
    orden: number;
  }>) => {
    const isEditing = !!editingItems[item.id];

    return (
      <ScaleDecorator activeScale={1.03}>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            isActive ? styles.activeItem : styles.inactiveItem,
          ]}
          onPress={() => openReading(item.id)}
          disabled={isActive || editMode}
          onLongPress={editMode ? drag : undefined}
        >
          <View style={styles.rowBetween}>
            <View style={styles.textContainer}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={editingItems[item.id].nombre}
                    onChangeText={(text) =>
                      setEditingItems((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], nombre: text },
                      }))
                    }
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editingItems[item.id].lector}
                    onChangeText={(text) =>
                      setEditingItems((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], lector: text },
                      }))
                    }
                    placeholder="Sin lector"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.itemText}>{item.nombre}</Text>
                  <Text style={styles.itemSubText}>
                    {item.lector || "Sin lector"}
                  </Text>
                </>
              )}
            </View>

            {editMode && (
              <>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    isEditing ? handleSave(item.id) : handleEdit(item)
                  }
                >
                  <Text style={styles.editButtonText}>
                    {isEditing ? "Guardar" : "Editar"}
                  </Text>
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
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, paddingBottom: 24 }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Lista de lecturas
        </Text>
        <DraggableFlatList
          data={[...lecturas]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => setLecturas(data)}
          contentContainerStyle={styles.listContainer}
        />
        <OptionsButton />
      </KeyboardAvoidingView>
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
    backgroundColor: "#ccc",
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
    flex: 1,
    marginRight: 8,
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
    backgroundColor: "#5eafff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  editButtonText: {
    color: "#000",
  },
  reorderButton: {
    paddingLeft: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
    backgroundColor: "white",
  },
});
