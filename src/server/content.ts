export type ChapterSlug = 'towel' | 'oil' | 'steam' | 'water';

export interface Chapter {
  slug: ChapterSlug;
  title: string;
  shortTitle: string;
  summary: string;
  detail: string;
  material: string;
}

export const chapters: Record<ChapterSlug, Chapter> = {
  towel: {
    slug: 'towel',
    title: 'Warmed towel',
    shortTitle: 'Woven warmth',
    summary: 'The treatment begins at fiber scale: clean cotton, held heat, and condensation suspended before release.',
    detail: 'Soft loops and minute droplets make care tangible before the body is touched. The opening establishes warmth as a material condition, not a decorative color.',
    material: 'Cotton · condensation · held warmth',
  },
  oil: {
    slug: 'oil',
    title: 'Botanical oil',
    shortTitle: 'Reflective touch',
    summary: 'A single amber droplet carries the camera from woven surface to naturally textured skin.',
    detail: 'The oil is both treatment material and optical lens. Its controlled movement becomes the interaction model: continuous, weighted, and never hurried.',
    material: 'Botanical oil · skin · amber reflection',
  },
  steam: {
    slug: 'steam',
    title: 'Warm vapor',
    shortTitle: 'Breath and refraction',
    summary: 'Warm vapor opens the frame. Eucalyptus and sandstone appear through shifting layers of humidity.',
    detail: 'The room is revealed indirectly—through vapor, soft refraction, and candlelight. Information arrives the same way: legible, gradual, and without abrupt transitions.',
    material: 'Steam · eucalyptus · sandstone',
  },
  water: {
    slug: 'water',
    title: 'Mineral water',
    shortTitle: 'Descent and return',
    summary: 'The lens enters a still mineral pool, passes beneath drifting caustics, and returns through one expanding ripple.',
    detail: 'The final movement resolves the treatment: immersion without impact, weightlessness without fantasy, then a measured return to the candlelit room.',
    material: 'Mineral water · caustics · expanding ripple',
  },
};

export const chapterList = Object.values(chapters);

export const reconstructionPrompt = `Luxury Spa — “The Exhale”

Single continuous extreme-macro wellness journey beginning between the soft woven fibers of a freshly warmed white towel. Move slowly forward through individual cotton threads carrying tiny beads of condensation, then follow a droplet of botanical oil onto naturally textured skin. Continue uninterrupted along the oil’s reflective surface, rise inside warm steam, and pass through softly illuminated vapor where eucalyptus leaves and smooth sandstone appear through gentle refraction. Descend toward a perfectly still mineral pool, touch the water without splashing, and slip just beneath the surface among drifting light caustics. Rise through one expanding ripple and finish hovering above the calm pool in a candlelit treatment room.

Ultra-realistic wellness cinematography. Physically accurate fabric, oil, skin, steam, and water. Opal, sandstone, mineral teal, and muted botanical palette. Meditative constant camera motion. Seamless one-take continuity. No cuts, transitions, fantasy particles, excessive glow, or synthetic skin.`;
