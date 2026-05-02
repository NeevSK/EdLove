import "./src/shims/node-globals-shim";
import "react-native-reanimated";
import "react-native-worklets";
import "react-native-get-random-values";
import "../../packages/ui/src/global.css";
import { bootstrapPlatform } from "@repo/core/native";
import { registerRootComponent } from "expo";
import App from "./App";

// Initialize platform adapters
bootstrapPlatform().then(() => {
	registerRootComponent(App);
});
