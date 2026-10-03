import React, { useState } from 'react';
import { Requirement, Match, User, Resource } from '../types';
import { store } from '../services/store';
import { extractHubZone } from '../lib/geo-hub';
import {
  Plus,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

interface BuyerPortalProps {
  currentUser: User;
  onNavigateToShipments: () => void;
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  currentUser,
  onNavigateToShipments
}) => {
  const [requirements, setRequirements] = useState<Requirement[]>(() =>
    store.getRawRequirements().filter(r => (r.buyerId || r.doneeId) === currentUser.id)
  );

  const [availableResources, setAvailableResources] = useState<Resource[]>(() =>
    store.getRawResources().filter(r => r.status === 'AVAILABLE')
  );

  const [selectedReqForMatches, setSelectedReqForMatches] = useState<Requirement | null>(() =>
    requirements.length > 0 ? requirements[0] : null
  );

  const [matches, setMatches] = useState<Match[]>(() =>
    requirements.length > 0 ? store.findMatchesForRequirement(requirements[0].id) : []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<Match | null>(null);
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'matches' | 'market'>('matches');

  // Live Subscription: When seller creates listing, this updates ASAP!
  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      const rawReqs = store.getRawRequirements().filter(r => (r.buyerId || r.doneeId) === currentUser.id);
      const rawRes = store.getRawResources().filter(r => r.status === 'AVAILABLE');
      
      setRequirements(rawReqs);
      setAvailableResources(rawRes);

      if (selectedReqForMatches) {
        const updatedMatches = store.findMatchesForRequirement(selectedReqForMatches.id);
        setMatches(updatedMatches);
      } else if (rawReqs.length > 0) {
        setSelectedReqForMatches(rawReqs[0]);
        setMatches(store.findMatchesForRequirement(rawReqs[0].id));
      }

      setLiveToast('⚡ Live Sync: Supply listings & matching calculations refreshed from backend.');
      setTimeout(() => setLiveToast(null), 4000);
    });

    return () => unsub();
  }, [currentUser, selectedReqForMatches]);

  // Form state
  const [materialName, setMaterialName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [requiredQuantity, setRequiredQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('units');
  const [acceptableState, setAcceptableState] = useState('solid');
  const [maxPrice, setMaxPrice] = useState<number>(8000);
  const [requiredBy, setRequiredBy] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune, Maharashtra 411005'
  );
  const [notes, setNotes] = useState('');

  const liveHub = extractHubZone(deliveryAddress);

  const handleSelectRequirement = (req: Requirement) => {
    setSelectedReqForMatches(req);
    const found = store.findMatchesForRequirement(req.id);
    setMatches(found);
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || requiredQuantity <= 0 || maxPrice <= 0) return;

    try {
      const newReq = await store.createRequirement({
        buyerId: currentUser.id,
        buyerOrg: currentUser.organization,
        doneeId: currentUser.id,
        doneeOrg: currentUser.organization,
        materialName,
        category,
        requiredQuantity,
        unit,
        acceptableState,
        maxPrice,
        requiredBy,
        deliveryAddress,
        notes
      });

      setSelectedReqForMatches(newReq);
      setMatches(store.findMatchesForRequirement(newReq.id));
      setIsModalOpen(false);
      setMaterialName('');
      setLiveToast(`Requirement for "${newReq.materialName}" published and evaluated against active supply!`);
      setTimeout(() => setLiveToast(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to create requirement');
    }
  };

  const handleQuickCreateFromSurplus = (res: Resource) => {
    setMaterialName(res.materialName);
    setCategory(res.category);
    setRequiredQuantity(Math.min(res.quantity, 100));
    setUnit(res.unit);
    setAcceptableState(res.materialState);
    setMaxPrice(Math.round(res.materialCost * 1.25)); // Set ceiling with headroom
    setIsModalOpen(true);
  };

  const handleAcceptMatch = async (match: Match) => {
    try {
      await store.acceptMatch({
        resourceId: match.resourceId,
        requirementId: match.requirementId,
        compatibilityScore: match.compatibilityScore,
        scoreBreakdown: match.scoreBreakdown,
        logisticsCost: match.logisticsCost,
        estimatedDelivery: match.estimatedDelivery
      });

      setSelectedMatchForDetail(null);
      onNavigateToShipments();
    } catch (err: any) {
      alert(err.message || 'Failed to accept match');
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Sync Toast Banner */}
      {liveToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{liveToast}</span>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Buyer Demands & Symbiosis Matching</h1>
            <span className="text-xs text-slate-500 font-mono">({currentUser.organization})</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Specify raw inputs or equipment needs. Our deterministic engine computes compatibility, distances, and freight logistics in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented view switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveView('matches')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === 'matches'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Demands ({requirements.length})
            </button>
            <button
              onClick={() => setActiveView('market')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === 'market'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Supply ({availableResources.length})
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post Requirement</span>
          </button>
        </div>
      </div>

      {/* Main split: Requirements list & Live Matches Explorer OR Available Supply Market */}
      {activeView === 'matches' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requirements list (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 font-display">Your Posted Demands</h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">{requirements.length} postings</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
                {requirements.map((req) => {
                  const isSelected = selectedReqForMatches?.id === req.id;
                  return (
                    <button
                      key={req.id}
                      onClick={() => handleSelectRequirement(req)}
                      className={`w-full text-left p-4.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-100/90 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{req.materialName}</h3>
                        <span className="text-[11px] font-medium text-slate-500">{req.status}</span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Target Need:</span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {req.requiredQuantity} {req.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ceiling Budget:</span>
                          <span className="font-mono font-bold text-emerald-800 tabular-nums">
                            ₹{req.maxPrice.toLocaleString()} / {req.unit} max
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 text-slate-500">
                          <span>Delivery Hub:</span>
                          <span className="text-slate-900 truncate max-w-[140px]">{req.hubZone}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Matched Resources & Score Breakdown (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {selectedReqForMatches ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Active Evaluation Query
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 font-display">
                        {selectedReqForMatches.materialName} ({selectedReqForMatches.requiredQuantity} {selectedReqForMatches.unit})
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Max Budget: ₹{selectedReqForMatches.maxPrice.toLocaleString()}/{selectedReqForMatches.unit}</span>
                        <span aria-hidden="true">·</span>
                        <span>Delivery: {selectedReqForMatches.hubZone}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">
                        {matches.length} Compatible {matches.length === 1 ? 'Match' : 'Matches'} Found
                      </span>
                    </div>
                  </div>

                  {/* Candidate Matches List */}
                  <div className="space-y-4">
                    {matches.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No supply offerings currently meet the hard criteria (compatibility, timing, and price ceiling). When a seller lists matching material, this list updates automatically!
                      </div>
                    ) : (
                      matches.map((match) => {
                        const breakdown = match.scoreBreakdown;
                        return (
                          <div
                            key={match.id}
                            className="border border-slate-200 hover:border-slate-300 rounded-2xl p-5 bg-white shadow-xs transition-all space-y-4"
                          >
                            {/* Match Header: Score + Origin Hub */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                                    {match.compatibilityScore}%
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800">
                                    Deterministic Compatibility Match
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Source Hub: {match.resource?.hubZone}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono text-slate-500 tabular-nums">{breakdown.distanceKm} km route</span>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedMatchForDetail(match)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors self-start sm:self-auto"
                              >
                                <Info className="w-3.5 h-3.5 text-slate-500" />
                                <span>Formula Breakdown</span>
                              </button>
                            </div>

                            {/* 5-factor progress meters */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <div className="text-slate-500">Material (35%)</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                                  {breakdown.materialScore}%
                                </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <div className="text-slate-500">Quantity (20%)</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                                  {breakdown.quantityScore}%
                                </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <div className="text-slate-500">Economics (20%)</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                                  {breakdown.economicScore}%
                                </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <div className="text-slate-500">Distance (15%)</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                                  {breakdown.distanceScore}%
                                </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg col-span-2 sm:col-span-1">
                                <div className="text-slate-500">Timing (10%)</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                                  {breakdown.timeScore}%
                                </div>
                              </div>
                            </div>

                            {/* Itemized Economics & Logistics Strip */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-slate-600" />
                                  <span className="font-bold text-slate-900">{breakdown.carrierName}</span>
                                  <span className="text-slate-500 font-normal">({breakdown.estimatedDelivery})</span>
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  Resource: ₹{breakdown.materialTotalCost.toLocaleString()} + Freight: ₹{breakdown.totalLogisticsCost.toLocaleString()}
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-5">
                                <div className="text-left md:text-right">
                                  <div className="text-[11px] text-slate-400">Total Turnkey Cost:</div>
                                  <div className="font-mono font-bold text-base text-emerald-700 tabular-nums">
                                    ₹{breakdown.totalCombinedCost.toLocaleString()}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleAcceptMatch(match)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer shadow-xs transition-colors"
                                >
                                  <span>Accept Match</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select a requirement on the left to evaluate matches.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Market Catalog View: All Live Supply from Sellers */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Live Available Supply Catalog (Real-Time Supplier Feed)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct live stream of all active materials listed by Sellers across regional industrial hubs.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600">
                {availableResources.length} Active Listings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableResources.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500">
                  No active supply listings in the database.
                </div>
              ) : (
                availableResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{res.category}</span>
                        <span className="font-semibold text-emerald-700">Available</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{res.materialName}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{res.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available Quantity:</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {res.quantity} {res.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Seller Unit Price:</span>
                        <span className="font-mono font-bold text-emerald-700 tabular-nums">
                          ₹{res.materialCost.toLocaleString()} / {res.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Origin Hub:</span>
                        <span className="font-medium text-slate-900">{res.hubZone}</span>
                      </div>

                      <button
                        onClick={() => handleQuickCreateFromSurplus(res)}
                        className="w-full mt-2 py-2 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                        <span>Request This Material</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatchForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">Compatibility Scoring Formula Audit</h3>
                <p className="text-xs text-slate-300 mt-0.5">Deterministic 5-Factor Evaluation Model</p>
              </div>
              <button
                onClick={() => setSelectedMatchForDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-mono font-bold text-lg text-emerald-800 tabular-nums">
                  Composite Score: {selectedMatchForDetail.compatibilityScore}%
                </div>
                <div className="text-emerald-950 font-mono text-[11px] mt-1">
                  0.35×({selectedMatchForDetail.scoreBreakdown.materialScore}) + 0.20×({selectedMatchForDetail.scoreBreakdown.quantityScore}) + 0.20×({selectedMatchForDetail.scoreBreakdown.economicScore}) + 0.15×({selectedMatchForDetail.scoreBreakdown.distanceScore}) + 0.10×({selectedMatchForDetail.scoreBreakdown.timeScore})
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Factor-by-Factor Evaluation
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">1. Material & Chemical Match (35%)</div>
                      <div className="text-[11px] text-slate-500">Category alignment & physical state compatibility</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {selectedMatchForDetail.scoreBreakdown.materialScore}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">2. Quantity Fulfillment Ratio (20%)</div>
                      <div className="text-[11px] text-slate-500">Supply availability vs required demand volume</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {selectedMatchForDetail.scoreBreakdown.quantityScore}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">3. Economic Advantage (20%)</div>
                      <div className="text-[11px] text-slate-500">Savings compared to buyer's maximum price ceiling</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {selectedMatchForDetail.scoreBreakdown.economicScore}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">4. Geographic Distance (15%)</div>
                      <div className="text-[11px] text-slate-500">Corridor hub transit distance ({selectedMatchForDetail.scoreBreakdown.distanceKm} km)</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {selectedMatchForDetail.scoreBreakdown.distanceScore}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">5. Timing & Schedule Feasibility (10%)</div>
                      <div className="text-[11px] text-slate-500">Lead time vs buyer deadline requirement</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {selectedMatchForDetail.scoreBreakdown.timeScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Economic Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Turnkey Commercial Breakdown</h4>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Seller Material Cost:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ₹{selectedMatchForDetail.scoreBreakdown.materialTotalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carrier Freight ({selectedMatchForDetail.scoreBreakdown.carrierName}):</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ₹{selectedMatchForDetail.scoreBreakdown.totalLogisticsCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Landed Price:</span>
                    <span className="font-mono text-emerald-700 text-sm tabular-nums">
                      ₹{selectedMatchForDetail.scoreBreakdown.totalCombinedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMatchForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Requirement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Post Material Requisition</h3>
                <p className="text-xs text-slate-500">Instantly matched against active supplier inventory</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Material / Product *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g. Refurbished Business Laptops, Fly Ash, MS Steel Offcuts"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Acceptable State</label>
                  <select
                    value={acceptableState}
                    onChange={(e) => setAcceptableState(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="solid">Solid</option>
                    <option value="liquid">Liquid</option>
                    <option value="gas">Gas</option>
                    <option value="any">Any / Composite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Needed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(Number(e.target.value))}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Ceiling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required By Date *</label>
                <input
                  type="date"
                  required
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confidential Facility Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete facility or plant address (e.g. Campus 2, STEM Innovation Block, Near Shivaji Nagar, Pune)"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Intended application, purity requirements, receiving dock specifications"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer shadow-xs"
                >
                  Post Demand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
