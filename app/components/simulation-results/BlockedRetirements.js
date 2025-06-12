import React from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';

export default function BlockedRetirements({ results }) {
  if (!results.blockedRetirements || results.blockedRetirements.length === 0) return null;

  return (
    <CCard className="mb-3 border-warning">
      <CCardHeader className="bg-warning">
        <h5>⚠️ Blocked Retirements (reached {results.retirementStreakLength} wins but cap was full)</h5>
      </CCardHeader>
      <CCardBody>
        {results.blockedRetirements.map((fighter) => (
          <p key={fighter.name} className="mb-1">
            {fighter.name} (Level {fighter.level}) - {fighter.longestStreak} win streak, {fighter.totalFights} total fights
          </p>
        ))}
      </CCardBody>
    </CCard>
  );
}