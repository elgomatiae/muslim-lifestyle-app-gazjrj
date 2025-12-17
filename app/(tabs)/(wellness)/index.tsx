
import React from "react";
import { Redirect } from "expo-router";

export default function WellnessScreen() {
  // Redirect directly to the mental health hub
  return <Redirect href="/mental-health" />;
}
