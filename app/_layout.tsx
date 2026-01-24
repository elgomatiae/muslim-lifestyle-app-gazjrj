
import "react-native-reanimated";
import React, { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ImanTrackerProvider } from "@/contexts/ImanTrackerContext";
import { AchievementCelebrationProvider } from "@/contexts/AchievementCelebrationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if splash screen is already prevented
});

// Global error handler to catch unhandled promise rejections
if (typeof global !== 'undefined' && !__DEV__) {
  const originalUnhandledRejection = global.onunhandledrejection;
  global.onunhandledrejection = (event: any) => {
    console.error('Unhandled promise rejection:', event?.reason || event);
    // Prevent default crash behavior
    if (event) {
      event.preventDefault?.();
    }
    // Still call original handler if it exists
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
}

export const unstable_settings = {
  initialRouteName: "index", // Start at index which checks auth and redirects
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  
  // Load fonts - useFonts hook must be called at top level
  // It returns [loaded, error] tuple
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  
  // Handle font loading errors gracefully
  React.useEffect(() => {
    if (fontError) {
      console.warn('Font loading error (continuing without custom font):', fontError);
    }
  }, [fontError]);
  const splashScreenHidden = useRef(false);

  useEffect(() => {
    if (loaded && !splashScreenHidden.current) {
      splashScreenHidden.current = true;
      SplashScreen.hideAsync().catch((error) => {
        // Ignore errors if splash screen is already hidden or not registered
        if (__DEV__) {
          console.log('Splash screen hide error (ignored):', error.message);
        }
      });
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Continue even if font fails to load - use system fonts as fallback
  // Only wait if font is still loading (not if it errored)
  if (!loaded && !fontError) {
    return null; // Still loading
  }
  // If font errored, continue anyway with system fonts

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)", // System Blue
      background: "rgb(242, 242, 247)", // Light mode background
      card: "rgb(255, 255, 255)", // White cards/surfaces
      text: "rgb(0, 0, 0)", // Black text for light mode
      border: "rgb(216, 216, 220)", // Light gray for separators/borders
      notification: "rgb(255, 59, 48)", // System Red
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)", // System Blue (Dark Mode)
      background: "rgb(1, 1, 1)", // True black background for OLED displays
      card: "rgb(28, 28, 30)", // Dark card/surface color
      text: "rgb(255, 255, 255)", // White text for dark mode
      border: "rgb(44, 44, 46)", // Dark gray for separators/borders
      notification: "rgb(255, 69, 58)", // System Red (Dark Mode)
    },
  };
  return (
    <ErrorBoundary>
      <StatusBar style="auto" animated />
        <ThemeProvider
          value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
        >
          <AuthProvider>
            <AchievementCelebrationProvider>
              <NotificationProvider>
                <ImanTrackerProvider>
                  <WidgetProvider>
                    <GestureHandlerRootView>
                    <Stack>
                    {/* Root index - handles auth routing */}
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    
                    {/* Auth screens */}
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />

                    {/* Main app with tabs - protected */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    </Stack>
                    <SystemBars style={"auto"} />
                    </GestureHandlerRootView>
                  </WidgetProvider>
                </ImanTrackerProvider>
              </NotificationProvider>
            </AchievementCelebrationProvider>
          </AuthProvider>
        </ThemeProvider>
    </ErrorBoundary>
  );
}
