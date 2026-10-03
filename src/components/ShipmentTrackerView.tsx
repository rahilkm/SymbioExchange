import React, { useState } from 'react';
import { Shipment, User, Role } from '../types';
import { store } from '../services/store';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Package,
  Copy,
  Check,
  ExternalLink,
  Building,
  PhoneCall
} from 'lucide-react';

interface ShipmentTrackerViewProps {
  currentUser: User;
  onNavigateToTab: (tab: string) => void;
}

export const ShipmentTrackerView: React.FC<ShipmentTrackerViewProps> = ({
  currentUser,
  onNavigateToTab
}) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => store.getShipments(currentUser.role, currentUser.id));
  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(() =>
    shipments.length > 0 ? shipments[0].id : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      const updated = store.getShipments(currentUser.role, currentUser.id);
      setShipments(updated);
      if (!selectedShipmentId && updated.length > 0) {
        setSelectedShipmentId(updated[0].id);
      }
    });
    return () => unsub();
  }, [currentUser, selectedShipmentId]);

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || (shipments.length > 0 ? shipments[0] : null);

  const milestones: ('SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED')[] = [
    'SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED'
  ];

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 0;
      case 'PICKED_UP': return 1;
      case 'IN_TRANSIT': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  const currentIdx = selectedShipment ? getMilestoneIndex(selectedShipment.currentMilestone) : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900 font-display">
              {currentUser.role === 'LOGISTICS'
                ? 'Carrier Waybills & Freight Execution'
                : 'Inter-Hub Shipment & Freight Tracking'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {currentUser.role === 'LOGISTICS'
              ? 'Direct carrier view: Actual physical addresses of both Buyer and Seller are visible with no protected hub abstraction. Strict commercial anonymity is maintained between the buyer and seller.'
              : 'Privacy-safe logistics lifecycle. Counterparty commercial anonymity is preserved through mediated hub protocols.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border bg-slate-100 text-slate-800 border-slate-300">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span>
            {currentUser.role === 'LOGISTICS'
              ? 'Actual Addresses Active (Direct Dispatch)'
              : 'Counterparty Anonymity Protected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active shipments selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 font-display">Your Active Shipments</h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">{shipments.length} Active</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
              {shipments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active shipments found. Accept a match in the Buyer portal to initiate an order.
                </div>
              ) : (
                shipments.map((s) => {
                  const isSelected = selectedShipment?.id === s.id;
                  const isLogistics = currentUser.role === 'LOGISTICS';
                  const isBuyer = currentUser.role === 'BUYER' || currentUser.role === 'DONEE';
                  const isSeller = currentUser.role === 'SELLER' || currentUser.role === 'DONOR';

                  const pickupDisplay = isLogistics || isSeller
                    ? (s.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane')
                    : `Protected Hub (${s.originHub})`;

                  const deliveryDisplay = isLogistics || isBuyer
                    ? (s.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune')
                    : `Protected Hub (${s.destinationHub})`;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShipmentId(s.id)}
                      className={`w-full text-left p-4.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-100/90 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono font-bold text-slate-900">SH-{s.id}</span>
                        <span className="font-medium text-emerald-700">{s.currentMilestone}</span>
                      </div>

                      {isLogistics ? (
                        <div className="text-xs space-y-1">
                          <div className="text-[11px] truncate">
                            <span className="text-slate-400 font-semibold">Seller: </span>
                            <span className="font-mono text-slate-900">{pickupDisplay}</span>
                          </div>
                          <div className="text-[11px] truncate">
                            <span className="text-slate-400 font-semibold">Buyer: </span>
                            <span className="font-mono text-slate-900">{deliveryDisplay}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">
                          <div className="truncate font-medium text-slate-900">
                            {pickupDisplay} → {deliveryDisplay}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Carrier: {s.logisticsPartnerName}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Live Tracking Map & Rail (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedShipment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              {/* Shipment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">CONSIGNMENT #{selectedShipment.id}</span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {selectedShipment.currentMilestone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedShipment.trackingStatus}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <div className="text-slate-400">Estimated Delivery:</div>
                  <div className="font-semibold text-slate-900">{selectedShipment.estimatedArrival}</div>
                </div>
              </div>

              {/* Visual 4-Stage Progress Rail */}
              <div className="py-4">
                <div className="relative">
                  {/* Background Track Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2" />
                  {/* Active Progress Fill */}
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 transition-all duration-500"
                    style={{
                      width: `${(currentIdx / (milestones.length - 1)) * 100}%`
                    }}
                  />

                  {/* Stage Markers */}
                  <div className="relative flex justify-between">
                    {milestones.map((m, idx) => {
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={m} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent
                                ? 'bg-slate-900 text-white ring-4 ring-slate-100 shadow-md scale-110'
                                : isComplete
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>

                          <div className="text-center mt-2">
                            <div className={`text-xs font-semibold ${isCurrent ? 'text-slate-900 font-bold' : isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                              {m === 'SCHEDULED' && 'Scheduled'}
                              {m === 'PICKED_UP' && 'Picked Up'}
                              {m === 'IN_TRANSIT' && 'In Transit'}
                              {m === 'DELIVERED' && 'Delivered'}
                            </div>
                            <div className="text-[10px] text-slate-400 hidden sm:block">
                              {m === 'SCHEDULED' && 'At Hub'}
                              {m === 'PICKED_UP' && 'Loaded'}
                              {m === 'IN_TRANSIT' && 'Corridor'}
                              {m === 'DELIVERED' && 'Destination'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Transit Hub Manifest */}
              <div className="space-y-3">
                {currentUser.role === 'LOGISTICS' ? (
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-slate-700" />
                      </div>
                      <span className="font-semibold">
                        Logistics Partner Direct Routing: Actual physical pickup address (Seller) and actual physical delivery address (Buyer) are provided directly to your fleet without protected hub mediation.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">
                        Mutual Commercial Anonymity Active: Counterparty direct identity and facility address are protected by the platform's mediated logistics protocol.
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Origin Station - Seller */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {currentUser.role === 'LOGISTICS'
                          ? '1. Seller Pickup Facility (Actual Address)'
                          : currentUser.role === 'SELLER' || currentUser.role === 'DONOR'
                          ? '1. Your Registered Pickup Bay'
                          : '1. Source Origin (Protected Counterparty)'}
                      </span>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border bg-slate-200/80 text-slate-800 border-slate-300">
                        {currentUser.role === 'LOGISTICS'
                          ? 'Actual Address'
                          : currentUser.role === 'BUYER' || currentUser.role === 'DONEE'
                          ? 'Protected Hub'
                          : 'Your Facility'}
                      </span>
                    </div>

                    {currentUser.role === 'LOGISTICS' ? (
                      /* Direct Unredacted Seller View for Logistics Partner */
                      (() => {
                        const actualPickup = selectedShipment.exactPickupAddress && !selectedShipment.exactPickupAddress.includes('Protected Hub')
                          ? selectedShipment.exactPickupAddress
                          : (selectedShipment.originHub?.includes('Taloja')
                            ? 'Sector 19, MIDC Industrial Area, Taloja, Navi Mumbai 410208'
                            : 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302');
                        const actualSellerOrg = selectedShipment.sellerOrg && !selectedShipment.sellerOrg.includes('Confidential') && !selectedShipment.sellerOrg.includes('Protected')
                          ? selectedShipment.sellerOrg
                          : 'Company A Electronics & Industrial Surplus';

                        return (
                          <div className="space-y-2.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{actualSellerOrg}</span>
                            </div>

                            <div className="p-3 bg-slate-100/90 border border-slate-300 rounded-lg space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800 uppercase tracking-wider">
                                  Actual Pickup Address (No Hub)
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(actualPickup, 'seller-trk')}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    {copiedId === 'seller-trk' ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-700 font-semibold">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-500" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(actualPickup)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                    <span>Maps</span>
                                  </a>
                                </div>
                              </div>

                              <div className="font-mono text-slate-900 text-xs leading-relaxed font-medium bg-white p-2.5 rounded border border-slate-200">
                                {actualPickup}
                              </div>

                              <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3 text-slate-400" />
                                  <span>Seller Dispatch Contact:</span>
                                </span>
                                <span className="font-mono font-bold text-slate-900">
                                  {selectedShipment.sellerContactPhone || selectedShipment.donorContactPhone || '+91 98201 12345'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : currentUser.role === 'SELLER' || currentUser.role === 'DONOR' ? (
                      /* Seller's Own Facility View */
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>Company A Electronics & Industrial Surplus</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-800">
                          {selectedShipment.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Carrier will collect the cargo directly from this registered warehouse dock.
                        </p>
                      </div>
                    ) : (
                      /* Buyer View: Protected Anonymized Hub */
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono italic text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            [Confidential Verified Seller]
                          </span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{selectedShipment.originHub}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Seller identity & facility address are protected to maintain counterparty commercial anonymity. Carrier transports cargo from origin corridor.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Destination Station - Buyer */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {currentUser.role === 'LOGISTICS'
                          ? '2. Buyer Delivery Destination (Actual Address)'
                          : currentUser.role === 'BUYER' || currentUser.role === 'DONEE'
                          ? '2. Your Registered Delivery Destination'
                          : '2. Destination Dropoff (Protected Counterparty)'}
                      </span>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border bg-slate-200/80 text-slate-800 border-slate-300">
                        {currentUser.role === 'LOGISTICS'
                          ? 'Actual Address'
                          : currentUser.role === 'SELLER' || currentUser.role === 'DONOR'
                          ? 'Protected Hub'
                          : 'Your Facility'}
                      </span>
                    </div>

                    {currentUser.role === 'LOGISTICS' ? (
                      /* Direct Unredacted Buyer View for Logistics Partner */
                      (() => {
                        const actualDelivery = selectedShipment.exactDeliveryAddress && !selectedShipment.exactDeliveryAddress.includes('Protected Hub')
                          ? selectedShipment.exactDeliveryAddress
                          : (selectedShipment.destinationHub?.includes('Chakan')
                            ? 'Plant Gate 4, Chakan MIDC Phase 2, Pune, Maharashtra 410501'
                            : 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005');
                        const actualBuyerOrg = selectedShipment.buyerOrg && !selectedShipment.buyerOrg.includes('Confidential') && !selectedShipment.buyerOrg.includes('Protected')
                          ? selectedShipment.buyerOrg
                          : 'XYZ Foundation & STEM Academy';

                        return (
                          <div className="space-y-2.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{actualBuyerOrg}</span>
                            </div>

                            <div className="p-3 bg-slate-100/90 border border-slate-300 rounded-lg space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800 uppercase tracking-wider">
                                  Actual Delivery Address (No Hub)
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(actualDelivery, 'buyer-trk')}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    {copiedId === 'buyer-trk' ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-700 font-semibold">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-500" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(actualDelivery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                    <span>Maps</span>
                                  </a>
                                </div>
                              </div>

                              <div className="font-mono text-slate-900 text-xs leading-relaxed font-medium bg-white p-2.5 rounded border border-slate-200">
                                {actualDelivery}
                              </div>

                              <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3 text-slate-400" />
                                  <span>Buyer Receiving Contact:</span>
                                </span>
                                <span className="font-mono font-bold text-slate-900">
                                  {selectedShipment.buyerContactPhone || selectedShipment.doneeContactPhone || '+91 98202 54321'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : currentUser.role === 'BUYER' || currentUser.role === 'DONEE' ? (
                      /* Buyer's Own Facility View */
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>XYZ Foundation & STEM Academy</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-800">
                          {selectedShipment.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Carrier will deliver the consignment directly to your receiving bay.
                        </p>
                      </div>
                    ) : (
                      /* Seller View: Protected Anonymized Hub */
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono italic text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            [Confidential Verified Buyer]
                          </span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{selectedShipment.destinationHub}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Buyer identity & facility destination are protected to maintain counterparty commercial anonymity. Carrier completes final delivery.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fleet & Logistics Carrier Details */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedShipment.logisticsPartnerName}</div>
                    <div className="text-slate-500 text-[11px]">
                      Vehicle Type: {selectedShipment.assignedVehicle}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] text-slate-500">
                  <div>Status: Verified Carrier Transit</div>
                  <div className="text-emerald-700 font-medium">GPS Milestone Checkpoint Enabled</div>
                </div>
              </div>

              {/* Milestone Event Feed */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Timeline Checkpoints & Audit Logs
                </h3>

                <div className="space-y-2.5">
                  {selectedShipment.milestones.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.status}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-medium">{log.location}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{log.notes}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-slate-500">{log.updatedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Select a shipment on the left to track progress.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
