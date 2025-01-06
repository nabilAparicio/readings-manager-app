import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function Reading() {
  const params = useLocalSearchParams();
  return (
    <View>
      <Text>test lectura</Text>
    </View>
  );
}
