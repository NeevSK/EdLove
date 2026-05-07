declare module "react-native-view-shot" {
	export function captureRef(
		target: unknown,
		options?: {
			format?: "png" | "jpg" | "webm";
			quality?: number;
			width?: number;
			height?: number;
			result?: "tmpfile" | "base64" | "data-uri" | "zip-base64";
		},
	): Promise<string>;
}
