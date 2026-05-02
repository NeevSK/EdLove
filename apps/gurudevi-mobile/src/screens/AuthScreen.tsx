import { ScannerModal } from "@repo/scanner-kit";
import UIAuthScreen from "@repo/ui/screens/AuthScreen";

/**
 * High-End "Assembled" Screen
 *
 * This screen acts as the "Glue" between the UI package and the Scanner package.
 * By assembling it here, we keep the packages clean and avoid circular dependencies.
 */
export default function AuthScreen(props: Record<string, unknown>) {
	return <UIAuthScreen {...props} Scanner={ScannerModal} />;
}
