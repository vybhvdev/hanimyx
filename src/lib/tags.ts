export const CATEGORIES = {
  HENTAI: "Hentai",
  C3D: "3D",
  COSPLAY: "Cosplay",
  MANGA: "Manga",
};

export const TAG_MAPPINGS: Record<string, string> = {
  // Common mappings
  "school girl": CATEGORIES.HENTAI,
  "schoolgirl": CATEGORIES.HENTAI,
  "3d": CATEGORIES.C3D,
  "cosplay": CATEGORIES.COSPLAY,
  "manga": CATEGORIES.MANGA,
  "uncensored": "Uncensored",
  "censored": "Censored",
};

export function getUnifiedTags(tags: string[]): string[] {
  const unified = new Set<string>();
  
  tags.forEach(tag => {
    const normalized = tag.toLowerCase().trim();
    if (TAG_MAPPINGS[normalized]) {
      unified.add(TAG_MAPPINGS[normalized]);
    } else {
      // Capitalize first letter of each word
      const formatted = normalized.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      unified.add(formatted);
    }
  });

  return Array.from(unified);
}
