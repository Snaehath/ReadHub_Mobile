import React from "react";
import { Redirect } from "expo-router";

// Everyone lands on /home. Home screen handles the guest vs authed UI.
export default function Index() {
  return <Redirect href="/home" />;
}
