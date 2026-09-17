const VERIFICATION_METHODS = Object.freeze({
  EMAIL: 'email',
  DOMAIN: 'domain'
});

function isVerifiedProfile(profile) {
  if (!profile || profile.atIdentity?.status !== 'verified') return false;
  return Boolean(
    profile.evidence?.email?.status === 'verified' ||
    profile.evidence?.domain?.status === 'verified'
  );
}

function verificationLabels(profile) {
  if (!isVerifiedProfile(profile)) return [];
  const labels = [];
  if (profile.evidence?.email?.status === 'verified') labels.push('EMAIL VERIFIED');
  if (profile.evidence?.domain?.status === 'verified') labels.push('DOMAIN VERIFIED');
  return labels;
}

function publicVerificationSummary(profile) {
  return {
    did: profile?.did || null,
    handle: profile?.handle || null,
    status: isVerifiedProfile(profile) ? 'VERIFIED PROFILE' : 'UNVERIFIED',
    methods: verificationLabels(profile)
  };
}

module.exports = {
  VERIFICATION_METHODS,
  isVerifiedProfile,
  verificationLabels,
  publicVerificationSummary
};
