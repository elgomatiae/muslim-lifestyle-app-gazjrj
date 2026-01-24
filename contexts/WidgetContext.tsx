import * as React from "react";
import { createContext, useCallback, useContext } from "react";

// Safely import ExtensionStorage - it may not be available in all builds
let ExtensionStorage: any = null;
try {
  ExtensionStorage = require("@bacons/apple-targets").ExtensionStorage;
} catch (error) {
  // ExtensionStorage not available - widgets won't work but app won't crash
  if (__DEV__) {
    console.warn('ExtensionStorage not available:', error);
  }
}

// Initialize storage with your group ID - only if available
let storage: any = null;
if (ExtensionStorage) {
  try {
    storage = new ExtensionStorage(
      "group.com.<user_name>.<app_name>"
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to initialize ExtensionStorage:', error);
    }
  }
}

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    if (!ExtensionStorage) {
      return; // Widgets not available
    }
    
    try {
      // set widget_state to null if we want to reset the widget
      // storage.set("widget_state", null);

      // Refresh widget
      ExtensionStorage.reloadWidget();
    } catch (error) {
      if (__DEV__) {
        console.warn('Error reloading widget:', error);
      }
    }
  }, []);

  const refreshWidget = useCallback(() => {
    if (!ExtensionStorage) {
      return; // Widgets not available
    }
    try {
      ExtensionStorage.reloadWidget();
    } catch (error) {
      if (__DEV__) {
        console.warn('Error refreshing widget:', error);
      }
    }
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
