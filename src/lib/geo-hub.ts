import { HubLocation } from '../types';

/**
 * Standard Industrial Logistics Hub Registry
 */
export const INDUSTRIAL_HUBS: HubLocation[] = [
  {
    name: 'Bhiwandi Hub, Mumbai Region',
    region: 'Mumbai Region',
    lat: 19.2967,
    lng: 73.0631,
    aliases: ['bhiwandi', 'thane', 'kalyan', 'dombivli', 'mumbai north']
  },
  {
    name: 'Andheri Hub, Mumbai',
    region: 'Mumbai Region',
    lat: 19.1136,
    lng: 72.8697,
    aliases: ['andheri', 'bandra', 'kurla', 'mumbai central', 'mumbai']
  },
  {
    name: 'Navi Mumbai Taloja Hub',
    region: 'Mumbai Region',
    lat: 19.0620,
    lng: 73.1118,
    aliases: ['taloja', 'navi mumbai', 'vashi', 'panvel', 'rabale']
  },
  {
    name: 'Pune Bhosari Industrial Hub',
    region: 'Pune Region',
    lat: 18.6298,
    lng: 73.8475,
    aliases: ['pune', 'bhosari', 'pimpri', 'chinchwad', 'hadapsar', 'hinjewadi']
  },
  {
    name: 'Chakan Industrial Hub, Pune',
    region: 'Pune Region',
    lat: 18.7606,
    lng: 73.8567,
    aliases: ['chakan', 'talegaon', 'khed']
  },
  {
    name: 'Nashik MIDC Hub',
    region: 'North Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
    aliases: ['nashik', 'ambat', 'satpur', 'sinnar']
  },
  {
    name: 'Aurangabad Waluj Hub',
    region: 'Marathwada',
    lat: 19.8394,
    lng: 75.2505,
    aliases: ['aurangabad', 'waluj', 'chikalthana', 'chhatrapati sambhajinagar']
  },
  {
    name: 'Nagpur Butibori Central Hub',
    region: 'Vidarbha',
    lat: 20.9167,
    lng: 78.9950,
    aliases: ['nagpur', 'butibori', 'hingna', 'wardha']
  }
];

/**
 * Extracts a privacy-preserving Hub Zone from a raw street address.
 * E.g. "Plot 45, Bhiwandi Industrial Area, Mumbai 421302" -> "Bhiwandi Hub, Mumbai Region"
 */
export function extractHubZone(address: string): string {
  if (!address || typeof address !== 'string') {
    return 'Western Industrial Hub';
  }

  const normalized = address.toLowerCase();

  for (const hub of INDUSTRIAL_HUBS) {
    for (const alias of hub.aliases) {
      if (normalized.includes(alias)) {
        return hub.name;
      }
    }
  }

  // Fallback pattern matching
  if (normalized.includes('mumbai') || normalized.includes('bombay')) {
    return 'Bhiwandi Hub, Mumbai Region';
  }
  if (normalized.includes('pune') || normalized.includes('poona')) {
    return 'Pune Bhosari Industrial Hub';
  }
  if (normalized.includes('nashik') || normalized.includes('nasik')) {
    return 'Nashik MIDC Hub';
  }
  if (normalized.includes('nagpur')) {
    return 'Nagpur Butibori Central Hub';
  }

  return 'Western Regional Hub';
}

/**
 * Returns hub location object by name or fallback
 */
export function getHubLocation(hubName: string): HubLocation {
  const found = INDUSTRIAL_HUBS.find(h => h.name.toLowerCase() === hubName.toLowerCase());
  if (found) return found;

  const normalized = hubName.toLowerCase();
  for (const hub of INDUSTRIAL_HUBS) {
    if (hub.aliases.some(a => normalized.includes(a))) {
      return hub;
    }
  }

  return INDUSTRIAL_HUBS[0]; // Default to Bhiwandi
}

/**
 * Calculate distance in km between two coordinate points using Haversine formula
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Road factor adjustment (approx 1.25x straight line road routing)
  return Math.round(distance * 1.25);
}

/**
 * Computes road distance in kilometers between two hub zones.
 * Specifically handles the canonical Mumbai -> Pune route (~150 km)
 */
export function getDistanceBetweenHubs(originHub: string, destinationHub: string): number {
  const origin = getHubLocation(originHub);
  const dest = getHubLocation(destinationHub);

  // Exact known corridors from PRD specifications
  const oName = origin.name.toLowerCase();
  const dName = dest.name.toLowerCase();

  const isMumbaiOrigin = oName.includes('bhiwandi') || oName.includes('andheri') || oName.includes('mumbai');
  const isPuneDest = dName.includes('pune') || dName.includes('bhosari') || dName.includes('chakan');

  if (isMumbaiOrigin && isPuneDest) {
    return 150; // Canonical PRD distance for Mumbai-Pune corridor
  }
  if (isPuneDest && isMumbaiOrigin) {
    return 150;
  }

  // Same region / intra-city
  if (origin.region === dest.region) {
    return 35; // Intra-metro distance
  }

  // Haversine calculation with road winding factor
  const calculated = calculateHaversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  return Math.max(25, calculated);
}
