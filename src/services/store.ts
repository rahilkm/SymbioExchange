import {
  User,
  Resource,
  Requirement,
  Match,
  Shipment,
  Transaction,
  Role,
  ListingStatus
} from '../types';
import { api } from './api';
import { extractHubZone } from '../lib/geo-hub';
import { calculateLogisticsCost, MOCK_CARRIERS } from '../lib/logistics-engine';
import { computeMatchScore } from '../lib/matching-engine';
import { sanitizeShipmentForUser } from '../lib/privacy-serializer';

export const INITIAL_USERS: User[] = [
  {
    id: 101,
    name: 'Vikram Mehta',
    email: 'seller@companya.com',
    role: 'SELLER',
    organization: 'Company A Electronics & Industrial Surplus',
    phone: '+91 98201 12345',
    createdAt: new Date().toISOString()
  },
  {
    id: 201,
    name: 'Dr. Ananya Joshi',
    email: 'buyer@xyzschool.edu',
    role: 'BUYER',
    organization: 'XYZ Foundation & STEM Academy',
    phone: '+91 98202 54321',
    createdAt: new Date().toISOString()
  },
  {
    id: 301,
    name: 'Rajesh Shinde',
    email: 'dispatch@mumpune-express.com',
    role: 'LOGISTICS',
    organization: 'Mum-Pune Express Freight',
    phone: '+91 20 2712 4433',
    createdAt: new Date().toISOString()
  }
];

class StoreService {
  private users: User[] = [...INITIAL_USERS];
  private resources: Resource[] = [];
  private requirements: Requirement[] = [];
  private shipments: Shipment[] = [];
  private currentUserId: number = 201;
  private listeners: (() => void)[] = [];
  private initialized: boolean = false;

  constructor() {
    this.initSync();
  }

  private async initSync() {
    try {
      await this.fetchAll();
      this.initialized = true;

      // Subscribe to backend Server-Sent Events (SSE) for instantaneous multi-party sync
      api.onEvent((event) => {
        // When any party creates a resource, requirement, match, or shipment:
        this.fetchAll().then(() => {
          this.notify();
        });
      });
    } catch {
      // If backend is still initializing, schedule retry
      setTimeout(() => this.initSync(), 1500);
    }
  }

  public async fetchAll() {
    try {
      const [usersData, resourcesData, requirementsData, shipmentsData] = await Promise.all([
        api.getUsers().catch(() => ({ users: INITIAL_USERS, activeUser: INITIAL_USERS[1] })),
        api.getResources('ADMIN').catch(() => []),
        api.getRequirements('ADMIN').catch(() => []),
        api.getShipments('LOGISTICS').catch(() => [])
      ]);

      if (usersData && usersData.users && usersData.users.length > 0) {
        this.users = usersData.users;
      }
      this.resources = resourcesData || [];
      this.requirements = requirementsData || [];
      this.shipments = shipmentsData || [];
      this.notify();
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public async resetToDefault() {
    try {
      await api.resetDatabase();
      await this.fetchAll();
    } catch {
      // Local fallback
    }
  }

  // User management
  public getCurrentUser(): User {
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || this.users[0] || INITIAL_USERS[1];
  }

  public async setCurrentUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      try {
        await api.setActiveUser(userId);
      } catch {
        // non-blocking
      }
      this.notify();
    }
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  // Resources (Donor)
  public getResources(role: Role = 'ADMIN', userId?: number): Resource[] {
    return [...this.resources];
  }

  public getRawResources(): Resource[] {
    return [...this.resources];
  }

  public async createResource(data: Omit<Resource, 'id' | 'hubZone' | 'status' | 'createdAt'>): Promise<Resource> {
    try {
      const created = await api.createResource(data);
      // Optimistically push to local cache for instant UI feedback
      this.resources.unshift(created);
      this.notify();
      return created;
    } catch (err) {
      // Fallback local creation if server offline
      const hubZone = extractHubZone(data.pickupAddress);
      const fallbackResource: Resource = {
        ...data,
        id: Date.now(),
        hubZone,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      };
      this.resources.unshift(fallbackResource);
      this.notify();
      return fallbackResource;
    }
  }

  // Requirements (Donee)
  public getRequirements(role: Role = 'ADMIN', userId?: number): Requirement[] {
    return [...this.requirements];
  }

  public getRawRequirements(): Requirement[] {
    return [...this.requirements];
  }

  public async createRequirement(data: Omit<Requirement, 'id' | 'hubZone' | 'status' | 'createdAt'>): Promise<Requirement> {
    try {
      const created = await api.createRequirement(data);
      this.requirements.unshift(created);
      this.notify();
      return created;
    } catch (err) {
      const hubZone = extractHubZone(data.deliveryAddress);
      const fallbackRequirement: Requirement = {
        ...data,
        id: Date.now(),
        hubZone,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      };
      this.requirements.unshift(fallbackRequirement);
      this.notify();
      return fallbackRequirement;
    }
  }

  // Matching Engine Execution
  public findMatchesForRequirement(requirementId: number): Match[] {
    const req = this.requirements.find(r => r.id === requirementId);
    if (!req) return [];

    const availableResources = this.resources.filter(r => r.status === 'AVAILABLE');
    const matches: Match[] = [];

    for (const res of availableResources) {
      const breakdown = computeMatchScore(res, req);

      if (breakdown.isEligible && breakdown.totalScore >= 50) {
        matches.push({
          id: Math.floor(Math.random() * 90000) + 10000,
          resourceId: res.id,
          requirementId: req.id,
          compatibilityScore: breakdown.totalScore,
          scoreBreakdown: breakdown,
          logisticsCost: breakdown.totalLogisticsCost,
          estimatedDelivery: breakdown.estimatedDelivery,
          status: 'PROPOSED',
          createdAt: new Date().toISOString(),
          resource: res,
          requirement: req
        });
      }
    }

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return matches;
  }

  // Order Acceptance & Shipment Generation
  public async acceptMatch(matchData: {
    resourceId: number;
    requirementId: number;
    compatibilityScore: number;
    scoreBreakdown: any;
    logisticsCost: number;
    estimatedDelivery: string;
  }): Promise<{ match: Match; shipment: Shipment }> {
    try {
      const result = await api.acceptMatch(matchData);
      await this.fetchAll();
      return result;
    } catch {
      // Local fallback
      const resource = this.resources.find(r => r.id === matchData.resourceId);
      const requirement = this.requirements.find(r => r.id === matchData.requirementId);
      if (!resource || !requirement) throw new Error('Not found');

      resource.status = 'MATCHED';
      requirement.status = 'MATCHED';

      const logistics = calculateLogisticsCost(resource.hubZone, requirement.hubZone);
      const matchId = Date.now();
      const match: Match = {
        id: matchId,
        resourceId: resource.id,
        requirementId: requirement.id,
        compatibilityScore: matchData.compatibilityScore,
        scoreBreakdown: matchData.scoreBreakdown,
        logisticsCost: matchData.logisticsCost,
        estimatedDelivery: matchData.estimatedDelivery,
        status: 'ACCEPTED',
        createdAt: new Date().toISOString(),
        resource,
        requirement
      };

      const shipment: Shipment = {
        id: Date.now() + 1,
        matchId: match.id,
        logisticsPartnerId: logistics.carrier.id,
        logisticsPartnerName: logistics.carrier.name,
        pickupStatus: 'SCHEDULED',
        deliveryStatus: 'PENDING',
        trackingStatus: `Shipment order confirmed with ${logistics.carrier.name}`,
        assignedVehicle: logistics.suggestedVehicle,
        estimatedArrival: logistics.estimatedDelivery,
        currentMilestone: 'SCHEDULED',
        originHub: resource.hubZone,
        destinationHub: requirement.hubZone,
        sellerOrg: resource.sellerOrg || 'Company A Electronics',
        buyerOrg: requirement.buyerOrg || 'XYZ Foundation & STEM Academy',
        materialName: resource.materialName,
        quantity: Math.min(resource.quantity, requirement.requiredQuantity),
        unit: resource.unit,
        exactPickupAddress: resource.pickupAddress,
        exactDeliveryAddress: requirement.deliveryAddress,
        sellerContactPhone: '+91 98201 12345',
        buyerContactPhone: '+91 98202 54321',
        donorContactPhone: '+91 98201 12345',
        doneeContactPhone: '+91 98202 54321',
        milestones: [
          {
            timestamp: new Date().toISOString(),
            status: 'SCHEDULED',
            location: resource.hubZone,
            notes: `Consignment booked with ${logistics.carrier.name}`,
            updatedBy: 'System Broker'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.shipments.unshift(shipment);
      this.notify();
      return { match, shipment };
    }
  }

  // Shipments & Milestones
  public getShipments(role: Role = 'ADMIN', userId?: number): Shipment[] {
    if (role === 'LOGISTICS') {
      return this.getRawShipments();
    }
    return this.shipments.map(s => {
      // Find match to sanitize for Buyer / Seller to maintain mutual commercial anonymity
      const match = {
        resource: { sellerId: 101, donorId: 101 },
        requirement: { buyerId: 201, doneeId: 201 }
      } as any;
      return sanitizeShipmentForUser(s, role, userId || 0, match);
    });
  }

  public getRawShipments(): Shipment[] {
    return this.shipments.map(s => {
      // Ensure completely unredacted physical addresses for logistics partner
      let exactPickup = s.exactPickupAddress;
      if (!exactPickup || exactPickup.includes('Protected Hub')) {
        if (s.originHub?.includes('Taloja')) {
          exactPickup = 'Sector 19, MIDC Industrial Area, Taloja, Navi Mumbai 410208';
        } else if (s.originHub?.includes('Dahanu')) {
          exactPickup = 'Thermal Power Yard 3, Dahanu Coastal Road, Maharashtra 401602';
        } else {
          exactPickup = 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302';
        }
      }

      let exactDelivery = s.exactDeliveryAddress;
      if (!exactDelivery || exactDelivery.includes('Protected Hub')) {
        if (s.destinationHub?.includes('Chakan')) {
          exactDelivery = 'Plant Gate 4, Chakan MIDC Phase 2, Pune, Maharashtra 410501';
        } else {
          exactDelivery = 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005';
        }
      }

      let sellerOrg = s.sellerOrg;
      if (!sellerOrg || sellerOrg.includes('Confidential') || sellerOrg.includes('Protected')) {
        if (s.originHub?.includes('Taloja')) {
          sellerOrg = 'Precision Metals Pvt Ltd';
        } else if (s.originHub?.includes('Dahanu')) {
          sellerOrg = 'EcoFab Energy';
        } else {
          sellerOrg = 'Company A Electronics & Industrial Surplus';
        }
      }

      let buyerOrg = s.buyerOrg;
      if (!buyerOrg || buyerOrg.includes('Confidential') || buyerOrg.includes('Protected')) {
        if (s.destinationHub?.includes('Chakan')) {
          buyerOrg = 'GreenBuild Infra Concrete';
        } else {
          buyerOrg = 'XYZ Foundation & STEM Academy';
        }
      }

      return {
        ...s,
        exactPickupAddress: exactPickup,
        exactDeliveryAddress: exactDelivery,
        sellerOrg,
        buyerOrg,
        sellerContactPhone: s.sellerContactPhone || s.donorContactPhone || '+91 98201 12345',
        buyerContactPhone: s.buyerContactPhone || s.doneeContactPhone || '+91 98202 54321'
      };
    });
  }

  public async updateShipmentMilestone(
    shipmentId: number,
    milestone: 'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
    notes: string,
    updatedBy: string
  ): Promise<Shipment | null> {
    try {
      const updated = await api.updateShipmentMilestone(shipmentId, milestone, notes, updatedBy);
      await this.fetchAll();
      return updated;
    } catch {
      const shipment = this.shipments.find(s => s.id === shipmentId);
      if (!shipment) return null;

      shipment.currentMilestone = milestone;
      shipment.updatedAt = new Date().toISOString();
      if (milestone === 'PICKED_UP') {
        shipment.pickupStatus = 'PICKED_UP';
        shipment.deliveryStatus = 'IN_TRANSIT';
        shipment.trackingStatus = `Material collected at ${shipment.originHub}.`;
      } else if (milestone === 'IN_TRANSIT') {
        shipment.pickupStatus = 'PICKED_UP';
        shipment.deliveryStatus = 'IN_TRANSIT';
        shipment.trackingStatus = `Consignment in transit between ${shipment.originHub} and ${shipment.destinationHub}.`;
      } else if (milestone === 'DELIVERED') {
        shipment.pickupStatus = 'PICKED_UP';
        shipment.deliveryStatus = 'DELIVERED';
        shipment.trackingStatus = `Successfully delivered to destination hub.`;
      }

      shipment.milestones.unshift({
        timestamp: new Date().toISOString(),
        status: milestone,
        location: milestone === 'DELIVERED' ? shipment.destinationHub : shipment.originHub,
        notes: notes || `Milestone updated to ${milestone}`,
        updatedBy
      });

      this.notify();
      return shipment;
    }
  }

  public getCarriers(): typeof MOCK_CARRIERS {
    return MOCK_CARRIERS;
  }
}

export const store = new StoreService();
