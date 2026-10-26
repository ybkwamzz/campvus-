import React, { useState, useEffect } from 'react';
import { Plot, PlotCrewMember } from '../types';
import { Lock, Unlock, Clock, Users, MapPin, ShieldAlert, Plus, Check, Eye, AlertTriangle, ArrowRight, Code } from 'lucide-react';
import { serializePlotForClient, calculateDecayCountdown } from '../utils/engine';

interface PlotEngineViewProps {
  plots: Plot[];
  currentUserId: string;
  onJoinCrew: (plotId: string) => void;
  onCreatePlot: (newPlot: Partial<Plot>) => void;
  onOpenAuditForBola: () => void;
}

export const PlotEngineView: React.FC<PlotEngineViewProps> = ({
  plots,
  currentUserId,
  onJoinCrew,
  onCreatePlot,
  onOpenAuditForBola
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0].id);
  const [insecureBolaMode, setInsecureBolaMode] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());

  // Form state for creating a new plot
  const [title, setTitle] = useState('');
  const [generalArea, setGeneralArea] = useState('Westlands / Commercial Ring');
  const [category, setCategory] = useState<Plot['category']>('Sound System / DJ');
  const [secretCoords, setSecretCoords] = useState('-1.2683, 36.8044');
  const [secretInstructions, setSecretInstructions] = useState('Gate 3, call Kibo on arrival');
  const [description, setDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);

  // Update live countdown every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const serialized = serializePlotForClient(selectedPlot, currentUserId, insecureBolaMode);
  const decayInfo = calculateDecayCountdown(selectedPlot.autoDecayAt, now);

  const isUserInSelectedCrew = selectedPlot.crewMembers.some((m) => m.id === currentUserId);
  const confirmedCount = selectedPlot.crewMembers.filter((m) => m.confirmed).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const [latStr, lngStr] = secretCoords.split(',').map((s) => s.trim());
    const lat = parseFloat(latStr) || -1.2683;
    const lng = parseFloat(lngStr) || 36.8044;

    onCreatePlot({
      title,
      category,
      generalArea,
      h3Index: '886b402857fffff',
      startsAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
      autoDecayAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      crewRequired: 4,
      crewMembers: [
        {
          id: currentUserId,
          name: 'Kwame Brian Mwangi',
          university: 'University of Nairobi (Main & Chiromo)',
          confirmed: true,
          avatarLetter: 'K'
        }
      ],
      secretCoordinates: { lat, lng },
      secretInstructions,
      description: description || 'Underground student gathering. Coordinates reveal only to locked crew of 4.',
      ticketPriceKes: Number(ticketPrice) || 0,
      capacity: 100
    });

    setShowCreateModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Editorial Overview */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>PROSPECTIVE EVENT PRIMITIVE</span>
              <span aria-hidden="true">·</span>
              <span>4-HOUR POST-EVENT AUTO-PURGE</span>
              <span aria-hidden="true">·</span>
              <span>CREW-LOCK COORDINATE ENCRYPTION</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              The Plot Engine
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Unlike static social posts, a Plot is an auto-decaying coordinate beacon. 
              Sensitive GPS data remains strictly redacted until 4 crew members confirm attendance, neutralizing unauthorized raids and doxxing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Create Plot CTA */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white text-neutral-950 hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Plot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Red Team BOLA / IDOR Mode Switch & Burp Suite Payload Inspector */}
      <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white uppercase">
              BOLA / IDOR Audit Toggle (Module 3 Threat Vector)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">Serialization Engine:</span>
            <button
              onClick={() => setInsecureBolaMode(false)}
              className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
                !insecureBolaMode
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Hardened v2 (Query Redaction)
            </button>
            <button
              onClick={() => setInsecureBolaMode(true)}
              className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
                insecureBolaMode
                  ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Naive v1 (BOLA Leak)
            </button>
          </div>
        </div>

        {/* Live Network Payload Sniffer */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400 text-[10px]">
            <span>GET /api/v1/plots/{selectedPlot.id} (HTTP/2 Response Wire Payload)</span>
            <span className={insecureBolaMode ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {insecureBolaMode ? '⚠ CRITICAL VULNERABILITY DETECTED' : '✓ COORDINATES PROTECTED'}
            </span>
          </div>
          <pre className="text-[11px] overflow-x-auto text-neutral-300 p-2 bg-neutral-900/90 rounded border border-neutral-800">
{JSON.stringify(
  {
    plot_id: serialized.id,
    title: serialized.title,
    h3_zone: serialized.generalArea,
    crew_confirmed: `${serialized.crewCount}/${serialized.crewRequired}`,
    is_crew_unlocked: serialized.isCrewUnlocked,
    secret_coordinates: serialized.secretCoordinates,
    secret_instructions: serialized.secretInstructions
  },
  null,
  2
)}
          </pre>
          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
            <span>
              {insecureBolaMode
                ? 'Notice how coordinates are leaked in the raw JSON response even if the frontend UI hides them!'
                : 'Server-side subquery verifies crew confirmation before returning coordinates in the wire payload.'}
            </span>
            <button
              onClick={onOpenAuditForBola}
              className="text-amber-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              See Red Team Threat Matrix #1 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Plot Selection & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Prospective Plots */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Active Plots ({plots.length})
          </div>

          <div className="space-y-3">
            {plots.map((plot) => {
              const isSelected = selectedPlotId === plot.id;
              const crewConfirmed = plot.crewMembers.filter((m) => m.confirmed).length;
              const isUnlocked = crewConfirmed >= plot.crewRequired;
              const pDecay = calculateDecayCountdown(plot.autoDecayAt, now);

              return (
                <button
                  key={plot.id}
                  onClick={() => setSelectedPlotId(plot.id)}
                  className={`w-full text-left p-4 border transition-all block ${
                    isSelected
                      ? 'border-white bg-neutral-900 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                    <span className="truncate max-w-[180px]">{plot.category}</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono tabular-nums">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {pDecay.formatted}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {plot.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{plot.generalArea}</span>
                  </div>

                  {/* Crew Lock Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className={isUnlocked ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}>
                        {isUnlocked ? 'CREW UNLOCKED' : `CREW LOCK (${crewConfirmed}/${plot.crewRequired})`}
                      </span>
                    </div>

                    <span className="text-white font-mono font-semibold tabular-nums">
                      {plot.ticketPriceKes === 0 ? 'FREE ENTRY' : `${plot.ticketPriceKes} KES`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Plot Dossier & Crew Lock Unlocking */}
        <div className="lg:col-span-7">
          <div className="border border-neutral-800 bg-neutral-900/60 p-6 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                <span>H3 CELL: {selectedPlot.h3Index}</span>
                <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 font-mono text-[10px] uppercase">
                  {selectedPlot.category}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {selectedPlot.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                <span>Organized by {selectedPlot.organizer.name}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedPlot.organizer.university}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-white">Trust: {selectedPlot.organizer.reputation}/10</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-4 border border-neutral-800">
              {selectedPlot.description}
            </p>

            {/* Auto-Decay Countdown Box */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-neutral-400 block">4-HOUR AUTO-DECAY TIMER</span>
                <span className="text-xs text-neutral-400">Media, chat & coordinates will be permanently deleted</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-white tabular-nums tracking-wider bg-neutral-900 px-3 py-1.5 border border-neutral-800">
                {decayInfo.formatted}
              </div>
            </div>

            {/* The Crew Lock Mechanism Box */}
            <div className="p-5 bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  {serialized.isCrewUnlocked ? (
                    <Unlock className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-400" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                      The Crew Lock (Gate Verification)
                    </h4>
                    <span className="text-xs text-neutral-400">
                      Requires 4 confirmed student members to reveal exact secret coordinates
                    </span>
                  </div>
                </div>

                <span className="text-sm font-mono font-extrabold text-white">
                  {confirmedCount} / {selectedPlot.crewRequired} Confirmed
                </span>
              </div>

              {/* Crew Member Stubs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedPlot.crewMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 bg-neutral-900 border border-neutral-800 text-left space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 bg-neutral-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        {member.avatarLetter}
                      </span>
                      {member.confirmed && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{member.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{member.university.split(' ')[0]}</div>
                  </div>
                ))}

                {/* Empty Stubs for remaining crew */}
                {Array.from({ length: Math.max(0, selectedPlot.crewRequired - selectedPlot.crewMembers.length) }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-neutral-900/40 border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center min-h-[70px]"
                  >
                    <span className="text-xs font-mono text-neutral-400">+ Slot Open</span>
                  </div>
                ))}
              </div>

              {/* Join Crew Action */}
              {!isUserInSelectedCrew && confirmedCount < selectedPlot.crewRequired && (
                <button
                  onClick={() => onJoinCrew(selectedPlot.id)}
                  className="w-full py-3 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Crew & Confirm Attendance ({confirmedCount + 1}/{selectedPlot.crewRequired})</span>
                </button>
              )}

              {/* Secret Coordinate Box */}
              <div className="pt-2">
                {serialized.isRedacted ? (
                  <div className="p-4 bg-neutral-900/60 border border-neutral-800 text-center space-y-1">
                    <Lock className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                    <div className="text-xs font-mono text-neutral-300">
                      COORDINATES REDACTED BY THE CREW GATE
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Join the crew or recruit friends. Coordinates will unlock automatically on the 4th confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-600/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                      <span>✓ CREW THRESHOLD SATISFIED — GATE PASS UNLOCKED</span>
                      <span>LAT: {serialized.secretCoordinates?.lat}, LNG: {serialized.secretCoordinates?.lng}</span>
                    </div>

                    <div className="bg-neutral-950 p-3 border border-emerald-800/60">
                      <div className="text-[10px] font-mono text-emerald-400 mb-1">SECRET ACCESS INSTRUCTIONS:</div>
                      <div className="text-sm font-mono text-white">
                        {serialized.secretInstructions}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Prospective Plot */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Initiate Prospective Plot</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">Plot Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Modular Synth Session // Parklands"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white placeholder-neutral-400 focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:border-white focus:outline-none"
                  >
                    <option value="Sound System / DJ">Sound System / DJ</option>
                    <option value="Pop-up Thrift / Bazaar">Pop-up Thrift / Bazaar</option>
                    <option value="Hackathon / Build Night">Hackathon / Build Night</option>
                    <option value="Sunset Rooftop">Sunset Rooftop</option>
                    <option value="Underground Cinema">Underground Cinema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">General Area (H3 Cell)</label>
                  <select
                    value={generalArea}
                    onChange={(e) => setGeneralArea(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:border-white focus:outline-none"
                  >
                    <option value="Westlands / Commercial Ring">Westlands</option>
                    <option value="Madaraka / Strathmore Perimeter">Madaraka (Strathmore)</option>
                    <option value="Chiromo Campus / Riverside Glade">Chiromo (UoN)</option>
                    <option value="Juja Gate C / Hall 6">Juja (JKUAT)</option>
                    <option value="Roysambu Mirema Strip">Roysambu (USIU)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Secret Exact GPS (Redacted until 4 Crew Confirm)</label>
                <input
                  type="text"
                  required
                  placeholder="-1.2683, 36.8044"
                  value={secretCoords}
                  onChange={(e) => setSecretCoords(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white placeholder-neutral-400 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Secret Access Instructions (Redacted)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gate 4, tell watchman 'Omega', 2nd door on left"
                  value={secretInstructions}
                  onChange={(e) => setSecretInstructions(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white placeholder-neutral-400 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description & Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Strict no-camera rules, BYOB, music style..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white placeholder-neutral-400 focus:border-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-neutral-950 font-bold uppercase hover:bg-neutral-200"
                >
                  Deploy Plot Beacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
