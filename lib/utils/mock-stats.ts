/**
 * Generates a pseudo-random integer based on a string ID.
 * This ensures that the same listing ID always gets the same "random" default values.
 */
function seededRandom(id: string, min: number, max: number): number {
  if (!id) return min;
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use Math.sin to get a deterministic pseudo-random float between 0 and 1
  const random = Math.abs(Math.sin(hash));
  return Math.floor(random * (max - min + 1)) + min;
}

/**
 * Returns deterministic default base stats for a given listing ID.
 */
export function getBaseStats(id: string) {
  // Base likes: between 15 and 250
  const baseLikes = seededRandom(id + "likes", 15, 250);
  
  // Base views: between 500 and 3500
  const baseViews = seededRandom(id + "views", 500, 3500);
  
  // Base reviews: between 5 and 45
  const baseReviews = seededRandom(id + "reviews", 5, 45);
  
  return { baseLikes, baseViews, baseReviews };
}

/**
 * Helper to get the total stat (actual + base)
 */
export function getTotalStat(id: string, actualStat: number | undefined, statType: 'likes' | 'views' | 'reviews'): number {
  const baseStats = getBaseStats(id);
  const actual = actualStat || 0;
  
  switch(statType) {
    case 'likes': return actual + baseStats.baseLikes;
    case 'views': return actual + baseStats.baseViews;
    case 'reviews': return actual + baseStats.baseReviews;
    default: return actual;
  }
}
