import ReadingView from "@/screens/reading";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Reading() {
  const { lecturaID } = useLocalSearchParams();
  return <ReadingView lecturaID={lecturaID} />;
}
