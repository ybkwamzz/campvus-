export type University =
  | 'University of Nairobi (Main & Chiromo)'
  | 'Strathmore University (Madaraka)'
  | 'JKUAT (Juja Main)'
  | 'Kenyatta University (KU KM)'
  | 'USIU-Africa (Safari Park)'
  | 'Daystar University (Valley Road)';

export type VerificationTier = 'unverified' | 'ocr_scanned' | 'mpesa_verified' | 'fully_verified';

export interface StudentProfile {
  id: string;
  fullName: string;
  studentIdNumber: string;
  university: University;
  faculty: string;
  academicEmail?: string;
  phoneNumber: string;
  safaricomLegalName: string;
  mpesaTxId?: string;
  tier: VerificationTier;
  eigenTrustScore: number; // 0.0 - 10.0
  interCampusTrades: number;
  verifiedPlotsAttended: number;
  margielaMode: boolean; // Anonymous pseudonymized posting with EXIF scrub
  pseudonymHash: string;
  joinedAt: string;
}

export interface PlotCrewMember {
  id: string;
  name: string;
  university: string;
  confirmed: boolean;
  avatarLetter: string;
}

export interface Plot {
  id: string;
  title: string;
  organizer: {
    id: string;
    name: string;
    university: string;
    reputation: number;
    isMargiela: boolean;
  };
  category: 'Sound System / DJ' | 'Pop-up Thrift / Bazaar' | 'Hackathon / Build Night' | 'Sunset Rooftop' | 'Underground Cinema';
  h3Index: string; // e.g. "886b402857fffff"
  generalArea: string; // e.g. "Westlands / Commercial Ring"
  startsAt: string;
  autoDecayAt: string; // ISO timestamp 4h post event
  crewRequired: number;
  crewMembers: PlotCrewMember[];
  secretCoordinates: {
    lat: number;
    lng: number;
  };
  secretInstructions: string;
  description: string;
  ticketPriceKes: number;
  isArchived: boolean;
  capacity: number;
}

export interface CampusPulseZone {
  id: string;
  name: string;
  campus: string;
  h3Cell: string;
  realActiveCount: number;
  safeActiveCount: number; // K-Anonymity filtered: < 5 returns 0
  pulseStatus: 'QUIET' | 'ACTIVE' | 'POPPING';
  vibe: string;
  recentActivity: string;
  checkedIn: boolean;
  lat: number;
  lng: number;
}

export interface ThreatVector {
  id: number;
  key: string;
  title: string;
  targetModule: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  attackSummary: string;
  exploitMechanic: string;
  remediationCode: string;
  sqlSnippet: string;
  vulnerableResponseSample: Record<string, any>;
  hardenedResponseSample: Record<string, any>;
}

export interface ResourceExchangeItem {
  id: string;
  title: string;
  category: 'Cameras & AV' | 'Laptops & Hardware' | 'Calculators & STEM' | 'Lab Gear' | 'Design & Architecture';
  dailyRateKes: number;
  collateralReputationRequired: number;
  ownerName: string;
  ownerUniversity: string;
  ownerReputation: number;
  locationArea: string;
  available: boolean;
  depositHoldKes: number;
}

export interface KnowledgeGem {
  id: string;
  title: string;
  category: 'Budget Food <150 KES' | 'Late Night Printing' | '24/7 Silent Wi-Fi' | 'Matatu Shortcut';
  campus: string;
  description: string;
  verifiedCount: number;
  postedByHash: string;
  saved: boolean;
}
