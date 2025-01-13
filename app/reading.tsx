import React, { useState, useEffect, useContext } from "react";
import { View, Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LecturasContext } from "@/components/context/LecturasContext";

export default function Reading() {
  const { lecturasFiles } = useContext(LecturasContext);
  const { readingIndex } = useLocalSearchParams();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: lecturasFiles[+readingIndex],
        }}
        style={{
          width: screenWidth,
          height: screenHeight,
          resizeMode: "contain",
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
