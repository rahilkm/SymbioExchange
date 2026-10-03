import { computeMatchScore } from '../src/lib/matching-engine';
import { Resource, Requirement } from '../src/types';

console.log('=================================================================');
console.log('🧪 VERIFICATION TEST: Deterministic Matching Engine (5-Factor Formula)');
console.log('=================================================================');

// Test Case 1: Canonical PRD Demo Scenario (Laptops: Mumbai -> Pune)
const sampleDonorResource: Resource = {
  id: 1,
  donorId: 101,
  materialName: 'Refurbished Business Laptops',
  category: 'Electronics',
  quantity: 500, // Available: 500 units
  unit: 'units',
  materialState: 'solid',
  materialCost: 6000, // ₹6,000 / unit
  availableFrom: '2026-09-20',
  pickupAddress: 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Mumbai',
  hubZone: 'Bhiwandi Hub, Mumbai Region',
  status: 'AVAILABLE',
  createdAt: '2026-09-20'
};

const sampleDoneeRequirement: Requirement = {
  id: 10,
  doneeId: 201,
  materialName: 'Refurbished Business Laptops',
  category: 'Electronics',
  requiredQuantity: 100, // Needed: 100 units
  unit: 'units',
  acceptableState: 'solid',
  maxPrice: 8000, // Max price: ₹8,000 / unit
  requiredBy: '2026-10-05',
  deliveryAddress: 'Campus 2, STEM Innovation Block, Pune',
  hubZone: 'Pune Bhosari Industrial Hub',
  status: 'OPEN',
  createdAt: '2026-09-25'
};

const result = computeMatchScore(sampleDonorResource, sampleDoneeRequirement);

console.log('Candidate Evaluation:');
console.log(`- Material Compatibility Score (35% weight): ${result.materialScore}%`);
console.log(`- Quantity Fit Score (20% weight):           ${result.quantityScore}%`);
console.log(`- Economic Feasibility Score (20% weight):   ${result.economicScore}%`);
console.log(`- Distance Score (15% weight):               ${result.distanceScore}% (${result.distanceKm} km)`);
console.log(`- Time Compatibility Score (10% weight):     ${result.timeScore}%`);
console.log(`-----------------------------------------------------------------`);
console.log(`🎯 TOTAL WEIGHTED COMPOSITE SCORE:          ${result.totalScore}%`);
console.log(`- Logistics Carrier Selected:                ${result.carrierName}`);
console.log(`- Logistics Freight Cost:                    ₹${result.totalLogisticsCost.toLocaleString()}`);
console.log(`- Estimated Transit Time:                    ${result.estimatedDelivery}`);
console.log(`- Resource Subtotal (100 units * ₹6,000):     ₹${result.materialTotalCost.toLocaleString()}`);
console.log(`- Total Combined Cost:                       ₹${result.totalCombinedCost.toLocaleString()}`);
console.log(`- Is Eligible:                               ${result.isEligible ? '✅ YES' : '❌ NO'}`);
console.log('=================================================================');

if (result.totalScore >= 88 && result.totalScore <= 95 && result.totalLogisticsCost === 6500) {
  console.log('🎉 TEST PASSED! Result matches PRD expectations perfectly (~90-93% score, ₹6,500 logistics).');
} else {
  console.error('⚠️ Verification discrepancy detected.');
}
