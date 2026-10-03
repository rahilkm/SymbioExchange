import React from 'react';
import { ArrowRight, ShieldCheck, Cpu, RefreshCw, Truck } from 'lucide-react';
import { User, Role } from '../types';

interface PlatformOverviewProps {
  currentUser: User;
  onNavigateToTab: (tab: string) => void;
  onSelectRole: (role: Role) => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  currentUser,
  onNavigateToTab,
  onSelectRole
}) => {
  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>B2B Industrial Symbiosis & Managed Exchange</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display text-balance leading-tight">
              Unlock the Economic Value of Industrial Surplus Without Exposing Private Facilities
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
              Connect surplus materials, byproducts, and equipment with industrial buyers. Our deterministic 5-factor matching engine evaluates compatibility, quantity, pricing, and timing while coordinating turnkey freight through privacy-safe regional hubs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTab('buyer')}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <span>Explore Requirements & Matches</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>

              <button
                onClick={() => onNavigateToTab('seller')}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
              >
                <span>Post Surplus Inventory</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Zero-Pill Quiet Proof Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <div className="font-mono text-xl md:text-2xl font-bold text-white tabular-nums">840+ t</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Byproducts Diverted</div>
              </div>
              <div>
                <div className="font-mono text-xl md:text-2xl font-bold text-emerald-400 tabular-nums">94.5%</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Peak Match Compatibility</div>
              </div>
              <div>
                <div className="font-mono text-xl md:text-2xl font-bold text-white tabular-nums">₹0</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Facility Leakage Risk</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-2xl relative group">
              <img
                src="/src/assets/images/hero_industrial_symbiosis_1790416998090.jpg"
                alt="Modern sustainable industrial logistics park"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-xs text-slate-200">
                  <div className="font-bold text-white">Western Maharashtra Symbiosis Network</div>
                  <div className="text-[11px] text-slate-400">Bhiwandi · Andheri · Bhosari · Chakan Industrial Corridors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Architectural Pillars */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            The Three Invariants of the Exchange Platform
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Engineered specifically to solve the friction points of secondary industrial resource trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">01. Privacy by Design & Hub Mediated</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyers and sellers never see counterparty physical addresses, phone numbers, or corporate facility locations. Raw street addresses are abstracted into regional Hub Zones (e.g. Bhiwandi Hub, Pune Zone). Only assigned logistics carriers view exact dispatch coordinates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">02. Deterministic 5-Factor Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict mathematical model: 35% Material & State compatibility, 20% Quantity fit, 20% Economic margin feasibility, 15% Logistics distance decay, and 10% Temporal alignment. Filters out any candidate failing hard feasibility constraints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">03. Turnkey Freight & Milestone Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated carrier pricing model: Base Price + (perKm × Distance). Automatically provisions dispatch manifests and updates interactive milestone trackers (Scheduled → Picked Up → In Transit → Delivered).
            </p>
          </div>
        </div>
      </section>

      {/* Featured Symbiosis Categories Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Active Symbiosis Material Flows</h2>
            <p className="text-xs text-slate-600 mt-0.5">High-volume streams currently brokered on the network</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Electronics */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/category_electronics_surplus_1790417012119.jpg"
                alt="Surplus enterprise electronics in warehouse"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Electronics & Hardware</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">500 units listed</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Refurbished Enterprise Computing</h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                Factory-tested working laptops, workstations, and network switches diverted from electronic waste to educational institutions.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-emerald-700 tabular-nums">₹6,000 / unit</span>
                <button
                  onClick={() => onNavigateToTab('buyer')}
                  className="text-slate-900 font-semibold hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Evaluate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Fly Ash & Bulk Minerals */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/category_industrial_materials_1790417025492.jpg"
                alt="Industrial Class-F Fly Ash in storage"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Construction Raw Material</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">200 tons listed</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Class-F Fly Ash Byproduct</h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                Pozzolanic additive from thermal power generation directly replacing virgin clinker in green concrete block manufacturing.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-emerald-700 tabular-nums">₹950 / ton</span>
                <button
                  onClick={() => onNavigateToTab('buyer')}
                  className="text-slate-900 font-semibold hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Evaluate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Freight Corridor */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/carrier_freight_corridor_1790417035448.jpg"
                alt="Expressway freight truck corridor"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Integrated Logistics</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">3 Carriers</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Mumbai–Pune Industrial Corridor</h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                Dedicated 1-ton and 10-ton flatbed fleets with automated pricing (Base ₹2,000 + ₹30/km) and 1–2 business day delivery.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-emerald-700 tabular-nums">₹6,500 standard run</span>
                <button
                  onClick={() => {
                    const isLogistics = currentUser.role === 'LOGISTICS';
                    onNavigateToTab(isLogistics ? 'logistics' : 'shipments');
                  }}
                  className="text-slate-900 font-semibold hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentUser.role === 'LOGISTICS' ? 'Carrier Dispatch' : 'Track Shipments'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Portal Switcher Banner */}
      <section className="bg-slate-100 p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-display">Experience Different Stakeholder Roles</h2>
          <p className="text-xs text-slate-600 mt-1">
            Toggle your active lens in one click to audit the platform from any user's perspective:
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              onSelectRole('SELLER');
              onNavigateToTab('seller');
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Seller (Supplier) View
          </button>
          <button
            onClick={() => {
              onSelectRole('BUYER');
              onNavigateToTab('buyer');
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Buyer (Procurement) View
          </button>
          <button
            onClick={() => {
              onSelectRole('LOGISTICS');
              onNavigateToTab('logistics');
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Logistics Partner View
          </button>
        </div>
      </section>
    </div>
  );
};
