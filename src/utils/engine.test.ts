import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKAnonymity,
  serializePlotForClient,
  computeEigenTrustDelta,
  verifyMpesaDarajaWebhook,
  calculateDecayCountdown,
  sanitizeMediaExif,
  SAFARICOM_DARAJA_IPS
} from './engine';
import { Plot } from '../types';

const mockPlot: Plot = {
  id: 'plot-101',
  title: 'Underground Electronic Sound System // Alchemist Backyard',
  organizer: {
    id: 'user-organizer',
    name: 'Kibo & Mutua',
    university: 'University of Nairobi (Main & Chiromo)',
    reputation: 9.2,
    isMargiela: false
  },
  category: 'Sound System / DJ',
  h3Index: '886b402857fffff',
  generalArea: 'Westlands / Parklands Corridor',
  startsAt: new Date(Date.now() + 3600000).toISOString(),
  autoDecayAt: new Date(Date.now() + 3600000 * 5).toISOString(),
  crewRequired: 4,
  crewMembers: [
    { id: 'user-1', name: 'Wanjiku K.', university: 'Strathmore University (Madaraka)', confirmed: true, avatarLetter: 'W' },
    { id: 'user-2', name: 'Otieno B.', university: 'University of Nairobi (Main & Chiromo)', confirmed: true, avatarLetter: 'O' },
    { id: 'user-3', name: 'Mwangi D.', university: 'JKUAT (Juja Main)', confirmed: true, avatarLetter: 'M' }
    // Note: only 3 confirmed! Required is 4.
  ],
  secretCoordinates: { lat: -1.2683, lng: 36.8044 },
  secretInstructions: 'Gate 4, ask for Kevin, password: KIBERA',
  description: 'Pure vinyl set. Strict no-phone dance floor.',
  ticketPriceKes: 300,
  isArchived: false,
  capacity: 120
};

test('calculateKAnonymity enforces threshold < 5 and returns 0 / QUIET', () => {
  const resultLow = calculateKAnonymity(3);
  assert.equal(resultLow.safeCount, 0);
  assert.equal(resultLow.status, 'QUIET');
  assert.equal(resultLow.isSuppressed, true);

  const resultActive = calculateKAnonymity(12);
  assert.equal(resultActive.safeCount, 12);
  assert.equal(resultActive.status, 'ACTIVE');

  const resultPopping = calculateKAnonymity(45);
  assert.equal(resultPopping.safeCount, 45);
  assert.equal(resultPopping.status, 'POPPING');
});

test('serializePlotForClient redacts coordinates when BOLA guard is active and crew is incomplete', () => {
  // Crew is 3/4. Hardened mode.
  const serialized = serializePlotForClient(mockPlot, 'user-1', false);
  assert.equal(serialized.secretCoordinates, null);
  assert.equal(serialized.isRedacted, true);
  assert.match(serialized.secretInstructions, /LOCKED BY CREW GATE/);
});

test('serializePlotForClient leaks coordinates in naive insecure BOLA mode', () => {
  // Vulnerable v1 check
  const serialized = serializePlotForClient(mockPlot, 'user-unauthorized', true);
  assert.notEqual(serialized.secretCoordinates, null);
  assert.equal(serialized.secretCoordinates?.lat, -1.2683);
  assert.equal(serialized.secretInstructions, 'Gate 4, ask for Kevin, password: KIBERA');
  assert.equal(serialized.isRedacted, false);
});

test('serializePlotForClient unlocks coordinates once crew threshold is met and user is a confirmed member', () => {
  const unlockedPlot: Plot = {
    ...mockPlot,
    crewMembers: [
      ...mockPlot.crewMembers,
      { id: 'user-4', name: 'Faith N.', university: 'USIU-Africa (Safari Park)', confirmed: true, avatarLetter: 'F' }
    ]
  };

  // User 1 is in the crew of 4/4
  const serialized = serializePlotForClient(unlockedPlot, 'user-1', false);
  assert.equal(serialized.isRedacted, false);
  assert.notEqual(serialized.secretCoordinates, null);
  assert.equal(serialized.secretCoordinates?.lat, -1.2683);
});

test('computeEigenTrustDelta penalizes wash-trading between same accounts', () => {
  const firstTrade = computeEigenTrustDelta(8.0, 0, false);
  assert.equal(firstTrade.isDiminished, false);
  assert.ok(firstTrade.delta > 0);

  // 3rd trade between same users: drops to zero
  const sybilAttempt = computeEigenTrustDelta(8.0, 3, false);
  assert.equal(sybilAttempt.delta, 0.0);
  assert.equal(sybilAttempt.isDiminished, true);
});

test('verifyMpesaDarajaWebhook rejects unauthorized IP and spoofed signatures', () => {
  const spoofedIp = '45.33.32.156'; // Attacker IP
  const resultBadIp = verifyMpesaDarajaWebhook(spoofedIp, 'correct-sig', 'correct-sig');
  assert.equal(resultBadIp.verified, false);
  assert.match(resultBadIp.failureReason!, /Banned Origin IP/);

  const genuineIp = SAFARICOM_DARAJA_IPS[0];
  const resultBadSig = verifyMpesaDarajaWebhook(genuineIp, 'forged-hash', 'correct-sig');
  assert.equal(resultBadSig.verified, false);
  assert.match(resultBadSig.failureReason!, /HMAC mismatch/);

  const resultValid = verifyMpesaDarajaWebhook(genuineIp, 'secret-hash-key', 'secret-hash-key');
  assert.equal(resultValid.verified, true);
});

test('sanitizeMediaExif strips GPS and camera metadata', () => {
  const sanitized = sanitizeMediaExif({
    hasGpsLat: true,
    hasGpsLng: true,
    cameraModel: 'iPhone 15 Pro',
    authorId: 'usr-9281',
    salt: 'campvus-salt-2026'
  });

  assert.equal(sanitized.sanitized, true);
  assert.ok(sanitized.strippedFields.includes('GPS_COORDINATES'));
  assert.ok(sanitized.saltedAuthorHash.startsWith('anon_'));
  assert.equal(sanitized.outputFormat, 'image/webp');
});

test('calculateDecayCountdown correctly calculates remaining hours and expired state', () => {
  const futureIso = new Date(Date.now() + 7200000).toISOString(); // +2 hours
  const countdown = calculateDecayCountdown(futureIso);
  assert.equal(countdown.isDecayed, false);
  assert.equal(countdown.hours, 2);

  const pastIso = new Date(Date.now() - 5000).toISOString();
  const expired = calculateDecayCountdown(pastIso);
  assert.equal(expired.isDecayed, true);
  assert.equal(expired.formatted, 'AUTO-DECAYED & PURGED');
});
