import { getCollection } from "astro:content";
import {
	absoluteUrl,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from "../lib/site";

const cleanId = (id: string) => id.replace(/\.(md|mdx)$/i, "");

export async function GET() {
	const [archiveEntries, flameEntries, projectEntries] = await Promise.all([
		getCollection("archive", ({ data }) => !data.draft),
		getCollection("hall-of-flame", ({ data }) => !data.draft),
		getCollection("projects", ({ data }) => !data.draft),
	]);

	const entries = [
		{
			id: "home",
			collection: "page",
			slug: "home",
			title: "Home",
			subtitle: "Existential Cyberneticist",
			category: "page",
			tags: [],
			url: absoluteUrl("/"),
		},
		{
			id: "archive",
			collection: "page",
			slug: "archive",
			title: "Archive",
			subtitle: "Digital archive of epistemic artifacts",
			category: "page",
			tags: [],
			url: absoluteUrl("/archive"),
		},
		{
			id: "projects",
			collection: "page",
			slug: "projects",
			title: "Projects",
			subtitle: "Selected works and systems",
			category: "page",
			tags: [],
			url: absoluteUrl("/projects"),
		},
		...archiveEntries.map((entry) => ({
			id: `archive:${cleanId(entry.id)}`,
			collection: "archive",
			slug: cleanId(entry.id),
			title: entry.data.title,
			subtitle: entry.data.subtitle ?? null,
			category: "article",
			tags: entry.data.tags ?? [],
			url: absoluteUrl(`/archive/${cleanId(entry.id)}`),
		})),
		...projectEntries.map((entry) => ({
			id: `projects:${cleanId(entry.id)}`,
			collection: "projects",
			slug: cleanId(entry.id),
			title: entry.data.title,
			subtitle: entry.data.role,
			category: "project",
			tags: entry.data.tech ?? [],
			url: absoluteUrl("/projects"),
		})),
		...flameEntries.map((entry) => ({
			id: `hall-of-flame:${cleanId(entry.id)}`,
			collection: "hall-of-flame",
			slug: cleanId(entry.id),
			title: entry.data.name,
			subtitle: entry.data.subtitle,
			category: entry.data.chamber,
			tags: [],
			url: absoluteUrl("/hall-of-flame"),
		})),
	];

	return new Response(
		JSON.stringify(
			{
				site: {
					name: SITE_NAME,
					url: SITE_URL,
					description: SITE_DESCRIPTION,
				},
				generatedAt: new Date().toISOString(),
				entries,
			},
			null,
			2,
		),
		{
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		},
	);
}
