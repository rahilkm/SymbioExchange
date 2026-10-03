import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { User, Role } from './types';
import { Header } from './components/Header';
import { PlatformOverview } from './components/PlatformOverview';
import { SellerPortal } from './components/SellerPortal';
import { BuyerPortal } from './components/BuyerPortal';
import { LogisticsPortal } from './components/LogisticsPortal';
import { ShipmentTrackerView } from './components/ShipmentTrackerView';
import { PrivacyInspectionModal } from './components/PrivacyInspectionModal';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRole = (role: Role) => {
    const allUsers = store.getAllUsers();
    const userForRole = allUsers.find(u => {
      if (role === 'SELLER' || role === 'DONOR') return u.role === 'SELLER' || u.role === 'DONOR';
      if (role === 'BUYER' || role === 'DONEE') return u.role === 'BUYER' || u.role === 'DONEE';
      return u.role === role;
    });

    if (userForRole) {
      store.setCurrentUser(userForRole.id);
      setCurrentUser(userForRole);

      // Auto-navigate to appropriate view for the selected role
      if (role === 'SELLER' || role === 'DONOR') {
        setActiveTab(activeTab === 'logistics' ? 'shipments' : 'seller');
      } else if (role === 'BUYER' || role === 'DONEE') {
        setActiveTab(activeTab === 'logistics' ? 'shipments' : 'buyer');
      } else if (role === 'LOGISTICS') {
        setActiveTab('logistics');
      }
    }
  };

  const isLogistics = currentUser.role === 'LOGISTICS';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Universal Top Bar */}
      <Header
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPrivacyInspector={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <PlatformOverview
            currentUser={currentUser}
            onNavigateToTab={setActiveTab}
            onSelectRole={handleSelectRole}
          />
        )}

        {(activeTab === 'seller' || activeTab === 'donor') && (
          <SellerPortal
            currentUser={currentUser}
            onNavigateToShipments={() => setActiveTab('shipments')}
          />
        )}

        {(activeTab === 'buyer' || activeTab === 'donee') && (
          <BuyerPortal
            currentUser={currentUser}
            onNavigateToShipments={() => setActiveTab('shipments')}
          />
        )}

        {activeTab === 'logistics' && isLogistics && (
          <LogisticsPortal
            currentUser={currentUser}
            onNavigateToShipments={() => setActiveTab('shipments')}
          />
        )}

        {/* If seller or buyer ever navigates to logistics, show Shipment Tracker instead */}
        {activeTab === 'logistics' && !isLogistics && (
          <ShipmentTrackerView
            currentUser={currentUser}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'shipments' && (
          <ShipmentTrackerView
            currentUser={currentUser}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer without demo scenario or reset db */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-display">SymbioExchange</span>
              <span aria-hidden="true">·</span>
              <span>Managed Industrial Resource Exchange Platform</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Counterparty Facility Exposure</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Rules Inspector Modal */}
      <PrivacyInspectionModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
