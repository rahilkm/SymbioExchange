import {
  Resource,
  Requirement,
  Match,
  Shipment,
  User,
  Role,
  ListingStatus
} from '../types';

type EventListener = (event: { type: string; payload: any; timestamp: string }) => void;

class ApiClient {
  private eventListeners: EventListener[] = [];
  private eventSource: EventSource | null = null;
  private sseConnected: boolean = false;

  constructor() {
    this.initSSE();
  }

  private initSSE() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.sseConnected = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.eventListeners.forEach(listener => listener(parsed));
        } catch (e) {
          // ignore unparseable events
        }
      };

      this.eventSource.onerror = () => {
        this.sseConnected = false;
        // EventSource will automatically attempt reconnection
      };
    } catch {
      // Fallback
    }
  }

  public onEvent(callback: EventListener) {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== callback);
    };
  }

  // Users
  public async getUsers(): Promise<{ users: User[]; activeUser: User }> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  public async setActiveUser(userId: number): Promise<User> {
    const res = await fetch('/api/users/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to set active user');
    const data = await res.json();
    return data.activeUser;
  }

  // Resources (Donor)
  public async getResources(role: Role = 'ADMIN', userId?: number): Promise<Resource[]> {
    const url = new URL('/api/resources', window.location.origin);
    url.searchParams.set('role', role);
    if (userId) url.searchParams.set('userId', String(userId));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch resources');
    const data = await res.json();
    return data.resources;
  }

  public async createResource(
    resourceData: Omit<Resource, 'id' | 'hubZone' | 'status' | 'createdAt'>
  ): Promise<Resource> {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create resource');
    }
    const data = await res.json();
    return data.resource;
  }

  // Requirements (Donee)
  public async getRequirements(role: Role = 'ADMIN', userId?: number): Promise<Requirement[]> {
    const url = new URL('/api/requirements', window.location.origin);
    url.searchParams.set('role', role);
    if (userId) url.searchParams.set('userId', String(userId));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch requirements');
    const data = await res.json();
    return data.requirements;
  }

  public async createRequirement(
    requirementData: Omit<Requirement, 'id' | 'hubZone' | 'status' | 'createdAt'>
  ): Promise<Requirement> {
    const res = await fetch('/api/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirementData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create requirement');
    }
    const data = await res.json();
    return data.requirement;
  }

  // Matches
  public async getMatches(requirementId: number): Promise<Match[]> {
    const res = await fetch(`/api/matches?reqId=${requirementId}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    const data = await res.json();
    return data.matches;
  }

  public async acceptMatch(matchData: {
    resourceId: number;
    requirementId: number;
    compatibilityScore: number;
    scoreBreakdown: any;
    logisticsCost: number;
    estimatedDelivery: string;
  }): Promise<{ match: Match; shipment: Shipment }> {
    const res = await fetch(`/api/matches/${matchData.resourceId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to accept match');
    }
    return res.json();
  }

  // Shipments
  public async getShipments(role: Role = 'ADMIN', userId?: number): Promise<Shipment[]> {
    const url = new URL('/api/shipments', window.location.origin);
    url.searchParams.set('role', role);
    if (userId) url.searchParams.set('userId', String(userId));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch shipments');
    const data = await res.json();
    return data.shipments;
  }

  public async updateShipmentMilestone(
    shipmentId: number,
    milestone: 'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
    notes: string,
    updatedBy: string
  ): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${shipmentId}/milestone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestone, notes, updatedBy })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update milestone');
    }
    const data = await res.json();
    return data.shipment;
  }

  // Reset database
  public async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
  }
}

export const api = new ApiClient();
