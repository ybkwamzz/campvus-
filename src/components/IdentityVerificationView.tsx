import React, { useState } from 'react';
import { StudentProfile, University } from '../types';
import { ShieldCheck, Smartphone, QrCode, FileText, CheckCircle2, Lock, EyeOff, Camera, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { sanitizeMediaExif } from '../utils/engine';

interface IdentityVerificationViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onOpenAuditForMargiela: () => void;
  onOpenAuditForDaraja: () => void;
}

export const IdentityVerificationView: React.FC<IdentityVerificationViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenAuditForMargiela,
  onOpenAuditForDaraja
}) => {
  const [activeStep, setActiveStep] = useState<number>(3); // 1: OCR, 2: M-Pesa, 3: Completed
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);
  const [ocrSuccess, setOcrSuccess] = useState<boolean>(true);
  const [mpesaPromptSent, setMpesaPromptSent] = useState<boolean>(false);
  const [mpesaVerifying, setMpesaVerifying] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>(profile.phoneNumber);
  const [exifDemoResult, setExifDemoResult] = useState<any>(null);

  const universities: University[] = [
    'University of Nairobi (Main & Chiromo)',
    'Strathmore University (Madaraka)',
    'JKUAT (Juja Main)',
    'Kenyatta University (KU KM)',
    'USIU-Africa (Safari Park)',
    'Daystar University (Valley Road)'
  ];

  const handleSimulateOcr = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOcrSuccess(true);
      setActiveStep(2);
    }, 1200);
  };

  const handleSimulateMpesaStk = () => {
    setMpesaPromptSent(true);
    setMpesaVerifying(true);
    setTimeout(() => {
      setMpesaVerifying(false);
      onUpdateProfile({
        tier: 'fully_verified',
        mpesaTxId: 'TK' + Math.floor(100000 + Math.random() * 900000),
        safaricomLegalName: profile.fullName.toUpperCase()
      });
      setActiveStep(3);
    }, 1800);
  };

  const handleToggleMargiela = () => {
    const nextMargiela = !profile.margielaMode;
    onUpdateProfile({ margielaMode: nextMargiela });

    if (nextMargiela) {
      // Simulate EXIF strip
      const scrubResult = sanitizeMediaExif({
        hasGpsLat: true,
        hasGpsLng: true,
        cameraModel: 'Sony A7 III / iPhone 15',
        authorId: profile.id,
        salt: 'rotating-nairobi-salt-2026'
      });
      setExifDemoResult(scrubResult);
    } else {
      setExifDemoResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>MULTI-TIERED VERIFICATION ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>OCR PHYSICAL CARD + 1 KES SAFARICOM STK</span>
              <span aria-hidden="true">·</span>
              <span>MARGIELA ANONYMITY PROTOCOL</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              Identity & Student Pass
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Bypassing the high-failure rate of university <code className="text-white">.ac.ke</code> mail servers with physical ID scanning and instant Safaricom legal name validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMargiela}
              className={`px-3.5 py-2 text-xs font-mono border transition-colors flex items-center gap-2 ${
                profile.margielaMode
                  ? 'bg-neutral-100 text-neutral-950 font-bold border-white'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Margiela Anonymity: {profile.margielaMode ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Student Pass + Verification State Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Brutalist Digital Student Pass */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-2 border-white bg-neutral-950 p-6 text-white brutalist-dots relative overflow-hidden shadow-2xl">
            {/* Margiela Mode Watermark / Overlay */}
            {profile.margielaMode && (
              <div className="mb-4 p-2 bg-neutral-900 border border-neutral-700 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  MARGIELA MODE ACTIVE
                </span>
                <span className="text-neutral-400">EXIF SCRUBBED</span>
              </div>
            )}

            {/* Header: Institution & Pass Type */}
            <div className="border-b border-neutral-800 pb-4 mb-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                <span>CAMPV/US DIGITAL PASS</span>
                <span>CRYPTOGRAPHIC TOKEN</span>
              </div>
              <div className="text-base font-extrabold uppercase tracking-tight">
                {profile.university}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {profile.faculty}
              </div>
            </div>

            {/* Student Persona Data */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px]">STUDENT LEGAL IDENTITY</span>
                <span className="text-base font-bold text-white tracking-wide">
                  {profile.margielaMode ? profile.pseudonymHash : profile.fullName}
                </span>
                {profile.margielaMode && (
                  <span className="block text-[10px] text-neutral-400">
                    Real identity cryptographically salted with rotating server key
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-neutral-400 block text-[10px]">REGISTRATION NUMBER</span>
                  <span className="text-xs font-bold text-neutral-200">
                    {profile.margielaMode ? 'REG-[SALTED]' : profile.studentIdNumber}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">VERIFICATION TIER</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    TIER 2 (M-PESA + ID)
                  </span>
                </div>
              </div>

              {/* EigenTrust Graph Score Card */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-neutral-400">EIGENTRUST GRAPH SCORE</span>
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {profile.eigenTrustScore.toFixed(1)} <span className="text-xs text-neutral-400">/ 10.0</span>
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                  <span>Cross-Campus Trades: {profile.interCampusTrades}</span>
                  <span>Plots Attended: {profile.verifiedPlotsAttended}</span>
                </div>
              </div>

              {/* Barcode Graphic Representation */}
              <div className="pt-2">
                <div className="h-10 bg-white flex items-center justify-between px-2 text-neutral-950">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-neutral-950"
                      style={{
                        width: (i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px'),
                        marginRight: (i % 2 === 0 ? '1px' : '2px')
                      }}
                    />
                  ))}
                </div>
                <div className="text-[9px] font-mono text-center text-neutral-400 mt-1 tracking-widest">
                  SHA256: 9B208F31C4D...E129
                </div>
              </div>
            </div>
          </div>

          {/* Margiela Mode EXIF Scrubber Live Feedback */}
          {exifDemoResult && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-bold">
                <span className="text-emerald-400">EXIF Stripping Pipeline Simulation</span>
                <span>sharp(file).webp()</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                When Margiela mode is active, uploaded images are re-encoded to WebP, purging GPS latitude/longitude and hardware device identifiers to prevent dorm room triangulation.
              </p>
              <div className="text-[10px] text-neutral-400">
                Purged tags: <span className="text-white">{exifDemoResult.strippedFields.join(', ')}</span>
              </div>
              <button
                onClick={onOpenAuditForMargiela}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-mono pt-1"
              >
                Inspect Threat Vector #6 in Red Team Matrix <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Tiered Verification Machine */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border border-neutral-800 bg-neutral-900/60 p-6 space-y-6">
            <div>
              <span className="text-xs font-mono text-neutral-400 block mb-1">
                ONBOARDING RESILIENCE SPECIFICATION
              </span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Multi-Tier Verification Pipeline
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Kenya university IT barriers solved: OCR physical student card + 1 KES Safaricom M-Pesa STK verification.
              </p>
            </div>

            {/* Stepper */}
            <div className="space-y-4 font-mono text-xs">
              {/* Step 1: Physical Card OCR */}
              <div className={`p-4 border transition-colors ${
                activeStep >= 1 ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-900 bg-neutral-950/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-neutral-950 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span className="font-bold text-white uppercase">Physical Student ID Card OCR</span>
                  </div>
                  {ocrSuccess && (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SCANNED & PARSED
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 mb-3">
                  Camera scans the front of the student ID card. Tesseract extracts name, registration number, and expiry date.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSimulateOcr}
                    disabled={ocrScanning}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs border border-neutral-700 flex items-center gap-1.5"
                  >
                    {ocrScanning ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Scanning ID via OCR...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>Re-Scan Physical ID Card</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-neutral-400">
                    Match: <span className="text-neutral-200">{profile.studentIdNumber}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: M-Pesa 1 KES STK Push Verification */}
              <div className={`p-4 border transition-colors ${
                activeStep >= 2 ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-900 bg-neutral-950/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-neutral-950 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span className="font-bold text-white uppercase">M-Pesa 1 KES Legal Name Validation</span>
                  </div>
                  {profile.tier === 'fully_verified' && (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> DARAJA VERIFIED
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 mb-3">
                  An STK push requests 1 KES via Safaricom Daraja API. The registered legal Safaricom SIM card name is matched against the physical student card.
                </p>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white font-mono text-xs focus:border-white focus:outline-none"
                    />
                    <button
                      onClick={handleSimulateMpesaStk}
                      disabled={mpesaVerifying}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1.5"
                    >
                      {mpesaVerifying ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Waiting for STK PIN...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Trigger 1 KES STK Push</span>
                        </>
                      )}
                    </button>
                  </div>

                  {profile.mpesaTxId && (
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Safaricom Legal Name:</span>
                        <span className="text-emerald-300 font-bold">{profile.safaricomLegalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Daraja Receipt ID:</span>
                        <span className="text-neutral-200">{profile.mpesaTxId}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={onOpenAuditForDaraja}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Inspect Daraja Webhook Anti-Spoofing & TOCTOU Guard in Red Team Matrix <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Optional .ac.ke Fast Track */}
              <div className="p-4 border border-neutral-800 bg-neutral-950">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span className="font-bold text-neutral-300 uppercase">.ac.ke Domain Fast Track (Optional)</span>
                  </div>
                  <span className="text-neutral-400 text-[10px]">NON-BLOCKING</span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Students whose institutional webmail is functional can link their university address for institutional perks.
                </p>
                <div className="text-xs text-neutral-300">
                  Linked: <code className="bg-neutral-900 px-2 py-0.5 border border-neutral-800 text-emerald-400">{profile.academicEmail}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
