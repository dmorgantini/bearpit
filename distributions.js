const newbieHeavy = {
  1: 0.60,  // 60% complete beginners
  2: 0.25,  // 25% novices
  3: 0.10,  // 10% basic
  4: 0.05   // 5% intermediate
};

const bellCurve = {
  1: 0.15,  // 15% beginners
  2: 0.25,  // 25% novices
  3: 0.30,  // 30% intermediate (peak)
  4: 0.20,  // 20% advanced
  5: 0.08,  // 8% expert
  6: 0.02   // 2% veterans
};

const veteranHeavy = {
  3: 0.20,  // 20% intermediate (lowest attending)
  4: 0.30,  // 30% advanced
  5: 0.25,  // 25% expert
  6: 0.15,  // 15% veteran
  7: 0.08,  // 8% masters
  8: 0.02   // 2% legends
};

const flatDistribution = {
  1: 0.20,
  2: 0.20,
  3: 0.20,
  4: 0.20,
  5: 0.20
};

const twoTier = {
  1: 0.45,  // 45% beginners (workshop attendees)
  2: 0.25,  // 25% novices
  5: 0.20,  // 20% instructors/veterans
  6: 0.10   // 10% head instructors
};

const eliteSmall = {
  5: 0.30,
  6: 0.35,
  7: 0.25,
  8: 0.10
};const pyramid = {
  1: 0.35,
  2: 0.25,
  3: 0.20,
  4: 0.12,
  5: 0.06,
  6: 0.02
};

const matureCommunity = {
  1: 0.20,
  2: 0.20,
  3: 0.18,
  4: 0.15,
  5: 0.12,
  6: 0.08,
  7: 0.05,
  8: 0.02,
  9: 0.005,
  10: 0.005
};

const eliteInvitational = {
  6: 0.30,
  7: 0.25,
  8: 0.20,
  9: 0.15,
  10: 0.10
};

// Test each distribution
export const distributions = [
  { name: 'Newbie Heavy', dist: newbieHeavy },
  { name: 'Bell Curve', dist: bellCurve },
  { name: 'Veteran Heavy', dist: veteranHeavy },
  { name: 'Flat', dist: flatDistribution },
  { name: 'Two Tier', dist: twoTier },
  { name: 'Elite Small', dist: eliteSmall },
  { name: 'Pyramid', dist: pyramid },
  { name: 'Mature Community', dist: matureCommunity },
  { name: 'Elite Invitational', dist: eliteInvitational }
];
