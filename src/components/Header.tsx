import React from 'react';
import { User, Role } from '../types';
import { ShieldCheck, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectRole: (role: Role) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPrivacyInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectRole,
  activeTab,
  onSelectTab,
  onOpenPrivacyInspector
}) => {
  const roles: { role: Role; label: string; desc: string }[] = [
    { role: 'BUYER', label: 'Buyer (Procurement)', desc: 'XYZ STEM Academy' },
    { role: 'SELLER', label: 'Seller (Supplier)', desc: 'Company A Surplus' },
    { role: 'LOGISTICS', label: 'Logistics Partner', desc: 'Mum-Pune Express' }
  ];

  // Dynamic Navigation Items strictly tailored by role:
  // Carrier dispatch is available ONLY to LOGISTICS partner.
  // Sellers and Buyers see only their respective inventory/demands and shipment tracking.
  const getNavItems = () => {
    const items = [{ id: 'overview', label: 'Overview' }];

    if (currentUser.role === 'SELLER' || currentUser.role === 'DONOR') {
      items.push({ id: 'seller', label: 'My Surplus Inventory' });
      items.push({ id: 'shipments', label: 'Track Shipments' });
    } else if (currentUser.role === 'BUYER' || currentUser.role === 'DONEE') {
      items.push({ id: 'buyer', label: 'Demands & Matches' });
      items.push({ id: 'shipments', label: 'Track Shipments' });
    } else if (currentUser.role === 'LOGISTICS') {
      items.push({ id: 'logistics', label: 'Carrier Dispatch' });
      items.push({ id: 'shipments', label: 'Track Shipments' });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base font-display shadow-xs group-hover:bg-emerald-600 transition-colors">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors font-display">
                SymbioExchange
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Proper spacing & orientation) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Perspective Selector with clean spacing */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Privacy Rules Trigger */}
            <button
              onClick={onOpenPrivacyInspector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Inspect role-based privacy redaction"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Privacy Rules</span>
            </button>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200" />

            {/* Role Switcher Select with custom Chevron */}
            <div className="relative flex items-center">
              <select
                aria-label="Active Stakeholder Perspective"
                value={currentUser.role === 'DONOR' ? 'SELLER' : currentUser.role === 'DONEE' ? 'BUYER' : currentUser.role}
                onChange={(e) => onSelectRole(e.target.value as Role)}
                className="appearance-none text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              >
                {roles.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar: Only displays allowed role tabs */}
        <div className="md:hidden flex items-center gap-2 py-2.5 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600 whitespace-nowrap">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
