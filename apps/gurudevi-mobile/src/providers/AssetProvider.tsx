import * as Font from "expo-font";
import type React from "react";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { fontAssets } from "../constants/Fonts";

interface AssetContextType {
	fontsLoaded: boolean;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		async function loadFonts() {
			try {
				await Font.loadAsync(fontAssets);
				setFontsLoaded(true);
			} catch (error) {
				console.warn("\u26A0\uFE0F AssetProvider: Font loading failed", error);
				setFontsLoaded(true); // Proceed anyway to avoid blocking the app
			}
		}
		loadFonts();
	}, []);

	return (
		<AssetContext.Provider value={{ fontsLoaded }}>
			{children}
		</AssetContext.Provider>
	);
};

export const useAssets = () => {
	const context = useContext(AssetContext);
	if (context === undefined) {
		throw new Error("useAssets must be used within an AssetProvider");
	}
	return context;
};
