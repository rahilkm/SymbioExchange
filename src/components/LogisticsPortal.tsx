import React, { useState } from 'react';
import { Shipment, User } from '../types';
import { store } from '../services/store';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  PhoneCall,
  Calendar,
  AlertCircle,
  Copy,
  ExternalLink,
  Check,
  Building,
  Package
} from 'lucide-react';

interface LogisticsPortalProps {
  currentUser: User;
  onNavigateToShipments: () => void;
}

function cleanLogisticsShipment(s: Shipment): Shipment {
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
}

export const LogisticsPortal: React.FC<LogisticsPortalProps> = ({
  currentUser,
  onNavigateToShipments
}) => {
  const [shipments, setShipments] = useState<Shipment[]>(() =>
    store.getRawShipments().map(cleanLogisticsShipment)
  );
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(() =>
    shipments.length > 0 ? cleanLogisticsShipment(shipments[0]) : null
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      const updated = store.getRawShipments().map(cleanLogisticsShipment);
      setShipments(updated);
      if (selectedShipment) {
        const found = updated.find(s => s.id === selectedShipment.id);
        if (found) setSelectedShipment(cleanLogisticsShipment(found));
      } else if (updated.length > 0) {
        setSelectedShipment(cleanLogisticsShipment(updated[0]));
      }
    });
    return () => unsub();
  }, [selectedShipment]);

  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'>('PICKED_UP');
  const [isUpdating, setIsUpdating] = useState(false);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      setIsUpdating(true);
      await store.updateShipmentMilestone(
        selectedShipment.id,
        selectedMilestone,
        milestoneNotes || `Status updated to ${selectedMilestone}`,
        `${currentUser.organization} Dispatcher`
      );

      const updated = store.getRawShipments();
      setShipments(updated);
      const refreshed = updated.find(s => s.id === selectedShipment.id) || null;
      setSelectedShipment(refreshed);
      setMilestoneNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Carrier Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900 font-display">Carrier Dispatch & Fleet Operations</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Active carrier manifests. Full unredacted pickup (Seller) & dropoff (Buyer) addresses are provided exclusively for dispatch fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
          <span>Active Fleet: {currentUser.organization}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 font-display">Assigned Waybills</h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">{shipments.length} Active</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
              {shipments.map((s) => {
                const isSelected = selectedShipment?.id === s.id;
                const pickupAddr = s.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane';
                const deliveryAddr = s.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune';

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShipment(cleanLogisticsShipment(s))}
                    className={`w-full text-left p-4.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-100/90 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-slate-900">WB-{s.id}</span>
                      <span className="text-[11px] font-semibold text-emerald-700">{s.currentMilestone}</span>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div className="text-[11px] text-slate-700 font-medium">
                        <span className="text-slate-400">Pickup (Seller): </span>
                        <span className="truncate block font-mono text-slate-800">{pickupAddr}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium">
                        <span className="text-slate-400">Dropoff (Buyer): </span>
                        <span className="truncate block font-mono text-slate-800">{deliveryAddr}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>Vehicle: {s.assignedVehicle}</span>
                        <span className="font-semibold text-slate-700">{s.estimatedArrival}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detailed Dispatch Waybill (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedShipment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">WAYBILL #{selectedShipment.id}</span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedShipment.currentMilestone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Carrier: {selectedShipment.logisticsPartnerName} · Vehicle: {selectedShipment.assignedVehicle}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400">ETA Window:</div>
                  <div className="font-semibold text-slate-900">{selectedShipment.estimatedArrival}</div>
                </div>
              </div>

              {/* Exact Unredacted Addresses - Both Seller Pickup and Buyer Delivery visible to Logistics Partner */}
              <div className="bg-slate-100/70 border border-slate-300 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <Navigation className="w-4 h-4 text-slate-700" />
                    <span>Physical Dispatch Manifest (Both Buyer & Seller Addresses Visible)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-200/80 border border-slate-300 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                    Full Unredacted Carrier Access
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Exact Seller Pickup Address Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        <span className="text-slate-900 font-bold text-sm">1. Seller Pickup Facility (Actual Address)</span>
                      </div>
                      <span className="text-slate-800 font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300 font-semibold">
                        Direct Address
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedShipment.sellerOrg || 'Company A Electronics & Industrial Surplus'}</span>
                      </div>
                    </div>

                    {/* Refined Greyish Address Box */}
                    <div className="p-3 bg-slate-100/90 border border-slate-300 rounded-lg space-y-2">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Physical Pickup Address</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              selectedShipment.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302',
                              'seller_address'
                            )}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            {copiedField === 'seller_address' ? (
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
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              selectedShipment.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302'
                            )}`}
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
                        {selectedShipment.exactPickupAddress || 'Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>Seller Dispatch Phone:</span>
                      </span>
                      <a
                        href={`tel:${selectedShipment.sellerContactPhone || '+91 98201 12345'}`}
                        className="font-mono font-bold text-slate-900 hover:text-slate-600"
                      >
                        {selectedShipment.sellerContactPhone || selectedShipment.donorContactPhone || '+91 98201 12345'}
                      </a>
                    </div>
                  </div>

                  {/* Exact Buyer Delivery Address Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        <span className="text-slate-900 font-bold text-sm">2. Buyer Delivery Destination (Actual Address)</span>
                      </div>
                      <span className="text-slate-800 font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300 font-semibold">
                        Direct Address
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedShipment.buyerOrg || 'XYZ Foundation & STEM Academy'}</span>
                      </div>
                    </div>

                    {/* Refined Greyish Address Box */}
                    <div className="p-3 bg-slate-100/90 border border-slate-300 rounded-lg space-y-2">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Physical Delivery Address</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              selectedShipment.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005',
                              'buyer_address'
                            )}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            {copiedField === 'buyer_address' ? (
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
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              selectedShipment.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005'
                            )}`}
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
                        {selectedShipment.exactDeliveryAddress || 'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>Buyer Receiving In-charge:</span>
                      </span>
                      <a
                        href={`tel:${selectedShipment.buyerContactPhone || '+91 98202 54321'}`}
                        className="font-mono font-bold text-slate-900 hover:text-slate-600"
                      >
                        {selectedShipment.buyerContactPhone || selectedShipment.doneeContactPhone || '+91 98202 54321'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone Update Form */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Freight Milestone & Status Notes
                </h3>

                <form onSubmit={handleUpdateMilestone} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Milestone State
                      </label>
                      <select
                        value={selectedMilestone}
                        onChange={(e) => setSelectedMilestone(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="SCHEDULED">SCHEDULED (Assigned at Hub)</option>
                        <option value="PICKED_UP">PICKED_UP (Collected from Seller)</option>
                        <option value="IN_TRANSIT">IN_TRANSIT (On Corridor Route)</option>
                        <option value="DELIVERED">DELIVERED (Signed & Handed Over to Buyer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Driver / Checkpoint Notes
                      </label>
                      <input
                        type="text"
                        value={milestoneNotes}
                        onChange={(e) => setMilestoneNotes(e.target.value)}
                        placeholder="e.g. Inspection completed, toll passed, delivered to receiver"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'Updating...' : 'Commit Milestone Log'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Milestone history logs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Audited Dispatch Event Log
                </h3>

                <div className="space-y-2">
                  {selectedShipment.milestones.map((log, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.status}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">{log.location}</span>
                        </div>
                        <p className="text-slate-700">{log.notes}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 whitespace-nowrap">
                        <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-slate-500 font-medium">{log.updatedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Select a waybill from the list to view dispatch instructions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
