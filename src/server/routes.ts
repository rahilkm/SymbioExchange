import { Router, Request, Response } from 'express';
import { backendDb } from './db';
import { calculateLogisticsCost } from '../lib/logistics-engine';
import { Role } from '../types';

export const apiRouter = Router();

// Connected SSE clients for instantaneous real-time sync
type SSEClient = { id: number; res: Response };
let sseClients: SSEClient[] = [];

export function broadcastEvent(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// SSE stream endpoint
apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Date.now() + Math.random();
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// User routes
apiRouter.get('/users', (req: Request, res: Response) => {
  const users = backendDb.getUsers();
  const activeUser = backendDb.getActiveUser();
  res.json({ users, activeUser });
});

apiRouter.post('/users/active', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = backendDb.setActiveUser(Number(userId));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  broadcastEvent('user_changed', user);
  res.json({ success: true, activeUser: user });
});

// Resource routes (Seller)
apiRouter.get('/resources', (req: Request, res: Response) => {
  const role = (req.query.role as Role) || 'LOGISTICS';
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const resources = backendDb.getResources(role, userId);
  res.json({ resources });
});

apiRouter.post('/resources', (req: Request, res: Response) => {
  try {
    const {
      sellerId,
      sellerOrg,
      donorId,
      donorOrg,
      materialName,
      category,
      quantity,
      unit,
      materialState,
      materialCost,
      availableFrom,
      pickupAddress,
      description
    } = req.body;

    if (!materialName || !quantity || !materialCost || !pickupAddress) {
      return res.status(400).json({ error: 'Missing required resource fields' });
    }

    const effectiveSellerId = Number(sellerId || donorId) || 101;
    const effectiveSellerOrg = sellerOrg || donorOrg || 'Company A Electronics';

    const created = backendDb.createResource({
      sellerId: effectiveSellerId,
      sellerOrg: effectiveSellerOrg,
      donorId: effectiveSellerId,
      donorOrg: effectiveSellerOrg,
      materialName,
      category: category || 'Electronics',
      quantity: Number(quantity),
      unit: unit || 'units',
      materialState: materialState || 'solid',
      materialCost: Number(materialCost),
      availableFrom: availableFrom || new Date().toISOString(),
      pickupAddress,
      description
    });

    // Broadcast live event to all connected clients immediately!
    broadcastEvent('resource_created', created);

    res.status(201).json({ success: true, resource: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create resource' });
  }
});

// Requirement routes (Buyer)
apiRouter.get('/requirements', (req: Request, res: Response) => {
  const role = (req.query.role as Role) || 'LOGISTICS';
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const requirements = backendDb.getRequirements(role, userId);
  res.json({ requirements });
});

apiRouter.post('/requirements', (req: Request, res: Response) => {
  try {
    const {
      buyerId,
      buyerOrg,
      doneeId,
      doneeOrg,
      materialName,
      category,
      requiredQuantity,
      unit,
      acceptableState,
      maxPrice,
      requiredBy,
      deliveryAddress,
      notes
    } = req.body;

    if (!materialName || !requiredQuantity || !maxPrice || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required requirement fields' });
    }

    const effectiveBuyerId = Number(buyerId || doneeId) || 201;
    const effectiveBuyerOrg = buyerOrg || doneeOrg || 'XYZ Foundation STEM Academy';

    const created = backendDb.createRequirement({
      buyerId: effectiveBuyerId,
      buyerOrg: effectiveBuyerOrg,
      doneeId: effectiveBuyerId,
      doneeOrg: effectiveBuyerOrg,
      materialName,
      category: category || 'Electronics',
      requiredQuantity: Number(requiredQuantity),
      unit: unit || 'units',
      acceptableState: acceptableState || 'solid',
      maxPrice: Number(maxPrice),
      requiredBy: requiredBy || new Date().toISOString(),
      deliveryAddress,
      notes
    });

    broadcastEvent('requirement_created', created);
    res.status(201).json({ success: true, requirement: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create requirement' });
  }
});

// Matches endpoint (Deterministic Matching Engine)
apiRouter.get('/matches', (req: Request, res: Response) => {
  const reqId = Number(req.query.reqId);
  if (!reqId) {
    return res.status(400).json({ error: 'reqId query parameter required' });
  }

  const matches = backendDb.findMatchesForRequirement(reqId);
  res.json({ matches });
});

apiRouter.post('/matches/:id/accept', (req: Request, res: Response) => {
  try {
    const matchData = req.body;
    const result = backendDb.acceptMatch(matchData);

    broadcastEvent('match_accepted', result);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to accept match' });
  }
});

// Shipments endpoint
apiRouter.get('/shipments', (req: Request, res: Response) => {
  const role = (req.query.role as Role) || 'ADMIN';
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const shipments = backendDb.getShipments(role, userId);
  res.json({ shipments });
});

apiRouter.post('/shipments/:id/milestone', (req: Request, res: Response) => {
  try {
    const shipmentId = Number(req.params.id);
    const { milestone, notes, updatedBy } = req.body;

    const updated = backendDb.updateShipmentMilestone(
      shipmentId,
      milestone,
      notes,
      updatedBy || 'Fleet Dispatcher'
    );

    if (!updated) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    broadcastEvent('shipment_updated', updated);
    res.json({ success: true, shipment: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update milestone' });
  }
});

// Logistics estimate endpoint
apiRouter.post('/logistics/estimate', (req: Request, res: Response) => {
  const { originHub, destinationHub } = req.body;
  if (!originHub || !destinationHub) {
    return res.status(400).json({ error: 'originHub and destinationHub required' });
  }
  const estimate = calculateLogisticsCost(originHub, destinationHub);
  res.json({ estimate });
});

// Reset endpoint
apiRouter.post('/reset', (req: Request, res: Response) => {
  backendDb.reset();
  broadcastEvent('database_reset', {});
  res.json({ success: true, message: 'Database reset to initial state' });
});
