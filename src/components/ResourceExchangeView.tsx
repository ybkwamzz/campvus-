import React, { useState } from 'react';
import { ResourceExchangeItem, KnowledgeGem } from '../types';
import { Camera, BookOpen, ShieldCheck, Check, Heart, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface ResourceExchangeViewProps {
  items: ResourceExchangeItem[];
  gems: KnowledgeGem[];
  userEigenScore: number;
  onOpenAuditForEscrow: () => void;
}

export const ResourceExchangeView: React.FC<ResourceExchangeViewProps> = ({
  items,
  gems,
  userEigenScore,
  onOpenAuditForEscrow
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gear' | 'gems'>('gear');
  const [selectedItem, setSelectedItem] = useState<ResourceExchangeItem | null>(null);
  const [savedGemIds, setSavedGemIds] = useState<string[]>(
    gems.filter((g) => g.saved).map((g) => g.id)
  );
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const toggleSaveGem = (id: string) => {
    setSavedGemIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const handleRequestRental = (item: ResourceExchangeItem) => {
    setBookingSuccess(`Rental requested for "${item.title}". Split payment initialized via licensed Safaricom PSP rails.`);
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>MONDAY-TO-WEDNESDAY UTILITY ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>CBK-COMPLIANT SPLIT PAYMENTS</span>
              <span aria-hidden="true">·</span>
              <span>EIGENTRUST PEER COLLATERAL</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              Resource Exchange & Campus Gems
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              P2P student equipment sharing and un-googleable campus survival knowledge.
              Compliant split payments avoid the CBK unlicensed escrow trap.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('gear')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                activeSubTab === 'gear' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Gear Exchange ({items.length})
            </button>
            <button
              onClick={() => setActiveSubTab('gems')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                activeSubTab === 'gems' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Campus Hidden Gems ({gems.length})
            </button>
          </div>
        </div>
      </div>

      {/* CBK Compliance Callout Box */}
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Central Bank of Kenya (CBK) Compliance Guard</span>
            <p className="text-neutral-400 text-[11px]">
              CAMPV/US never acts as an unlicensed escrow custodian. Funds are routed via licensed PSP sub-accounts with instant automated split-disbursement.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuditForEscrow}
          className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] shrink-0"
        >
          See M-Pesa Ledger Audit <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Success Notification */}
      {bookingSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-700 p-3 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Subtab: Gear Exchange */}
      {activeSubTab === 'gear' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const hasCollateral = userEigenScore >= item.collateralReputationRequired;

            return (
              <div
                key={item.id}
                className="border border-neutral-800 bg-neutral-900/50 p-5 space-y-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-[10px] uppercase px-1.5 py-0.5 bg-neutral-800 text-neutral-300">
                    {item.category}
                  </span>
                  <span className={item.available ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {item.available ? '● AVAILABLE' : '○ CURRENTLY RENTED'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs text-neutral-400 mt-1">
                    Listed by {item.ownerName} ({item.ownerUniversity.split(' ')[0]}) · Trust: {item.ownerReputation}/10
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex items-baseline justify-between">
                    <span className="text-neutral-400">STUDENT RATE</span>
                    <span className="text-lg font-bold text-white tabular-nums">
                      {item.dailyRateKes} KES <span className="text-xs text-neutral-400 font-normal">/ day</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">EigenTrust Collateral Req:</span>
                    <span className={hasCollateral ? 'text-emerald-400' : 'text-amber-400'}>
                      {item.collateralReputationRequired.toFixed(1)}+ (Yours: {userEigenScore.toFixed(1)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] font-mono text-neutral-400 truncate">
                    📍 {item.locationArea}
                  </span>

                  <button
                    onClick={() => handleRequestRental(item)}
                    disabled={!item.available}
                    className="px-4 py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-400 text-neutral-950 font-mono font-bold text-xs uppercase transition-colors shrink-0"
                  >
                    Request P2P Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab: Campus Hidden Gems */}
      {activeSubTab === 'gems' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gems.map((gem) => {
            const isSaved = savedGemIds.includes(gem.id);

            return (
              <div
                key={gem.id}
                className="border border-neutral-800 bg-neutral-900/50 p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span className="text-[10px] uppercase px-1.5 py-0.5 bg-neutral-800 text-neutral-300">
                      {gem.category}
                    </span>
                    <button
                      onClick={() => toggleSaveGem(gem.id)}
                      className={`text-xs p-1 ${isSaved ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                      aria-label="Save Gem"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {gem.title}
                  </h3>

                  <div className="text-[11px] font-mono text-neutral-400">
                    {gem.campus}
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 border border-neutral-800">
                    "{gem.description}"
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>{gem.verifiedCount} peer upvotes</span>
                  <span className="text-[10px]">By {gem.postedByHash}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
