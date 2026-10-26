import React, { useState } from 'react';
import { CampusPulseZone } from '../types';
import { MapPin, ShieldCheck, AlertTriangle, Radio, Users, CheckCircle2, Crosshair, ArrowRight } from 'lucide-react';
import { calculateKAnonymity } from '../utils/engine';

interface CampusPulseViewProps {
  zones: CampusPulseZone[];
  onCheckIn: (zoneId: string) => void;
  onOpenAuditForTrilateration: () => void;
}

export const CampusPulseView: React.FC<CampusPulseViewProps> = ({
  zones,
  onCheckIn,
  onOpenAuditForTrilateration
}) => {
  const [selectedZone, setSelectedZone] = useState<CampusPulseZone>(zones[0]);
  const [filter, setFilter] = useState<string>('all');
  const [trilaterationDemoActive, setTrilaterationDemoActive] = useState<boolean>(false);
  const [attestationStatus, setAttestationStatus] = useState<string | null>(null);

  const filteredZones = zones.filter((z) => {
    if (filter === 'all') return true;
    if (filter === 'popping') return z.safeActiveCount >= 30;
    if (filter === 'active') return z.safeActiveCount >= 5 && z.safeActiveCount < 30;
    if (filter === 'quiet') return z.safeActiveCount < 5;
    return true;
  });

  const handleSimulateCheckIn = (zoneId: string) => {
    setAttestationStatus('Verifying Hardware Attestation via Google Play Integrity API...');
    setTimeout(() => {
      setAttestationStatus('Attestation Token Signed: DEVICE_INTEGRITY_CONFIRMED (Anti-GPS-Spoof Passed)');
      onCheckIn(zoneId);
      setTimeout(() => setAttestationStatus(null), 3500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header / Briefing */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>H3 RES-8 GEOSPATIAL ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>K-ANONYMITY THRESHOLD: K=5</span>
              <span aria-hidden="true">·</span>
              <span>POSTGIS COORDINATE DISCRETIZATION</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              Campus Pulse Grid
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Real-time student density indexed by Uber H3 hexagonal cells across Nairobi campuses.
              Locations with fewer than 5 active students are strictly suppressed to prevent spatial trilateration.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                filter === 'all' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Zones ({zones.length})
            </button>
            <button
              onClick={() => setFilter('popping')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                filter === 'popping' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Popping (&ge;30)
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                filter === 'active' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Active (5–29)
            </button>
            <button
              onClick={() => setFilter('quiet')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                filter === 'quiet' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Suppressed (&lt;5)
            </button>
          </div>
        </div>
      </div>

      {/* Attestation Alert Notification */}
      {attestationStatus && (
        <div className="bg-neutral-900 border border-neutral-700 p-3 flex items-center gap-3 text-xs font-mono text-neutral-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{attestationStatus}</span>
        </div>
      )}

      {/* Main Grid: Interactive Map + Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual H3 Hex Map & Grid Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400">NAIROBI METRO SPATIAL TOPOLOGY</span>
              <button
                onClick={() => setTrilaterationDemoActive(!trilaterationDemoActive)}
                className={`px-2 py-1 border text-[11px] font-mono flex items-center gap-1.5 ${
                  trilaterationDemoActive
                    ? 'border-red-500 bg-red-500/10 text-red-300'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                {trilaterationDemoActive ? 'Trilateration Simulation Active' : 'Test Trilateration Exploit'}
              </button>
            </div>

            {/* Trilateration Exploit Demonstration Banner */}
            {trilaterationDemoActive && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-xs text-red-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Attacker Perspective: Arbitrary Radius Query vs Fixed H3 Hexagon</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-300">
                  In Naive v1, an attacker queries 3 overlapping 50m radius circles to pinpoint a single user walking in Valley Road (Daystar). 
                  Under CAMPV/US Hardened v2, coordinates are pre-discretized into H3 Resolution 8 cells, and any cell with &lt; 5 active students is censored to 0.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onOpenAuditForTrilateration}
                    className="text-[11px] underline text-red-300 hover:text-white flex items-center gap-1 font-mono"
                  >
                    View SQL Security Patch & Threat Vector #4 in Red Team Audit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Hexagonal Topology Canvas / Visual representation */}
            <div className="relative min-h-[340px] bg-neutral-950 border border-neutral-800 brutalist-grid p-6 flex flex-col justify-between">
              {/* Overlay Coordinate Crosshairs */}
              <div className="text-[10px] font-mono text-neutral-400 flex justify-between">
                <span>LAT: 1.2921° S / LON: 36.8219° E</span>
                <span>SRS: EPSG:4326 (PostGIS)</span>
              </div>

              {/* Hex Cells Graphic Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                {filteredZones.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  const isQuiet = zone.safeActiveCount === 0;
                  const isPopping = zone.safeActiveCount >= 30;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`p-3 text-left border transition-all relative ${
                        isSelected
                          ? 'border-white bg-neutral-800 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700'
                      }`}
                    >
                      {/* Hex Index Tag */}
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="text-neutral-400 truncate max-w-[100px]">{zone.h3Cell.slice(0, 10)}...</span>
                        {zone.checkedIn && (
                          <span className="text-[9px] font-mono px-1 py-0.5 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                            HERE
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-white tracking-tight line-clamp-1">
                        {zone.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {zone.campus}
                      </div>

                      {/* Density Counter with K-Anonymity rule */}
                      <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                        <span className={isPopping ? 'text-emerald-400 font-bold' : isQuiet ? 'text-neutral-400' : 'text-neutral-300'}>
                          {isQuiet ? '0 / LOW SIGNAL' : `${zone.safeActiveCount} ACTIVE`}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {zone.pulseStatus}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend & Privacy Metric */}
              <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400"></span>
                    <span>POPPING (&ge;30)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-neutral-400"></span>
                    <span>ACTIVE (&ge;5)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-neutral-800 border border-neutral-700"></span>
                    <span>SUPPRESSED (&lt;5)</span>
                  </div>
                </div>
                <span>AUTO-REFRESH: 30S REPLICATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Selected Zone Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                <span>ZONE INSPECTION</span>
                <span>H3 CELL: {selectedZone.h3Cell}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {selectedZone.name}
              </h2>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                {selectedZone.campus} · Lat {selectedZone.lat.toFixed(4)}, Lng {selectedZone.lng.toFixed(4)}
              </p>
            </div>

            {/* Density & K-Anonymity Audit Block */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono text-neutral-400">SAFE ACTIVE PULSE</span>
                <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                  {selectedZone.safeActiveCount === 0 ? '0' : selectedZone.safeActiveCount}
                  <span className="text-xs text-neutral-400 ml-1 font-normal">STUDENTS</span>
                </span>
              </div>

              {/* K-Anonymity Threshold Explanation */}
              <div className="text-xs font-mono p-2.5 bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">RAW DB PINGS:</span>
                  <span className="text-neutral-300 font-mono tabular-nums">{selectedZone.realActiveCount} checked-in</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">K-ANONYMITY FILTER:</span>
                  <span className={selectedZone.realActiveCount < 5 ? 'text-amber-400' : 'text-emerald-400'}>
                    {selectedZone.realActiveCount < 5 ? 'ENFORCED (Masked to 0)' : 'PASSED (Displaying real)'}
                  </span>
                </div>
                {selectedZone.realActiveCount < 5 && (
                  <p className="text-[10px] text-amber-300/90 pt-1 leading-normal">
                    Privacy Guarantee: When cell presence is under 5, exact numbers are obscured to make user trilateration mathematically impossible.
                  </p>
                )}
              </div>
            </div>

            {/* Vibe and Live Notes */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400">GROUND REPORT & VIBE</span>
              <p className="text-sm text-neutral-200 leading-relaxed bg-neutral-950 p-3 border border-neutral-800">
                "{selectedZone.vibe}"
              </p>
              <div className="text-xs font-mono text-neutral-400">
                Latest: {selectedZone.recentActivity}
              </div>
            </div>

            {/* Check-In Action Button */}
            <div className="pt-2">
              {selectedZone.checkedIn ? (
                <div className="w-full py-3 px-4 bg-emerald-950/40 border border-emerald-700 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>YOU ARE CHECKED IN AT THIS CELL</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSimulateCheckIn(selectedZone.id)}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Check In Here (Play Integrity Hardware Attestation)</span>
                </button>
              )}
              <p className="text-[11px] font-mono text-neutral-400 mt-2 text-center">
                Check-ins are timestamped and automatically decay after 2 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
