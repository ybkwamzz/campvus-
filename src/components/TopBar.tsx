import React from 'react';
import { Wifi, ShieldAlert, Zap, Radio } from 'lucide-react';

export type ActiveTab = 'pulse' | 'plots' | 'identity' | 'audit' | 'exchange';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (val: boolean) => void;
  onOpenQuickCheckIn: () => void;
  verifiedStudentName: string;
  eigenScore: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  lowBandwidthMode,
  setLowBandwidthMode,
  onOpenQuickCheckIn,
  verifiedStudentName,
  eigenScore
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('pulse')}
            className="text-xl font-extrabold tracking-tighter text-white uppercase hover:text-neutral-300 transition-colors whitespace-nowrap focus:outline-none"
            aria-label="CAMPV/US Home"
          >
            CAMPV/US
          </button>
          <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-400 tracking-wider">
            NAIROBI
          </span>
        </div>

        {/* Zone 2: Navigation links (single line, clean text with underline hover) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400 whitespace-nowrap" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('pulse')}
            className={`transition-colors hover:text-white pb-1 border-b-2 ${
              activeTab === 'pulse' ? 'border-white text-white font-semibold' : 'border-transparent'
            }`}
          >
            Campus Pulse
          </button>
          <button
            onClick={() => setActiveTab('plots')}
            className={`transition-colors hover:text-white pb-1 border-b-2 ${
              activeTab === 'plots' ? 'border-white text-white font-semibold' : 'border-transparent'
            }`}
          >
            The Plots
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`transition-colors hover:text-white pb-1 border-b-2 ${
              activeTab === 'identity' ? 'border-white text-white font-semibold' : 'border-transparent'
            }`}
          >
            ID & Trust
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'border-amber-400 text-amber-300 font-semibold' : 'border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Red Team Audit
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`transition-colors hover:text-white pb-1 border-b-2 ${
              activeTab === 'exchange' ? 'border-white text-white font-semibold' : 'border-transparent'
            }`}
          >
            Exchange & Gems
          </button>
        </nav>

        {/* Zone 3: 1 primary action / controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Low Bandwidth 3G Toggle */}
          <button
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`px-2.5 py-1 text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              lowBandwidthMode
                ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
            title="Toggle Thika Road 3G Low-Bandwidth Mode"
            aria-label="Toggle low bandwidth mode"
          >
            <Wifi className="w-3 h-3" />
            <span className="hidden lg:inline">{lowBandwidthMode ? '3G Matatu Mode: ON' : '3G Mode'}</span>
          </button>

          {/* Quick Check-in CTA */}
          <button
            onClick={onOpenQuickCheckIn}
            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-900 bg-white hover:bg-neutral-200 transition-colors whitespace-nowrap active:scale-95"
          >
            Check In
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar below header for narrow viewports */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800/80 px-2 py-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('pulse')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'pulse' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
        >
          Pulse
        </button>
        <button
          onClick={() => setActiveTab('plots')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'plots' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
        >
          Plots
        </button>
        <button
          onClick={() => setActiveTab('identity')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'identity' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
        >
          ID Card
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'audit' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'}`}
        >
          Red Team
        </button>
        <button
          onClick={() => setActiveTab('exchange')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'exchange' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
        >
          Gear
        </button>
      </div>
    </header>
  );
};
