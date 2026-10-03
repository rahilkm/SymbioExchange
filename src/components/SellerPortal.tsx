import React, { useState } from 'react';
import { Resource, User } from '../types';
import { store } from '../services/store';
import { extractHubZone } from '../lib/geo-hub';
import {
  Plus,
  Box,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Truck
} from 'lucide-react';

interface SellerPortalProps {
  currentUser: User;
  onNavigateToShipments: () => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  currentUser,
  onNavigateToShipments
}) => {
  const [resources, setResources] = useState<Resource[]>(() =>
    store.getRawResources().filter(r => (r.sellerId || r.donorId) === currentUser.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Subscribe to live backend store updates
  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      setResources(store.getRawResources().filter(r => (r.sellerId || r.donorId) === currentUser.id));
    });
    return () => unsub();
  }, [currentUser]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [materialName, setMaterialName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('units');
  const [materialState, setMaterialState] = useState<'solid' | 'liquid' | 'gas' | 'composite'>('solid');
  const [materialCost, setMaterialCost] = useState<number>(5000);
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [pickupAddress, setPickupAddress] = useState('Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Mumbai');
  const [description, setDescription] = useState('');

  // Live extracted hub
  const liveHub = extractHubZone(pickupAddress);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || quantity <= 0 || materialCost <= 0) return;

    try {
      setIsSubmitting(true);
      await store.createResource({
        sellerId: currentUser.id,
        sellerOrg: currentUser.organization,
        donorId: currentUser.id,
        donorOrg: currentUser.organization,
        materialName,
        category,
        quantity,
        unit,
        materialState,
        materialCost,
        availableFrom,
        pickupAddress,
        description
      });

      setSuccessToast(`Successfully published "${materialName}"! Broadcasted to buyer matching engine.`);
      setTimeout(() => setSuccessToast(null), 5000);

      setIsModalOpen(false);
      setMaterialName('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = resources.filter(r => r.status === 'AVAILABLE').length;
  const matchedCount = resources.filter(r => r.status === 'MATCHED' || r.status === 'FULFILLED').length;

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header and Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Seller Inventory & Surplus Supply</h1>
            <span className="text-xs text-slate-500 font-mono">({currentUser.organization})</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Publish industrial byproducts or surplus supply. Exact plant addresses remain confidential; buyers only see regional dispatch hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>List Supply Material</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Active Available Listings</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for automated matching</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Matched & Dispatched</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">{matchedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Assigned to third-party freight carriers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Address Privacy Level</div>
          <div className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hub Mediated (Zero Plant Exposure)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Buyers only view regional dispatch zones</div>
        </div>
      </div>

      {/* Inventory Listings Table/Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-display">Your Active Materials & Byproducts</h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">{resources.length} total records</span>
        </div>

        {resources.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No materials listed yet. Click <strong>"List Supply Material"</strong> above to register surplus inputs or secondary resources.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map((item) => (
              <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.status === 'MATCHED'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">· {item.materialState}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-display">{item.materialName}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">Public Hub:</span>
                        <span>{item.hubZone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Available From: {item.availableFrom}</span>
                      </div>
                    </div>

                    {/* Sensitive Address Alert for Seller */}
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Confidential facility address: {item.pickupAddress} (Hidden from buyers)</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400">Available Volume</div>
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {item.quantity.toLocaleString()} {item.unit}
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400">Target Unit Price</div>
                      <div className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                        ₹{item.materialCost.toLocaleString()} / {item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">List Material or Surplus Input</h3>
                <p className="text-xs text-slate-500">Auto-assigned to regional hub to preserve plant confidentiality</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material or Resource Name *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g. Refurbished Laptops, Class-F Fly Ash, Steel Billets"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Construction Raw Material">Construction Raw Material</option>
                    <option value="Metals & Alloys">Metals & Alloys</option>
                    <option value="Chemicals & Solvents">Chemicals & Solvents</option>
                    <option value="Packaging & Paper">Packaging & Paper</option>
                    <option value="Biomass & Agriculture">Biomass & Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physical State</label>
                  <select
                    value={materialState}
                    onChange={(e) => setMaterialState(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="solid">Solid</option>
                    <option value="liquid">Liquid</option>
                    <option value="gas">Gas</option>
                    <option value="composite">Composite / Mixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="units, tons, kg"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹/Unit) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Start Date
                </label>
                <input
                  type="date"
                  required
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confidential Facility Pickup Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter complete physical address (e.g. Plot 45, Bhiwandi Industrial Warehouse Park, Thane)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-computed Public Hub Zone:</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">{liveHub}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Specification Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include technical specs, condition, packaging type, or handling precautions"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
