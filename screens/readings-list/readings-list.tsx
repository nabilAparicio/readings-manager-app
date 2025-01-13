import { LecturasContext } from "@/components/context/LecturasContext";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import List from "./list";
import NoFiles from "./no-files";

export default function ReadingList() {
  const { lecturasFiles } = useContext(LecturasContext);

  return (
    <View style={styles.container}>
      {lecturasFiles && lecturasFiles.length > 0 ? <List /> : <NoFiles />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFF",
  },
});
