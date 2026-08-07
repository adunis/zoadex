import { Region } from '../types/region';
import { Species, SpeciesCategory } from '../types/species';
import { Sighting, Expedition } from '../types/sighting';
import { HeatmapPoint, SightingPin } from '../types/map';
import { Suggestion } from '../types/suggestion';
import { UserBadge, Badge, BadgeTier, AchievementProgress } from '../types/badge';
import { User } from '../types/user';

const EMILIA_ROMAGNA_CENTER = { lat: 44.5, lon: 11.3 };

export const mockUser: User = {
  id: 'mock-user-1',
  username: 'NatureExplorer',
  email: 'explorer@zoadex.app',
  plan: 'FREE',
  activeRegionId: 'region-1',
  activeRegionName: 'Emilia-Romagna',
  totalSightings: 23,
  uniqueSpeciesDiscovered: 15,
  createdAt: '2026-06-01T10:00:00Z',
};

export const mockRegions: Region[] = [
  { id: 'region-1', name: 'Emilia-Romagna', country: 'Italy', centerLatitude: 44.5, centerLongitude: 11.3, totalSpecies: 494 },
  { id: 'region-2', name: 'Tuscany', country: 'Italy', centerLatitude: 43.4, centerLongitude: 11.2, totalSpecies: 520 },
  { id: 'region-3', name: 'Lombardy', country: 'Italy', centerLatitude: 45.5, centerLongitude: 9.9, totalSpecies: 430 },
  { id: 'region-4', name: 'Bavaria', country: 'Germany', centerLatitude: 48.8, centerLongitude: 11.5, totalSpecies: 380 },
];

export const mockSpecies: Species[] = [
  { id: 'sp-1', commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: SpeciesCategory.MAMMALS, description: 'A medium-sized omnivorous mammal with reddish fur.', habitat: 'Forests, grasslands, urban areas', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-15', thumbnailUrl: '' },
  { id: 'sp-2', commonName: 'European Robin', scientificName: 'Erithacus rubecula', category: SpeciesCategory.BIRDS, description: 'Small insectivorous bird with a distinctive red breast.', habitat: 'Woodlands, gardens, hedgerows', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-08-01', thumbnailUrl: '' },
  { id: 'sp-3', commonName: 'Common Frog', scientificName: 'Rana temporaria', category: SpeciesCategory.AMPHIBIANS, description: 'Widespread amphibian found in moist environments.', habitat: 'Ponds, marshes, damp meadows', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-08-02', thumbnailUrl: '' },
  { id: 'sp-4', commonName: 'Porcini Mushroom', scientificName: 'Boletus edulis', category: SpeciesCategory.MUSHROOMS, description: 'Highly prized edible mushroom.', habitat: 'Deciduous and coniferous forests', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-28', thumbnailUrl: '' },
  { id: 'sp-5', commonName: 'Brown Hare', scientificName: 'Lepus europaeus', category: SpeciesCategory.MAMMALS, description: 'Large hare native to Europe.', habitat: 'Open fields, farmland', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-6', commonName: 'Hoopoe', scientificName: 'Upupa epops', category: SpeciesCategory.BIRDS, description: 'Colorful bird with a distinctive crown of feathers.', habitat: 'Open grasslands, orchards', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-7', commonName: 'Grass Snake', scientificName: 'Natrix natrix', category: SpeciesCategory.REPTILES, description: 'Non-venomous snake, often found near water.', habitat: 'Wetlands, meadows, gardens', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-20', thumbnailUrl: '' },
  { id: 'sp-8', commonName: 'Wild Oregano', scientificName: 'Origanum vulgare', category: SpeciesCategory.PLANTS, description: 'Aromatic herb native to Mediterranean.', habitat: 'Dry hillsides, meadows', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-08-03', thumbnailUrl: '' },
  { id: 'sp-9', commonName: 'Stone Pine', scientificName: 'Pinus pinea', category: SpeciesCategory.TREES, description: 'Evergreen conifer with an umbrella-shaped crown.', habitat: 'Coastal areas, sandy soils', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-08-01', thumbnailUrl: '' },
  { id: 'sp-10', commonName: 'Chanterelle', scientificName: 'Cantharellus cibarius', category: SpeciesCategory.MUSHROOMS, description: 'Golden funnel-shaped edible mushroom.', habitat: 'Mixed forests, mossy areas', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-20', thumbnailUrl: '' },
  { id: 'sp-11', commonName: 'European Hedgehog', scientificName: 'Erinaceus europaeus', category: SpeciesCategory.MAMMALS, description: 'Nocturnal insectivore covered in spines.', habitat: 'Gardens, hedgerows, parks', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-12', commonName: 'Fire Salamander', scientificName: 'Salamandra salamandra', category: SpeciesCategory.AMPHIBIANS, description: 'Black salamander with bright yellow markings.', habitat: 'Damp deciduous forests', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-13', commonName: 'Common Poppy', scientificName: 'Papaver rhoeas', category: SpeciesCategory.PLANTS, description: 'Bright red wildflower.', habitat: 'Fields, roadsides, disturbed ground', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-29', thumbnailUrl: '' },
  { id: 'sp-14', commonName: 'Italian Wall Lizard', scientificName: 'Podarcis siculus', category: SpeciesCategory.REPTILES, description: 'Common agile lizard found on walls and rocks.', habitat: 'Rocky areas, walls, urban structures', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-15', commonName: 'Fly Agaric', scientificName: 'Amanita muscaria', category: SpeciesCategory.MUSHROOMS, description: 'Iconic red-capped poisonous mushroom.', habitat: 'Birch and pine forests', images: [], regionId: 'region-1', discovered: true, discoveredAt: '2026-07-15', thumbnailUrl: '' },
  { id: 'sp-16', commonName: 'Wild Boar', scientificName: 'Sus scrofa', category: SpeciesCategory.MAMMALS, description: 'Large omnivorous mammal common in forests.', habitat: 'Deciduous forests, scrubland', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-17', commonName: 'Roe Deer', scientificName: 'Capreolus capreolus', category: SpeciesCategory.MAMMALS, description: 'Small, elegant deer with reddish summer coat.', habitat: 'Woodland edges, meadows', images: [], regionId: 'region-1', discovered: false },
  { id: 'sp-18', commonName: 'Common Blackbird', scientificName: 'Turdus merula', category: SpeciesCategory.BIRDS, description: 'Medium-sized thrush with melodious song.', habitat: 'Gardens, parks, woodlands', images: [], regionId: 'region-1', discovered: false },
];

export const mockSightings: Sighting[] = [
  { id: 'sig-1', speciesId: 'sp-1', speciesName: 'Red Fox', speciesCategory: SpeciesCategory.MAMMALS, userId: 'mock-user-1', latitude: 44.52, longitude: 11.32, dateTime: '2026-08-03T14:30:00Z', notes: 'Spotted near the river at dusk', verified: true, createdAt: '2026-08-03T14:30:00Z' },
  { id: 'sig-2', speciesId: 'sp-2', speciesName: 'European Robin', speciesCategory: SpeciesCategory.BIRDS, userId: 'mock-user-1', latitude: 44.48, longitude: 11.28, dateTime: '2026-08-02T09:15:00Z', notes: 'Singing from an olive tree', verified: true, createdAt: '2026-08-02T09:15:00Z' },
  { id: 'sig-3', speciesId: 'sp-3', speciesName: 'Common Frog', speciesCategory: SpeciesCategory.AMPHIBIANS, userId: 'mock-user-1', latitude: 44.55, longitude: 11.35, dateTime: '2026-08-01T18:45:00Z', notes: 'Found near a small pond', verified: true, createdAt: '2026-08-01T18:45:00Z' },
  { id: 'sig-4', speciesId: 'sp-4', speciesName: 'Porcini Mushroom', speciesCategory: SpeciesCategory.MUSHROOMS, userId: 'mock-user-1', latitude: 44.42, longitude: 11.22, dateTime: '2026-07-28T10:00:00Z', notes: 'Growing under chestnut trees', verified: true, createdAt: '2026-07-28T10:00:00Z' },
  { id: 'sig-5', speciesId: 'sp-7', speciesName: 'Grass Snake', speciesCategory: SpeciesCategory.REPTILES, userId: 'mock-user-1', latitude: 44.50, longitude: 11.30, dateTime: '2026-07-20T16:00:00Z', notes: 'Near the lake shore', verified: true, createdAt: '2026-07-20T16:00:00Z' },
  { id: 'sig-6', speciesId: 'sp-8', speciesName: 'Wild Oregano', speciesCategory: SpeciesCategory.PLANTS, userId: 'mock-user-1', latitude: 44.53, longitude: 11.25, dateTime: '2026-08-03T11:00:00Z', notes: 'In bloom on the hillside', verified: true, createdAt: '2026-08-03T11:00:00Z' },
];

export const mockSightingPins: SightingPin[] = mockSightings.map((s) => ({
  id: s.id,
  speciesName: s.speciesName,
  latitude: s.latitude,
  longitude: s.longitude,
  dateTime: s.dateTime,
  category: s.speciesCategory,
  notes: s.notes,
}));

function generateHeatmapPoints(): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const rng = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 60; i++) {
    points.push({
      latitude: EMILIA_ROMAGNA_CENTER.lat + (rng(i * 3) - 0.5) * 1.2,
      longitude: EMILIA_ROMAGNA_CENTER.lon + (rng(i * 7 + 1) - 0.5) * 1.5,
      intensity: rng(i * 11 + 2) * 0.8 + 0.2,
    });
  }
  return points;
}

export const mockHeatmapPoints: HeatmapPoint[] = generateHeatmapPoints();

export const mockSuggestions: Suggestion[] = [
  { speciesId: 'sp-11', commonName: 'European Hedgehog', scientificName: 'Erinaceus europaeus', category: SpeciesCategory.MAMMALS, confidence: 0.87, reasons: ['Common in area', 'Active at this time', 'Seen by others nearby'] },
  { speciesId: 'sp-18', commonName: 'Common Blackbird', scientificName: 'Turdus merula', category: SpeciesCategory.BIRDS, confidence: 0.82, reasons: ['In season', 'Common in area'] },
  { speciesId: 'sp-6', commonName: 'Hoopoe', scientificName: 'Upupa epops', category: SpeciesCategory.BIRDS, confidence: 0.68, reasons: ['Summer visitor', 'Nesting season'] },
  { speciesId: 'sp-12', commonName: 'Fire Salamander', scientificName: 'Salamandra salamandra', category: SpeciesCategory.AMPHIBIANS, confidence: 0.55, reasons: ['Damp weather expected', 'Known habitat nearby'] },
  { speciesId: 'sp-16', commonName: 'Wild Boar', scientificName: 'Sus scrofa', category: SpeciesCategory.MAMMALS, confidence: 0.45, reasons: ['Active at dusk', 'Forested area'] },
];

export const mockBadges: Badge[] = [
  { id: 'b-1', name: 'First Steps', description: 'Log your first sighting', iconUrl: '', tier: BadgeTier.BRONZE, requirement: 1 },
  { id: 'b-2', name: 'Bird Watcher Bronze', description: 'Discover 5 bird species', iconUrl: '', tier: BadgeTier.BRONZE, category: 'BIRDS', requirement: 5 },
  { id: 'b-3', name: 'Bird Watcher Gold', description: 'Discover 25 bird species', iconUrl: '', tier: BadgeTier.GOLD, category: 'BIRDS', requirement: 25 },
  { id: 'b-4', name: 'Explorer', description: 'Log sightings in 10 different locations', iconUrl: '', tier: BadgeTier.SILVER, requirement: 10 },
  { id: 'b-5', name: 'Shutterbug', description: 'Log 10 sightings with photos', iconUrl: '', tier: BadgeTier.BRONZE, requirement: 10 },
  { id: 'b-6', name: 'Week Warrior', description: 'Log sightings 7 days in a row', iconUrl: '', tier: BadgeTier.SILVER, requirement: 7 },
  { id: 'b-7', name: 'Robin Regular', description: 'Log 5 European Robin sightings', iconUrl: '', tier: BadgeTier.BRONZE, requirement: 5 },
];

export const mockMyBadges: UserBadge[] = [
  { badge: mockBadges[0], earnedAt: '2026-07-15T10:00:00Z', progress: 100 },
  { badge: mockBadges[1], earnedAt: '2026-08-01T14:00:00Z', progress: 100 },
];

export const mockBadgeProgress: AchievementProgress[] = [
  { badgeId: 'b-3', badgeName: 'Bird Watcher Gold', currentCount: 5, requiredCount: 25, tier: BadgeTier.BRONZE, nextTier: BadgeTier.GOLD, percentage: 20 },
  { badgeId: 'b-4', badgeName: 'Explorer', currentCount: 4, requiredCount: 10, tier: BadgeTier.BRONZE, nextTier: BadgeTier.SILVER, percentage: 40 },
  { badgeId: 'b-5', badgeName: 'Shutterbug', currentCount: 2, requiredCount: 10, tier: BadgeTier.BRONZE, nextTier: BadgeTier.SILVER, percentage: 20 },
];

export const mockExpedition: Expedition = {
  id: 'exp-1',
  userId: 'mock-user-1',
  name: 'Morning Bird Walk',
  startedAt: '2026-08-04T07:30:00Z',
  active: true,
  sightings: [mockSightings[1]],
  sightingCount: 1,
  regionId: 'region-1',
};
