export const MapView = ({ children }) => (
	<div style={{ backgroundColor: "#111", width: "100%", height: "100%" }}>
		{children}
	</div>
);
export const Camera = () => null;
export const UserLocation = () => null;
export const PointAnnotation = () => null;
export const ShapeSource = () => null;
export const VectorSource = () => null;
export const RasterSource = () => null;
export const SymbolLayer = () => null;
export const LineLayer = () => null;
export const FillLayer = () => null;
export const CircleLayer = () => null;
export const RasterLayer = () => null;
export const BackgroundLayer = () => null;
export const Images = () => null;
export const Callout = () => null;

const MapLibre = {
	MapView,
	Camera,
	UserLocation,
	PointAnnotation,
	ShapeSource,
	VectorSource,
	RasterSource,
	SymbolLayer,
	LineLayer,
	FillLayer,
	CircleLayer,
	RasterLayer,
	BackgroundLayer,
	Images,
	Callout,
};

export default MapLibre;
