import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { formatPercentage } from '../../../utils/helpers.js';

export default function TournamentStatistics({ results }) {
  // Calculate total streaks and wins across all fighters
  const totalStreaks = results.fighterStats?.reduce((sum, fighter) => sum + fighter.longestStreak, 0) || 0;
  const totalWins = results.fighterStats?.reduce((sum, fighter) => sum + fighter.totalWins, 0) || 0;

  return (
    <CCard>
      <CCardHeader>
        <h4>📊 Tournament Statistics</h4>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol md={6}>
            <p><strong>Total Fights:</strong> {results.totalFights}</p>
            <p><strong>Total Streaks:</strong> {totalStreaks}</p>
            <p><strong>Total Wins:</strong> {totalWins}</p>
            <p><strong>Total Simuls:</strong> {results.totalSimuls} ({formatPercentage(results.totalSimuls / results.totalFights * 100)})</p>
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