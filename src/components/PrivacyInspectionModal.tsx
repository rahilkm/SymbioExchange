import React, { useState } from 'react';
import { ShieldCheck, Eye, Lock, MapPin, X, Building, Phone, AlertTriangle } from 'lucide-react';
import { Role } from '../types';

interface PrivacyInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyInspectionModal: React.FC<PrivacyInspectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedPerspective, setSelectedPerspective] = useState<Role>('BUYER');

  if (!isOpen) return null;

  const isBuyerPerspective = selectedPerspective === 'BUYER' || selectedPerspective === 'DONEE';
  const isSellerPerspective = selectedPerspective === 'SELLER' || selectedPerspective === 'DONOR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold font-display">Privacy Redaction & Hub Abstraction Sandbox</h2>
              <p className="text-xs text-slate-300">
                Audit how confidential plant locations and counterparty identities are stripped across user roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perspective Switcher */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Active Viewer Perspective:
          </span>
          <div className="inline-flex rounded-xl bg-slate-200 p-1">
            <button
              onClick={() => setSelectedPerspective('BUYER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isBuyerPerspective
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => setSelectedPerspective('SELLER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isSellerPerspective
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller View
            </button>
            <button
              onClick={() => setSelectedPerspective('LOGISTICS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedPerspective === 'LOGISTICS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logistics Partner View
            </button>
          </div>
        </div>

        {/* Data Field Inspection Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin Entity Data */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Origin / Seller Surplus Details</span>
                {isBuyerPerspective ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                    <Lock className="w-3 h-3" /> Redacted to Safe Hub
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <Eye className="w-3 h-3" /> Visible to {selectedPerspective}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Material Commodity:</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Refurbished Business Laptops (500 units)</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Supplier Organization:</div>
                  <div className="font-mono mt-0.5">
                    {isBuyerPerspective ? (
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic">
                        [REDACTED: Confidential Industrial Partner]
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium">Company A Electronics & Industrial Surplus</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Origin Location / Address:</div>
                  <div className="mt-0.5">
                    {isBuyerPerspective ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Bhiwandi Hub, Mumbai Region</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px]">
                        Plot 45, Bhiwandi Industrial Warehouse Park, Thane, Maharashtra 421302
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Direct Contact Phone:</div>
                  <div className="font-mono mt-0.5">
                    {isBuyerPerspective ? (
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic">
                        [REDACTED: Platform Mediated]
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium">+91 98201 12345</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Entity Data */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Destination / Buyer Requisition Details</span>
                {isSellerPerspective ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                    <Lock className="w-3 h-3" /> Redacted to Safe Hub
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <Eye className="w-3 h-3" /> Visible to {selectedPerspective}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Target Requisition:</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Refurbished Business Laptops (100 units)</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Buyer Organization:</div>
                  <div className="font-mono mt-0.5">
                    {isSellerPerspective ? (
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic">
                        [REDACTED: Protected Institutional Buyer]
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium">XYZ Foundation & STEM Academy</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Dropoff Location / Address:</div>
                  <div className="mt-0.5">
                    {isSellerPerspective ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Pune Bhosari Industrial Hub</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px]">
                        Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune 411005
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Direct Contact Phone:</div>
                  <div className="font-mono mt-0.5">
                    {isSellerPerspective ? (
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic">
                        [REDACTED: Platform Mediated]
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium">+91 98202 54321</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Architecture Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Core Privacy & Logistics Carrier Rule:</span>
            </div>
            Counterparty buyers and sellers never see each other's physical facility addresses or direct contacts. <strong>The authorized logistics partner is granted full unredacted visibility into both physical addresses (Seller Pickup Plant and Buyer Delivery Destination)</strong> to execute freight dispatch, turn-by-turn navigation, and cargo handover.
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
