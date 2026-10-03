import { MockLogisticsPartner } from '../types';
import { getDistanceBetweenHubs } from './geo-hub';

export const MOCK_CARRIERS: MockLogisticsPartner[] = [
  {
    id: 1,
    name: 'Mumbai Local Logistics',
    serviceArea: 'Mumbai Region',
    vehicleTypes: ['SmallTruck', 'Pickup1Ton'],
    basePrice: 800,
    perKmPrice: 25,
    contactPhone: '+91 22 2589 1100',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Mum-Pune Express Freight',
    serviceArea: 'Mumbai-Pune Corridor',
    vehicleTypes: ['1-Ton Truck', 'Container10Ton', 'FlatbedTruck'],
    basePrice: 2000,
    perKmPrice: 30,
    contactPhone: '+91 20 2712 4433',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Intercity Rapid Haulage',
    serviceArea: 'Maharashtra State',
    vehicleTypes: ['HeavyTrailer', 'Container10Ton'],
    basePrice: 4000,
    perKmPrice: 35,
    contactPhone: '+91 71 2244 8899',
    rating: 4.7
  }
];

export interface LogisticsEstimateResult {
  carrier: MockLogisticsPartner;
  distanceKm: number;
  freightCost: number;
  estimatedDelivery: string;
  suggestedVehicle: string;
}

/**
 * Select the optimal carrier based on corridor and distance
 */
export function selectCarrierForRoute(originHub: string, destinationHub: string, distanceKm: number): MockLogisticsPartner {
  const o = originHub.toLowerCase();
  const d = destinationHub.toLowerCase();

  const isMumbaiOrigin = o.includes('bhiwandi') || o.includes('andheri') || o.includes('mumbai');
  const isPuneDest = d.includes('pune') || d.includes('bhosari') || d.includes('chakan');
  const isMumbaiDest = d.includes('bhiwandi') || d.includes('andheri') || d.includes('mumbai');
  const isPuneOrigin = o.includes('pune') || o.includes('bhosari') || o.includes('chakan');

  // Mumbai-Pune corridor explicitly selects carrier #2
  if ((isMumbaiOrigin && isPuneDest) || (isPuneOrigin && isMumbaiDest)) {
    return MOCK_CARRIERS[1]; // Mum-Pune Express Freight
  }

  // Local / same metro
  if (distanceKm <= 60) {
    return MOCK_CARRIERS[0]; // Mumbai Local Logistics
  }

  // Long distance / intercity
  if (distanceKm > 200) {
    return MOCK_CARRIERS[2]; // Intercity Rapid Haulage
  }

  return MOCK_CARRIERS[1];
}

/**
 * Calculates freight cost using: Total Logistics Cost = basePrice + (perKmPrice * distance)
 * and determines ETA based on zone rules.
 */
export function calculateLogisticsCost(
  originHub: string,
  destinationHub: string
): LogisticsEstimateResult {
  const distanceKm = getDistanceBetweenHubs(originHub, destinationHub);
  const carrier = selectCarrierForRoute(originHub, destinationHub, distanceKm);

  // Exact formula from PRD: Cost = basePrice + perKmPrice * distance
  const freightCost = carrier.basePrice + carrier.perKmPrice * distanceKm;

  // ETA formula from PRD:
  // <= 60km (Same Metro): "Same day or next day"
  // > 60km (Inter-city): "1–2 business days"
  const estimatedDelivery = distanceKm <= 60 ? 'Same day or next day' : '1–2 business days';

  // Vehicle recommendation
  let suggestedVehicle = carrier.vehicleTypes[0];
  if (distanceKm > 60 && carrier.vehicleTypes.includes('1-Ton Truck')) {
    suggestedVehicle = '1-Ton Truck';
  }

  return {
    carrier,
    distanceKm,
    freightCost,
    estimatedDelivery,
    suggestedVehicle
  };
}
