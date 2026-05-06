const fs = require("node:fs");
const path = require("node:path");

const APP_ROOT = path.resolve(__dirname, "../../..");
const WORKSPACE_ROOT = path.resolve(APP_ROOT, "..", "..");

const PROFILE_STACK_NATIVE = path.join(
	APP_ROOT,
	"src",
	"navigation",
	"ProfileStackNavigator.tsx",
);
const PROFILE_STACK_WEB = path.join(
	APP_ROOT,
	"src",
	"navigation",
	"ProfileStackNavigator.web.tsx",
);
const PROFILE_SCREEN_NATIVE = path.join(
	WORKSPACE_ROOT,
	"packages",
	"profile",
	"src",
	"screens",
	"ProfileScreen.tsx",
);
const PROFILE_SCREEN_WEB = path.join(
	WORKSPACE_ROOT,
	"packages",
	"profile",
	"src",
	"screens",
	"ProfileScreen.web.tsx",
);
const AVATAR_DISPLAY = path.join(
	WORKSPACE_ROOT,
	"packages",
	"profile",
	"src",
	"components",
	"AvatarDisplay.tsx",
);
const FULL_PROFILE_NATIVE = path.join(
	WORKSPACE_ROOT,
	"packages",
	"profile",
	"src",
	"screens",
	"FullProfileScreen.tsx",
);
const FULL_PROFILE_WEB = path.join(
	WORKSPACE_ROOT,
	"packages",
	"profile",
	"src",
	"screens",
	"FullProfileScreen.web.tsx",
);
const MUTE_HUB_SCREEN = path.join(
	WORKSPACE_ROOT,
	"packages",
	"ui",
	"src",
	"screens",
	"profile",
	"MuteHubScreen.tsx",
);

describe("Profile route capabilities", () => {
	it("registers the shared profile capability routes on both native and web stacks", () => {
		const nativeSource = fs.readFileSync(PROFILE_STACK_NATIVE, "utf8");
		const webSource = fs.readFileSync(PROFILE_STACK_WEB, "utf8");

		for (const route of [
			"ProfileMain",
			"FullProfile",
			"AppSettings",
			"PrivacyLedger",
			"PublicProfile",
			"MuteHub",
			"TrubeLab",
		]) {
			expect(nativeSource.includes(`name="${route}"`)).toBe(true);
			expect(webSource.includes(`name="${route}"`)).toBe(true);
		}

		expect(nativeSource.includes("ProfileNavigationProvider")).toBe(true);
		expect(webSource.includes("ProfileNavigationProvider")).toBe(true);
		expect(nativeSource.includes("UserPublicProfileScreen")).toBe(true);
		expect(webSource.includes("UserPublicProfileScreen")).toBe(true);
	});

	it("profile surfaces use the host navigation capability hook instead of hardcoded navigator imports", () => {
		const nativeSource = fs.readFileSync(PROFILE_SCREEN_NATIVE, "utf8");
		const webSource = fs.readFileSync(PROFILE_SCREEN_WEB, "utf8");
		const avatarSource = fs.readFileSync(AVATAR_DISPLAY, "utf8");

		expect(nativeSource.includes("useProfileNavigation")).toBe(true);
		expect(webSource.includes("useProfileNavigation")).toBe(true);
		expect(avatarSource.includes("useProfileNavigation")).toBe(true);

		expect(nativeSource.includes("from '@react-navigation/native'")).toBe(
			false,
		);
		expect(webSource.includes("from '@react-navigation/native'")).toBe(false);
		expect(avatarSource.includes("from '@react-navigation/native'")).toBe(
			false,
		);

		expect(nativeSource.includes("navigation.navigate('AppSettings')")).toBe(
			false,
		);
		expect(nativeSource.includes("navigation.navigate('Auth')")).toBe(false);
		expect(webSource.includes("navigate('FullProfile'")).toBe(false);
		expect(webSource.includes("navigate('AppSettings')")).toBe(false);
		expect(webSource.includes("navigate('PrivacyLedger')")).toBe(false);
		expect(avatarSource.includes("navigate('PublicProfile'")).toBe(false);
	});

	it("full profile screens source social links from the social-links hook and use the hook-owned avatar uploader", () => {
		const nativeSource = fs.readFileSync(FULL_PROFILE_NATIVE, "utf8");
		const webSource = fs.readFileSync(FULL_PROFILE_WEB, "utf8");

		expect(nativeSource.includes("useSocialLinks")).toBe(true);
		expect(webSource.includes("useSocialLinks")).toBe(true);
		expect(nativeSource.includes("links={socialLinks || []}")).toBe(true);
		expect(webSource.includes("links={socialLinks || []}")).toBe(true);
		expect(nativeSource.includes("uploadAvatar(localUri)")).toBe(true);
		expect(webSource.includes("uploadAvatar(localUri)")).toBe(true);
		expect(nativeSource.includes("profile.social_links || []")).toBe(false);
		expect(webSource.includes("profile.social_links || []")).toBe(false);
		expect(webSource.includes("recipientRole=")).toBe(false);
		expect(webSource.includes("recipientTier=")).toBe(true);
	});

	it("ui safety hub does not import profile package components", () => {
		const source = fs.readFileSync(MUTE_HUB_SCREEN, "utf8");

		expect(source.includes("from '@repo/profile'")).toBe(false);
		expect(source.includes("AvatarDisplay")).toBe(false);
		expect(source.includes("UserAvatar")).toBe(true);
	});
});
