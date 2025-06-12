import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { formatPercentage } from '../../../utils/helpers.js';

export default function TournamentStatistics({ results }) {
  return (
    <CCard>
      <CCardHeader>
        <h4>📊 Tournament Statistics</h4>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol md={6}>
            <p><strong>Total Fights:</strong> {results.totalFights}</p>
            <p><strong>Total Simuls:</strong> {results.totalSimuls} ({formatPercentage(results.totalSimuls / results.totalFights * 100)})</p>
            <p><strong>Round Duration:</strong> {results.roundDuration} minutes</p>
          </CCol>
          <CCol md={6}>
            {results.retirementStreakLength ? (
              <p><strong>Retired Fighters:</strong> {results.retiredCount || 0}/{results.maxRetirements || 3} (retirement slots filled)</p>
            ) : (
              <p><strong>Active Fighters:</strong> {results.fighterStats?.length || 0} (traditional mode)</p>
            )}
            {results.retirementStreakLength && (
              <p><strong>Target Streak:</strong> {results.retirementStreakLength} wins</p>
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}