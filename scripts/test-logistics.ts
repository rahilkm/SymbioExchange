import { calculateLogisticsCost, MOCK_CARRIERS } from '../src/lib/logistics-engine';
import { getDistanceBetweenHubs } from '../src/lib/geo-hub';

console.log('=================================================================');
console.log('🚚 VERIFICATION TEST: Logistics & Freight Engine');
console.log('=================================================================');

// Test Route: Mumbai (Bhiwandi Hub) -> Pune (Bhosari Hub)
const originHub = 'Bhiwandi Hub, Mumbai Region';
const destinationHub = 'Pune Bhosari Industrial Hub';

const distance = getDistanceBetweenHubs(originHub, destinationHub);
const result = calculateLogisticsCost(originHub, destinationHub);

console.log(`Corridor:            ${originHub} ➔ ${destinationHub}`);
console.log(`Distance:            ${distance} km`);
console.log(`Selected Carrier:    ${result.carrier.name}`);
console.log(`Vehicle Type:        ${result.suggestedVehicle}`);
console.log(`Base Price:          ₹${result.carrier.basePrice}`);
console.log(`Rate per KM:         ₹${result.carrier.perKmPrice}/km`);
console.log(`Total Freight:       ₹${result.freightCost.toLocaleString()}`);
console.log(`ETA:                 ${result.estimatedDelivery}`);
console.log('=================================================================');

if (distance === 150 && result.freightCost === 6500 && result.carrier.id === 2) {
  console.log('🎉 TEST PASSED! Mum-Pune Express freight matches ₹6,500 and 150 km corridor.');
} else {
  console.error('⚠️ Logistics discrepancy detected.');
}
