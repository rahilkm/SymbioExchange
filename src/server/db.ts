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
import { extractHubZone } from '../lib/geo-hub';
import { calculateLogisticsCost } from '../lib/logistics-engine';
import { computeMatchScore } from '../lib/matching-engine';
import {
  sanitizeResourceForUser,
  sanitizeRequirementForUser,
  sanitizeMatchForUser,
  sanitizeShipmentForUser
} from '../lib/privacy-serializer';

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

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 1,
    sellerId: 101,
    sellerOrg: 'Company A Electronics',
    donorId: 101,
    donorOrg: 'Company A Electronics',
    materialName: 'Refurbished Business Laptops',
    category: 'Electronics',
    quantity: 500,
    unit: 'units',
    materialState: 'solid',
    materialCost: 6000,
    availableFrom: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    pickupAddress: 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302',
    hubZone: 'Bhiwandi Hub, Mumbai Region',
    status: 'AVAILABLE',
    description: 'Corporate surplus Core i5 laptops, wiped and factory-tested working units with power adapters.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    sellerId: 101,
    sellerOrg: 'EcoFab Energy',
    donorId: 101,
    donorOrg: 'EcoFab Energy',
    materialName: 'Industrial Class-F Fly Ash',
    category: 'Construction Raw Material',
    quantity: 200,
    unit: 'tons',
    materialState: 'solid',
    materialCost: 950,
    availableFrom: new Date().toISOString().split('T')[0],
    pickupAddress: 'Thermal Power Yard 3, Dahanu Coastal Road, Maharashtra 401602',
    hubZone: 'Bhiwandi Hub, Mumbai Region',
    status: 'AVAILABLE',
    description: 'High-fineness siliceous fly ash for low-carbon cement replacement and pre-cast concrete blocks.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 3,
    sellerId: 101,
    sellerOrg: 'Precision Metals Pvt Ltd',
    donorId: 101,
    donorOrg: 'Precision Metals Pvt Ltd',
    materialName: 'Structural MS Steel Offcuts',
    category: 'Metals & Alloys',
    quantity: 45,
    unit: 'tons',
    materialState: 'solid',
    materialCost: 38000,
    availableFrom: new Date().toISOString().split('T')[0],
    pickupAddress: 'Sector 19, MIDC Industrial Area, Taloja, Navi Mumbai 410208',
    hubZone: 'Navi Mumbai Taloja Hub',
    status: 'AVAILABLE',
    description: 'Clean Mild Steel plate and I-beam trimmings, prime secondary grade suitable for re-rolling.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: 10,
    buyerId: 201,
    buyerOrg: 'XYZ Foundation & STEM Academy',
    doneeId: 201,
    doneeOrg: 'XYZ Foundation & STEM Academy',
    materialName: 'Refurbished Business Laptops',
    category: 'Electronics',
    requiredQuantity: 100,
    unit: 'units',
    acceptableState: 'solid',
    maxPrice: 8000,
    requiredBy: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    deliveryAddress: 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005',
    hubZone: 'Pune Bhosari Industrial Hub',
    status: 'OPEN',
    notes: 'Urgent requirement for student computer lab setup in semi-rural digital literacy drive.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 11,
    buyerId: 201,
    buyerOrg: 'GreenBuild Infra Concrete',
    doneeId: 201,
    doneeOrg: 'GreenBuild Infra Concrete',
    materialName: 'Industrial Class-F Fly Ash',
    category: 'Construction Raw Material',
    requiredQuantity: 150,
    unit: 'tons',
    acceptableState: 'solid',
    maxPrice: 1200,
    requiredBy: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    deliveryAddress: 'Plant Gate 4, Chakan MIDC Phase 2, Pune, Maharashtra 410501',
    hubZone: 'Chakan Industrial Hub, Pune',
    status: 'OPEN',
    notes: 'Bulk pozzolanic binder requirement for green paving block production.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 501,
    matchId: 999,
    logisticsPartnerId: 2,
    logisticsPartnerName: 'Mum-Pune Express Freight',
    pickupStatus: 'PICKED_UP',
    deliveryStatus: 'IN_TRANSIT',
    trackingStatus: 'Consignment en route on Mumbai-Pune Expressway past Khandala ghat',
    assignedVehicle: '1-Ton Truck (MH-14-GH-4822)',
    estimatedArrival: 'Tomorrow, 11:30 AM',
    currentMilestone: 'IN_TRANSIT',
    originHub: 'Bhiwandi Hub, Mumbai Region',
    destinationHub: 'Pune Bhosari Industrial Hub',
    sellerOrg: 'Company A Electronics & Industrial Surplus',
    buyerOrg: 'XYZ Foundation & STEM Academy',
    materialName: 'Refurbished Business Laptops',
    quantity: 100,
    unit: 'units',
    exactPickupAddress: 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302',
    exactDeliveryAddress: 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005',
    sellerContactPhone: '+91 98201 12345',
    buyerContactPhone: '+91 98202 54321',
    donorContactPhone: '+91 98201 12345',
    doneeContactPhone: '+91 98202 54321',
    milestones: [
      {
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'SCHEDULED',
        location: 'Mum-Pune Express Dispatch Hub',
        notes: 'Carrier assigned and vehicle scheduled for pickup at source hub.',
        updatedBy: 'Mum-Pune Express Freight Dispatcher'
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'PICKED_UP',
        location: 'Bhiwandi Hub, Mumbai Region',
        notes: 'Material verified (100 units laptops), loaded, and bill of lading generated.',
        updatedBy: 'Mum-Pune Express Driver'
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'IN_TRANSIT',
        location: 'Mumbai-Pune Expressway, Khalapur Toll',
        notes: 'Consignment cleared transit checkpoint, on schedule for Pune delivery.',
        updatedBy: 'Automated Hub Checkpoint'
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

class BackendDatabase {
  private users: User[] = [...INITIAL_USERS];
  private resources: Resource[] = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
  private requirements: Requirement[] = JSON.parse(JSON.stringify(INITIAL_REQUIREMENTS));
  private matches: Match[] = [];
  private shipments: Shipment[] = JSON.parse(JSON.stringify(INITIAL_SHIPMENTS));
  private transactions: Transaction[] = [];
  private activeUserId: number = 201;

  public reset() {
    this.users = [...INITIAL_USERS];
    this.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    this.requirements = JSON.parse(JSON.stringify(INITIAL_REQUIREMENTS));
    this.matches = [];
    this.shipments = JSON.parse(JSON.stringify(INITIAL_SHIPMENTS));
    this.transactions = [];
    this.activeUserId = 201;
  }

  // Users
  public getUsers(): User[] {
    return [...this.users];
  }

  public getActiveUser(): User {
    return this.users.find(u => u.id === this.activeUserId) || this.users[0];
  }

  public setActiveUser(id: number): User | null {
    const found = this.users.find(u => u.id === id);
    if (found) {
      this.activeUserId = id;
      return found;
    }
    return null;
  }

  // Resources
  public getResources(role: Role = 'ADMIN', userId?: number): Resource[] {
    const effectiveUserId = userId ?? this.activeUserId;
    return this.resources.map(r => sanitizeResourceForUser(r, role, effectiveUserId) as Resource);
  }

  public getRawResources(): Resource[] {
    return [...this.resources];
  }

  public createResource(data: Omit<Resource, 'id' | 'hubZone' | 'status' | 'createdAt'>): Resource {
    const hubZone = extractHubZone(data.pickupAddress);
    const newResource: Resource = {
      ...data,
      id: Date.now(),
      hubZone,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };
    this.resources.unshift(newResource);
    return newResource;
  }

  public updateResource(id: number, updates: Partial<Resource>): Resource | null {
    const res = this.resources.find(r => r.id === id);
    if (!res) return null;
    Object.assign(res, updates);
    return res;
  }

  // Requirements
  public getRequirements(role: Role = 'ADMIN', userId?: number): Requirement[] {
    const effectiveUserId = userId ?? this.activeUserId;
    return this.requirements.map(req => sanitizeRequirementForUser(req, role, effectiveUserId) as Requirement);
  }

  public getRawRequirements(): Requirement[] {
    return [...this.requirements];
  }

  public createRequirement(data: Omit<Requirement, 'id' | 'hubZone' | 'status' | 'createdAt'>): Requirement {
    const hubZone = extractHubZone(data.deliveryAddress);
    const newRequirement: Requirement = {
      ...data,
      id: Date.now(),
      hubZone,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    this.requirements.unshift(newRequirement);
    return newRequirement;
  }

  // Matches
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

  public acceptMatch(matchData: {
    resourceId: number;
    requirementId: number;
    compatibilityScore: number;
    scoreBreakdown: any;
    logisticsCost: number;
    estimatedDelivery: string;
  }): { match: Match; shipment: Shipment } {
    const resource = this.resources.find(r => r.id === matchData.resourceId);
    const requirement = this.requirements.find(r => r.id === matchData.requirementId);

    if (!resource || !requirement) {
      throw new Error('Resource or requirement not found');
    }

    // 1. Create Accepted Match Record
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
      acceptedAt: new Date().toISOString(),
      resource,
      requirement
    };
    this.matches.unshift(match);

    // 2. Mark Resource and Requirement as MATCHED
    resource.status = 'MATCHED';
    requirement.status = 'MATCHED';

    // 3. Logistics selection
    const logistics = calculateLogisticsCost(resource.hubZone, requirement.hubZone);
    const sellerUser = this.users.find(u => u.id === (resource.sellerId || resource.donorId));
    const buyerUser = this.users.find(u => u.id === (requirement.buyerId || requirement.doneeId)) || this.getActiveUser();

    // 4. Create Shipment
    const shipmentId = Date.now() + 1;
    const shipment: Shipment = {
      id: shipmentId,
      matchId: match.id,
      logisticsPartnerId: logistics.carrier.id,
      logisticsPartnerName: logistics.carrier.name,
      pickupStatus: 'SCHEDULED',
      deliveryStatus: 'PENDING',
      trackingStatus: `Shipment order confirmed. ${logistics.carrier.name} dispatched for pickup at ${resource.hubZone}.`,
      assignedVehicle: logistics.suggestedVehicle,
      estimatedArrival: logistics.estimatedDelivery,
      currentMilestone: 'SCHEDULED',
      originHub: resource.hubZone,
      destinationHub: requirement.hubZone,
      sellerOrg: resource.sellerOrg || sellerUser?.organization || 'Company A Electronics',
      buyerOrg: requirement.buyerOrg || buyerUser?.organization || 'XYZ Foundation & STEM Academy',
      materialName: resource.materialName,
      quantity: Math.min(resource.quantity, requirement.requiredQuantity),
      unit: resource.unit,
      exactPickupAddress: resource.pickupAddress,
      exactDeliveryAddress: requirement.deliveryAddress,
      sellerContactPhone: sellerUser?.phone || '+91 98201 12345',
      buyerContactPhone: buyerUser?.phone || '+91 98202 54321',
      donorContactPhone: sellerUser?.phone || '+91 98201 12345',
      doneeContactPhone: buyerUser?.phone || '+91 98202 54321',
      milestones: [
        {
          timestamp: new Date().toISOString(),
          status: 'SCHEDULED',
          location: resource.hubZone,
          notes: `Consignment booked with ${logistics.carrier.name}. Vehicle ${logistics.suggestedVehicle} assigned.`,
          updatedBy: 'System Automated Broker'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.shipments.unshift(shipment);

    // 5. Transaction
    const matchedQty = Math.min(resource.quantity, requirement.requiredQuantity);
    const resourceAmt = matchedQty * resource.materialCost;
    const totalAmt = resourceAmt + logistics.freightCost;

    const transaction: Transaction = {
      id: Date.now() + 2,
      matchId: match.id,
      resourceAmount: resourceAmt,
      logisticsAmount: logistics.freightCost,
      platformFee: Math.round(totalAmt * 0.01),
      totalAmount: totalAmt,
      status: 'PAID',
      payerId: buyerUser.id,
      receiverId: resource.sellerId || resource.donorId || 101,
      createdAt: new Date().toISOString()
    };
    this.transactions.unshift(transaction);

    return { match, shipment };
  }

  // Shipments
  public getShipments(role: Role = 'ADMIN', userId?: number): Shipment[] {
    const effectiveUserId = userId ?? this.activeUserId;
    return this.shipments.map(s => {
      // Ensure master raw data has valid unredacted physical addresses
      let unredactedPickup = s.exactPickupAddress;
      if (!unredactedPickup || unredactedPickup.includes('Protected Hub')) {
        unredactedPickup = s.originHub?.includes('Taloja')
          ? 'Sector 19, MIDC Industrial Area, Taloja, Navi Mumbai 410208'
          : 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302';
      }
      let unredactedDelivery = s.exactDeliveryAddress;
      if (!unredactedDelivery || unredactedDelivery.includes('Protected Hub')) {
        unredactedDelivery = s.destinationHub?.includes('Chakan')
          ? 'Plant Gate 4, Chakan MIDC Phase 2, Pune, Maharashtra 410501'
          : 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005';
      }
      let unredactedSellerOrg = s.sellerOrg;
      if (!unredactedSellerOrg || unredactedSellerOrg.includes('Confidential') || unredactedSellerOrg.includes('Protected')) {
        unredactedSellerOrg = 'Company A Electronics & Industrial Surplus';
      }
      let unredactedBuyerOrg = s.buyerOrg;
      if (!unredactedBuyerOrg || unredactedBuyerOrg.includes('Confidential') || unredactedBuyerOrg.includes('Protected')) {
        unredactedBuyerOrg = 'XYZ Foundation & STEM Academy';
      }

      const rawShipment: Shipment = {
        ...s,
        exactPickupAddress: unredactedPickup,
        exactDeliveryAddress: unredactedDelivery,
        sellerOrg: unredactedSellerOrg,
        buyerOrg: unredactedBuyerOrg,
        sellerContactPhone: s.sellerContactPhone || '+91 98201 12345',
        buyerContactPhone: s.buyerContactPhone || '+91 98202 54321'
      };

      if (role === 'LOGISTICS' || role === 'ADMIN') {
        return rawShipment;
      }

      const match = this.matches.find(m => m.id === s.matchId);
      return sanitizeShipmentForUser(rawShipment, role, effectiveUserId, match);
    });
  }

  public updateShipmentMilestone(
    shipmentId: number,
    milestone: 'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
    notes: string,
    updatedBy: string
  ): Shipment | null {
    const shipment = this.shipments.find(s => s.id === shipmentId);
    if (!shipment) return null;

    shipment.currentMilestone = milestone;
    shipment.updatedAt = new Date().toISOString();

    if (milestone === 'PICKED_UP') {
      shipment.pickupStatus = 'PICKED_UP';
      shipment.deliveryStatus = 'IN_TRANSIT';
      shipment.trackingStatus = `Material collected at ${shipment.originHub}. Loaded on carrier vehicle.`;
    } else if (milestone === 'IN_TRANSIT') {
      shipment.pickupStatus = 'PICKED_UP';
      shipment.deliveryStatus = 'IN_TRANSIT';
      shipment.trackingStatus = `Consignment in transit between ${shipment.originHub} and ${shipment.destinationHub}.`;
    } else if (milestone === 'DELIVERED') {
      shipment.pickupStatus = 'PICKED_UP';
      shipment.deliveryStatus = 'DELIVERED';
      shipment.trackingStatus = `Successfully delivered to destination hub and received by donee.`;

      const match = this.matches.find(m => m.id === shipment.matchId);
      if (match) {
        const res = this.resources.find(r => r.id === match.resourceId);
        const req = this.requirements.find(r => r.id === match.requirementId);
        if (res) res.status = 'FULFILLED';
        if (req) req.status = 'FULFILLED';
      }
    }

    shipment.milestones.unshift({
      timestamp: new Date().toISOString(),
      status: milestone,
      location: milestone === 'DELIVERED' ? shipment.destinationHub : shipment.originHub,
      notes: notes || `Milestone updated to ${milestone}`,
      updatedBy
    });

    return shipment;
  }
}

export const backendDb = new BackendDatabase();
