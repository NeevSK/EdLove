import { ResourceType } from '../types/Library';

export interface ShelfDefinition {
    id: string;
    label: string;
    types: readonly ResourceType[];
}

export const SHELF_DEFS: readonly ShelfDefinition[] = [
    { id: 'movie_trailer', label: '🎬 Inspiring Films', types: ['movie_trailer'] },
    { id: 'map', label: '🗺️ Maps & Visuals', types: ['map', 'infographic'] },
    { id: 'story', label: '📖 Stories', types: ['story'] },
    { id: 'circular', label: '📋 Edu Circulars', types: ['circular'] },
    { id: 'guide', label: '👩‍🏫 Teacher Guides', types: ['guide'] },
    { id: 'tech_guide', label: '💡 Tech Guides', types: ['tech_guide'] },
    { id: 'video', label: '🎥 Videos', types: ['video'] },
    { id: 'doc', label: '📄 Documents', types: ['pdf', 'doc', 'lesson', 'worksheet', 'reading', 'pedagogy'] },
    { id: 'link', label: '🌐 Web Resources', types: ['link'] },
] as const;

export function getOrderedShelfDefs(orientationSeeds: any): readonly ShelfDefinition[] {
    if (!orientationSeeds) return SHELF_DEFS;

    const depthBreadth = orientationSeeds.depth_breadth || 50;
    const soloSocial = orientationSeeds.solo_social || 50;
    const reflectAct = orientationSeeds.reflect_act || 50;

    const priority: Record<string, number> = {
        movie_trailer: soloSocial > 55 ? 10 : 0,
        map: depthBreadth > 55 ? 15 : depthBreadth < 45 ? 5 : 10,
        story: reflectAct < 45 ? 14 : 8,
        circular: 0,
        guide: (depthBreadth < 45 || reflectAct < 45) ? 20 : 10,
        tech_guide: reflectAct > 55 ? 18 : 8,
        video: soloSocial > 55 ? 12 : 6,
        doc: depthBreadth < 45 ? 16 : 8,
        link: depthBreadth > 55 ? 10 : 4,
    };

    return [...SHELF_DEFS].sort((a, b) => (priority[b.id] ?? 0) - (priority[a.id] ?? 0));
}
