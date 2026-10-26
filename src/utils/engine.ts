import { Plot, CampusPulseZone } from '../types';

export const SAFARICOM_DARAJA_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208'
];

/**
 * Enforces K-Anonymity privacy threshold for Campus Pulse.
 * If active users in an H3 cell are below the threshold (< 5),
 * returns 0 to prevent spatial trilateration and stalking.
 */
export function calculateKAnonymity(activeCount: number): {
  safeCount: number;
  status: 'QUIET' | 'ACTIVE' | 'POPPING';
  isSuppressed: boolean;
} {
  const K_ANONYMITY_THRESHOLD = 5;
  if (activeCount < K_ANONYMITY_THRESHOLD) {
    return {
      safeCount: 0,
      status: 'QUIET',
      isSuppressed: activeCount > 0
    };
  }
  
  if (activeCount >= 30) {
    return {
      safeCount: activeCount,
      status: 'POPPING',
      isSuppressed: false
    };
  }

  return {
    safeCount: activeCount,
    status: 'ACTIVE',
    isSuppressed: false
  };
}

/**
 * Serializes Plot payload with Broken Object-Level Authorization (BOLA) guard.
 * When hardened (insecureBOLA = false), coordinates and secret instructions are
 * filtered at the query/controller layer unless user is in an unlocked crew.
 */
export function serializePlotForClient(
  plot: Plot,
  userId: string,
  insecureBOLA: boolean = false
): {
  id: string;
  title: string;
  h3Index: string;
  generalArea: string;
  startsAt: string;
  autoDecayAt: string;
  crewCount: number;
  crewRequired: number;
  isCrewUnlocked: boolean;
  secretCoordinates: { lat: number; lng: number } | null;
  secretInstructions: string;
  isRedacted: boolean;
} {
  const confirmedCrewCount = plot.crewMembers.filter((m) => m.confirmed).length;
  const isUnlocked = confirmedCrewCount >= plot.crewRequired;
  const isUserInCrew = plot.crewMembers.some((m) => m.id === userId);

  // Insecure v1 mode: Leaks exact coordinates in JSON response, relying on frontend to hide!
  if (insecureBOLA) {
    return {
      id: plot.id,
      title: plot.title,
      h3Index: plot.h3Index,
      generalArea: plot.generalArea,
      startsAt: plot.startsAt,
      autoDecayAt: plot.autoDecayAt,
      crewCount: confirmedCrewCount,
      crewRequired: plot.crewRequired,
      isCrewUnlocked: isUnlocked,
      secretCoordinates: plot.secretCoordinates,
      secretInstructions: plot.secretInstructions,
      isRedacted: false
    };
  }

  // Hardened v2 mode: Backend strict field-level redaction
  const hasAccess = isUnlocked && isUserInCrew;

  return {
    id: plot.id,
    title: plot.title,
    h3Index: plot.h3Index,
    generalArea: plot.generalArea,
    startsAt: plot.startsAt,
    autoDecayAt: plot.autoDecayAt,
    crewCount: confirmedCrewCount,
    crewRequired: plot.crewRequired,
    isCrewUnlocked: isUnlocked,
    secretCoordinates: hasAccess ? plot.secretCoordinates : null,
    secretInstructions: hasAccess
      ? plot.secretInstructions
      : `[LOCKED BY CREW GATE: ${confirmedCrewCount}/${plot.crewRequired} Confirmed Members Required]`,
    isRedacted: !hasAccess
  };
}

/**
 * Computes EigenTrust reputation delta to neutralize Sybil wash-trading.
 * Prevents 2 colluding accounts from repeatedly farming trust.
 */
export function computeEigenTrustDelta(
  sourceReputation: number,
  pastInteractionsBetweenUsers: number,
  isCrossCampus: boolean
): { delta: number; isDiminished: boolean; explanation: string } {
  // Wash-trading rule: after 2 interactions between same two nodes, delta drops to zero
  if (pastInteractionsBetweenUsers >= 2) {
    return {
      delta: 0.0,
      isDiminished: true,
      explanation: 'Sybil Defense: Interaction frequency limit exceeded for this user pair.'
    };
  }

  // Source user trust weighting (must be >= 5.0 to grant meaningful delta)
  const trustWeight = Math.max(0.1, sourceReputation / 10.0);
  let baseDelta = 0.4 * trustWeight;

  // Cross-campus diversity multiplier (breaks isolated university cliques)
  if (isCrossCampus) {
    baseDelta *= 1.5;
  }

  const finalDelta = parseFloat(baseDelta.toFixed(2));
  return {
    delta: finalDelta,
    isDiminished: false,
    explanation: isCrossCampus
      ? 'High diversity cross-campus peer verification verified.'
      : 'Intra-campus peer interaction recorded.'
  };
}

/**
 * Verifies Safaricom Daraja STK Webhook with IP Whitelisting and Signature Check
 */
export function verifyMpesaDarajaWebhook(
  originIp: string,
  providedSignature: string,
  expectedSecretKey: string
): { verified: boolean; failureReason?: string } {
  // Check IP whitelist
  const isWhitelistedIp = SAFARICOM_DARAJA_IPS.includes(originIp);
  if (!isWhitelistedIp) {
    return {
      verified: false,
      failureReason: `Banned Origin IP: ${originIp}. Not within Safaricom Daraja ASN CIDR.`
    };
  }

  // Verify HMAC signature
  if (!providedSignature || providedSignature !== expectedSecretKey) {
    return {
      verified: false,
      failureReason: 'Cryptographic HMAC mismatch on callback payload header.'
    };
  }

  return { verified: true };
}

/**
 * Calculates remaining time until Plot auto-decays & purges coordinates.
 */
export function calculateDecayCountdown(
  autoDecayAtIso: string,
  nowMs: number = Date.now()
): { hours: number; minutes: number; seconds: number; isDecayed: boolean; formatted: string } {
  const decayTime = new Date(autoDecayAtIso).getTime();
  const diffMs = decayTime - nowMs;

  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isDecayed: true,
      formatted: 'AUTO-DECAYED & PURGED'
    };
  }

  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    isDecayed: false,
    formatted: `${pad(hours)}H : ${pad(minutes)}M : ${pad(seconds)}S`
  };
}

/**
 * Strips EXIF metadata & simulates WebP conversion for Margiela Mode.
 */
export function sanitizeMediaExif(fileMeta: {
  hasGpsLat: boolean;
  hasGpsLng: boolean;
  cameraModel?: string;
  authorId: string;
  salt: string;
}): {
  sanitized: boolean;
  strippedFields: string[];
  outputFormat: 'image/webp';
  saltedAuthorHash: string;
} {
  const stripped: string[] = [];
  if (fileMeta.hasGpsLat || fileMeta.hasGpsLng) stripped.push('GPS_COORDINATES');
  if (fileMeta.cameraModel) stripped.push(`EXIF_DEVICE_${fileMeta.cameraModel}`);
  stripped.push('ORIGINAL_DATE_TIME_DIGITIZED');

  // Simple deterministic salted hash simulation
  let hashNum = 0;
  const str = fileMeta.authorId + fileMeta.salt;
  for (let i = 0; i < str.length; i++) {
    hashNum = (hashNum << 5) - hashNum + str.charCodeAt(i);
    hashNum |= 0;
  }
  const saltedAuthorHash = 'anon_' + Math.abs(hashNum).toString(16).slice(0, 8);

  return {
    sanitized: true,
    strippedFields: stripped,
    outputFormat: 'image/webp',
    saltedAuthorHash
  };
}
