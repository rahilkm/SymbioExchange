import { Resource, Requirement, Match, Shipment, Role } from '../types';

/**
 * Sanitizes a Resource object based on the requester's role and user ID
 */
export function sanitizeResourceForUser(resource: Resource, role: Role, userId: number): Partial<Resource> {
  const ownerId = resource.sellerId || resource.donorId;
  const isOwner = ownerId === userId;
  const isPrivileged = role === 'LOGISTICS';

  if (isOwner || isPrivileged) {
    return { ...resource };
  }

  // Redact exact physical address for cross-party viewers
  const sanitized = { ...resource };
  sanitized.pickupAddress = `[Hub Mediated: ${resource.hubZone}]`;
  delete sanitized.sellerOrg;
  delete sanitized.donorOrg;

  return sanitized;
}

/**
 * Sanitizes a Requirement object based on the requester's role and user ID
 */
export function sanitizeRequirementForUser(requirement: Requirement, role: Role, userId: number): Partial<Requirement> {
  const ownerId = requirement.buyerId || requirement.doneeId;
  const isOwner = ownerId === userId;
  const isPrivileged = role === 'LOGISTICS';

  if (isOwner || isPrivileged) {
    return { ...requirement };
  }

  // Redact exact delivery address for cross-party viewers
  const sanitized = { ...requirement };
  sanitized.deliveryAddress = `[Hub Mediated: ${requirement.hubZone}]`;
  delete sanitized.buyerOrg;
  delete sanitized.doneeOrg;

  return sanitized;
}

/**
 * Sanitizes a Match record for cross-party views
 */
export function sanitizeMatchForUser(match: Match, role: Role, userId: number): Match {
  const sanitized: Match = {
    ...match,
    resource: match.resource ? (sanitizeResourceForUser(match.resource, role, userId) as Resource) : undefined,
    requirement: match.requirement ? (sanitizeRequirementForUser(match.requirement, role, userId) as Requirement) : undefined,
  };

  return sanitized;
}

/**
 * Sanitizes a Shipment record based on role
 * Logistics partner needs exact dispatch addresses.
 * Buyer & Seller ONLY see Hub-to-Hub transit and milestone tracking.
 */
export function sanitizeShipmentForUser(shipment: Shipment, role: Role, userId: number, match?: Match): Shipment {
  if (role === 'LOGISTICS' || role === 'ADMIN') {
    return { ...shipment };
  }

  const sanitized = { ...shipment };

  // For Seller: only show exact pickup address if seller owns it, hide buyer's exact delivery address
  const sellerId = match && match.resource && (match.resource.sellerId || match.resource.donorId);
  const buyerId = match && match.requirement && (match.requirement.buyerId || match.requirement.doneeId);
  const isSeller = sellerId === userId;
  const isBuyer = buyerId === userId;

  if (isSeller) {
    sanitized.exactDeliveryAddress = `[Protected Hub: ${shipment.destinationHub}]`;
    sanitized.buyerOrg = '[Confidential Verified Buyer]';
    delete sanitized.buyerContactPhone;
    delete sanitized.doneeContactPhone;
  } else if (isBuyer) {
    sanitized.exactPickupAddress = `[Protected Hub: ${shipment.originHub}]`;
    sanitized.sellerOrg = '[Confidential Verified Seller]';
    delete sanitized.sellerContactPhone;
    delete sanitized.donorContactPhone;
  } else {
    sanitized.exactPickupAddress = `[Protected Hub: ${shipment.originHub}]`;
    sanitized.exactDeliveryAddress = `[Protected Hub: ${shipment.destinationHub}]`;
    sanitized.sellerOrg = '[Confidential Verified Seller]';
    sanitized.buyerOrg = '[Confidential Verified Buyer]';
    delete sanitized.sellerContactPhone;
    delete sanitized.donorContactPhone;
    delete sanitized.buyerContactPhone;
    delete sanitized.doneeContactPhone;
  }

  return sanitized;
}
