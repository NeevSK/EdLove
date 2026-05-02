export const SITE_URL = "https://intuituilabs.edlove.org";
export const SITE_NAME = "Intuitui Labs";
export const SITE_TITLE = "Intuitui Labs | Systems Intelligence";
export const SITE_DESCRIPTION =
	"Intuitui Labs is a systems intelligence and humane innovation studio focused on Sri Lankan workflows, research, sensemaking, and applied technology.";
export const SITE_KEYWORDS = [
	"Intuitui Labs",
	"systems intelligence",
	"humane technology",
	"Sri Lanka",
	"innovation studio",
	"workflow design",
];

export const ORGANIZATION = {
	name: SITE_NAME,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
};

export function absoluteUrl(pathname: string) {
	return new URL(pathname, SITE_URL).toString();
}

export function defaultOgImage(pathname = "/") {
	return absoluteUrl(`/og${pathname === "/" ? "" : pathname}.png`);
}
