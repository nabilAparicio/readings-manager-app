import ReadingList from "@/screens/readings-list/readings-list";
import React from "react";

interface ReadingFile {
  id: string;
  title: string;
  content: string;
}

export default function Home() {
  return <ReadingList />;
}
