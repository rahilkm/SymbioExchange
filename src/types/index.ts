/**
 * Core Type Definitions for Managed Industrial Resource Exchange Platform
 */

export type Role = 'BUYER' | 'SELLER' | 'LOGISTICS' | 'DONOR' | 'DONEE' | 'ADMIN';

export type ListingStatus = 'AVAILABLE' | 'OPEN' | 'MATCHED' | 'FULFILLED' | 'DEACTIVATED';

export type MatchStatus = 'PROPOSED' | 'ACCEPTED' | 'CANCELLED';

export type PickupStatus = 'PENDING' | 'SCHEDULED' | 'PICKED_UP';

export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  organization: string;
  phone?: string;
  createdAt: string;
}

export interface Resource {
  id: number;
  sellerId?: number;
  sellerOrg?: string;
  donorId?: number;
  donorOrg?: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string; // e.g. "units", "tons", "kg"
  materialState: 'solid' | 'liquid' | 'gas' | 'composite';
  materialCost: number; // Price per unit in INR
  availableFrom: string; // ISO date
  pickupAddress: string; // Raw physical address (CONFIDENTIAL)
  hubZone: string; // Privacy-safe hub name e.g. "Bhiwandi Hub, Mumbai Region"
  status: ListingStatus;
  description?: string;
  createdAt: string;
}

export interface Requirement {
  id: number;
  buyerId?: number;
  buyerOrg?: string;
  doneeId?: number;
  doneeOrg?: string;
  materialName: string;
  category: string;
  requiredQuantity: number;
  unit: string;
  acceptableState: string; // e.g. "solid", "liquid", "any"
  maxPrice: number; // Ceiling price per unit in INR
  requiredBy: string; // ISO date deadline
  deliveryAddress: string; // Raw physical address (CONFIDENTIAL)
  hubZone: string; // Privacy-safe hub name e.g. "Pune Zone"
  status: ListingStatus;
  notes?: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  materialScore: number; // 0-100 (weight: 35%)
  quantityScore: number; // 0-100 (weight: 20%)
  economicScore: number; // 0-100 (weight: 20%)
  distanceScore: number; // 0-100 (weight: 15%)
  timeScore: number;     // 0-100 (weight: 10%)
  totalScore: number;    // Weighted composite 0-100
  distanceKm: number;
  unitLogisticsCost: number;
  totalLogisticsCost: number;
  materialTotalCost: number;
  totalCombinedCost: number;
  carrierName: string;
  estimatedDelivery: string;
  isEligible: boolean;
  filterReason?: string;
}

export interface Match {
  id: number;
  resourceId: number;
  requirementId: number;
  compatibilityScore: number;
  scoreBreakdown: ScoreBreakdown;
  logisticsCost: number;
  estimatedDelivery: string;
  status: MatchStatus;
  createdAt: string;
  acceptedAt?: string;
  // Denormalized or joined references
  resource?: Resource;
  requirement?: Requirement;
  shipment?: Shipment;
}

export interface MockLogisticsPartner {
  id: number;
  name: string;
  serviceArea: string;
  vehicleTypes: string[];
  basePrice: number; // Base fee in INR
  perKmPrice: number; // Rate per KM in INR
  contactPhone: string;
  rating: number;
}

export interface ShipmentMilestoneLog {
  timestamp: string;
  status: string;
  location: string;
  notes: string;
  updatedBy: string;
}

export interface Shipment {
  id: number;
  matchId: number;
  logisticsPartnerId: number;
  logisticsPartnerName: string;
  pickupStatus: PickupStatus;
  deliveryStatus: DeliveryStatus;
  trackingStatus: string;
  assignedVehicle: string;
  estimatedArrival: string;
  currentMilestone: 'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  originHub: string;
  destinationHub: string;
  sellerOrg?: string;
  buyerOrg?: string;
  materialName?: string;
  quantity?: number;
  unit?: string;
  // Confidential address fields - viewable by LOGISTICS
  exactPickupAddress?: string;
  exactDeliveryAddress?: string;
  sellerContactPhone?: string;
  buyerContactPhone?: string;
  donorContactPhone?: string;
  doneeContactPhone?: string;
  milestones: ShipmentMilestoneLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  matchId: number;
  resourceAmount: number;
  logisticsAmount: number;
  platformFee: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED';
  payerId: number;
  receiverId: number;
  createdAt: string;
}

export interface HubLocation {
  name: string;
  region: string;
  lat: number;
  lng: number;
  aliases: string[];
}
