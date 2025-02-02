import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { setVisibilityAsync } from "expo-navigation-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { LecturasProvider } from "@/components/context/LecturasContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      setVisibilityAsync("hidden");
      SplashScreen.preventAutoHideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <StatusBar hidden />
      <LecturasProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="+not-found" />
            <Stack.Screen
              name="reading"
              options={{
                title: "Lectura",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="list"
              options={{
                title: "Lecturas",
              }}
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="welcome"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
          </Stack>
        </ThemeProvider>
      </LecturasProvider>
    </GestureHandlerRootView>
  );
}
