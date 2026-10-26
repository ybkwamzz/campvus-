/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar, ActiveTab } from './components/TopBar';
import { CampusPulseView } from './components/CampusPulseView';
import { PlotEngineView } from './components/PlotEngineView';
import { IdentityVerificationView } from './components/IdentityVerificationView';
import { RedTeamAuditView } from './components/RedTeamAuditView';
import { ResourceExchangeView } from './components/ResourceExchangeView';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_PLOTS,
  INITIAL_CAMPUS_ZONES,
  RED_TEAM_THREAT_VECTORS,
  INITIAL_RESOURCE_ITEMS,
  INITIAL_KNOWLEDGE_GEMS
} from './data/mockData';
import { Plot, CampusPulseZone, StudentProfile } from './types';
import { Wifi, ShieldCheck, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import { calculateKAnonymity } from './utils/engine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pulse');
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);
  const [selectedAuditVectorKey, setSelectedAuditVectorKey] = useState<string>('BOLA_COORDINATE_LEAK');
  const [showQuickCheckInModal, setShowQuickCheckInModal] = useState<boolean>(false);

  // Core application state
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [zones, setZones] = useState<CampusPulseZone[]>(INITIAL_CAMPUS_ZONES);

  // Handle checking in to an H3 Campus Pulse Zone
  const handleZoneCheckIn = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const newRealCount = z.checkedIn ? z.realActiveCount : z.realActiveCount + 1;
          const { safeCount, status } = calculateKAnonymity(newRealCount);
          return {
            ...z,
            realActiveCount: newRealCount,
            safeActiveCount: safeCount,
            pulseStatus: status,
            checkedIn: true
          };
        }
        return {
          ...z,
          checkedIn: z.id === zoneId
        };
      })
    );
  };

  // Handle joining a Plot Crew (4 required to unlock coordinates)
  const handleJoinCrew = (plotId: string) => {
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId) {
          const alreadyIn = p.crewMembers.some((m) => m.id === studentProfile.id);
          if (alreadyIn) return p;

          const updatedCrew = [
            ...p.crewMembers,
            {
              id: studentProfile.id,
              name: studentProfile.fullName,
              university: studentProfile.university,
              confirmed: true,
              avatarLetter: studentProfile.fullName[0] || 'K'
            }
          ];

          return {
            ...p,
            crewMembers: updatedCrew
          };
        }
        return p;
      })
    );
  };

  // Handle creating a new Plot
  const handleCreatePlot = (newPlotData: Partial<Plot>) => {
    const newPlot: Plot = {
      id: `plot-${Date.now()}`,
      title: newPlotData.title || 'Untitled Plot',
      organizer: {
        id: studentProfile.id,
        name: studentProfile.fullName,
        university: studentProfile.university,
        reputation: studentProfile.eigenTrustScore,
        isMargiela: studentProfile.margielaMode
      },
      category: newPlotData.category || 'Sound System / DJ',
      h3Index: newPlotData.h3Index || '886b402857fffff',
      generalArea: newPlotData.generalArea || 'Westlands / Commercial Ring',
      startsAt: newPlotData.startsAt || new Date(Date.now() + 3600000).toISOString(),
      autoDecayAt: newPlotData.autoDecayAt || new Date(Date.now() + 3600000 * 5).toISOString(),
      crewRequired: 4,
      crewMembers: newPlotData.crewMembers || [],
      secretCoordinates: newPlotData.secretCoordinates || { lat: -1.2683, lng: 36.8044 },
      secretInstructions: newPlotData.secretInstructions || 'Gate instructions redacted.',
      description: newPlotData.description || '',
      ticketPriceKes: newPlotData.ticketPriceKes || 0,
      isArchived: false,
      capacity: newPlotData.capacity || 100
    };

    setPlots((prev) => [newPlot, ...prev]);
  };

  // Profile update handler
  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...updated }));
  };

  // Jump to specific Red Team audit threat vector
  const jumpToAudit = (vectorKey: string) => {
    setSelectedAuditVectorKey(vectorKey);
    setActiveTab('audit');
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col ${lowBandwidthMode ? 'text-sm' : ''}`}>
      {/* Low Bandwidth 3G Mode Status Bar */}
      {lowBandwidthMode && (
        <div className="bg-amber-400 text-neutral-950 text-xs font-mono font-bold px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>THIKA ROAD 3G LOW-DATA CONGESTION MODE ACTIVE</span>
            <span className="hidden sm:inline font-normal">| Background animations, heavy media & telemetry streams paused</span>
          </div>
          <button
            onClick={() => setLowBandwidthMode(false)}
            className="underline text-[11px] hover:text-black uppercase"
          >
            Disable
          </button>
        </div>
      )}

      {/* Top Bar with 3-Zone contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowBandwidthMode={lowBandwidthMode}
        setLowBandwidthMode={setLowBandwidthMode}
        onOpenQuickCheckIn={() => setShowQuickCheckInModal(true)}
        verifiedStudentName={studentProfile.fullName}
        eigenScore={studentProfile.eigenTrustScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'pulse' && (
          <CampusPulseView
            zones={zones}
            onCheckIn={handleZoneCheckIn}
            onOpenAuditForTrilateration={() => jumpToAudit('SPATIAL_TRILATERATION')}
          />
        )}

        {activeTab === 'plots' && (
          <PlotEngineView
            plots={plots}
            currentUserId={studentProfile.id}
            onJoinCrew={handleJoinCrew}
            onCreatePlot={handleCreatePlot}
            onOpenAuditForBola={() => jumpToAudit('BOLA_COORDINATE_LEAK')}
          />
        )}

        {activeTab === 'identity' && (
          <IdentityVerificationView
            profile={studentProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenAuditForMargiela={() => jumpToAudit('EXIF_METADATA_DOXXING')}
            onOpenAuditForDaraja={() => jumpToAudit('MPESA_WEBHOOK_SPOOF')}
          />
        )}

        {activeTab === 'audit' && (
          <RedTeamAuditView
            threatVectors={RED_TEAM_THREAT_VECTORS}
            initialSelectedKey={selectedAuditVectorKey}
          />
        )}

        {activeTab === 'exchange' && (
          <ResourceExchangeView
            items={INITIAL_RESOURCE_ITEMS}
            gems={INITIAL_KNOWLEDGE_GEMS}
            userEigenScore={studentProfile.eigenTrustScore}
            onOpenAuditForEscrow={() => jumpToAudit('MPESA_WEBHOOK_SPOOF')}
          />
        )}
      </main>

      {/* Footer conforming to anti-slop rules (clean copyright and genuine student links) */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold uppercase text-white font-mono">CAMPV/US</span>
            <span aria-hidden="true">·</span>
            <span>Nairobi University Autonomous Coordination Layer</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>UoN · Strathmore · JKUAT · KU · USIU · Daystar</span>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Audit Matrix
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Check-in Modal */}
      {showQuickCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 max-w-md w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white uppercase text-sm">Hardware Attested Check-In</h3>
              </div>
              <button
                onClick={() => setShowQuickCheckInModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <p className="text-neutral-400 leading-relaxed">
              Select your current Nairobi campus or student district. Your check-in will update the K-Anonymous H3 grid and auto-decay in 2 hours.
            </p>

            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    handleZoneCheckIn(zone.id);
                    setShowQuickCheckInModal(false);
                    setActiveTab('pulse');
                  }}
                  className={`w-full p-2.5 border text-left flex items-center justify-between transition-colors ${
                    zone.checkedIn
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-bold">{zone.name}</div>
                    <div className="text-[10px] text-neutral-400">{zone.campus}</div>
                  </div>
                  <span className="text-[11px] font-bold">
                    {zone.checkedIn ? 'CHECKED IN' : 'SELECT'}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowQuickCheckInModal(false)}
                className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
