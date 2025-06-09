
import React from 'react';
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge } from '@coreui/react';
import { formatTime, formatPercentage } from '../../utils/helpers.js';

export default function SimulationResults({ results }) {
  if (!results) {
    return (
      <CCard>
        <CCardBody>
          <p>No results yet. Run a tournament to see results.</p>
        </CCardBody>
      </CCard>
    );
  }

  const getBadgeColor = (place) => {
    switch (place) {
      case 1: return 'warning'; // Gold
      case 2: return 'secondary'; // Silver
      case 3: return 'dark'; // Bronze
      default: return 'light';
    }
  };

  return (
    <div>
      {/* Winner Section */}
      {results.overallWinner && (
        <CCard className="mb-3">
          <CCardHeader>
            <h4>🏆 Tournament Winner</h4>
          </CCardHeader>
          <CCardBody>
            <h5>{results.overallWinner.name} (Level {results.overallWinner.level})</h5>
            <p>
              Longest Streak: {results.overallWinner.longestStreak} | 
              Total Wins: {results.overallWinner.totalWins} | 
              Win Rate: {formatPercentage(results.overallWinner.winRate)}
            </p>
          </CCardBody>
        </CCard>
      )}

      {/* Retirement Results */}
      {results.retiredFighters && results.retiredFighters.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <h4>🏁 Retirement Race Results</h4>
          </CCardHeader>
          <CCardBody>
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Place</CTableHeaderCell>
                  <CTableHeaderCell>Fighter</CTableHeaderCell>
                  <CTableHeaderCell>Level</CTableHeaderCell>
                  <CTableHeaderCell>Retirement Time</CTableHeaderCell>
                  <CTableHeaderCell>Fights</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {results.retiredFighters
                  .sort((a, b) => a.retiredAt - b.retiredAt)
                  .map((fighter, index) => (
                    <CTableRow key={fighter.name}>
                      <CTableDataCell>
                        <CBadge color={getBadgeColor(index + 1)}>
                          {index + 1}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{fighter.name}</CTableDataCell>
                      <CTableDataCell>{fighter.level}</CTableDataCell>
                      <CTableDataCell>{formatTime(fighter.retiredAt)}</CTableDataCell>
                      <CTableDataCell>{fighter.retiredAfterFights}</CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {/* Top Fighters */}
      <CCard className="mb-3">
        <CCardHeader>
          <h4>🏅 Top Fighters</h4>
        </CCardHeader>
        <CCardBody>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Rank</CTableHeaderCell>
                <CTableHeaderCell>Fighter</CTableHeaderCell>
                <CTableHeaderCell>Level</CTableHeaderCell>
                <CTableHeaderCell>Longest Streak</CTableHeaderCell>
                <CTableHeaderCell>W/L/S</CTableHeaderCell>
                <CTableHeaderCell>Win Rate</CTableHeaderCell>
                <CTableHeaderCell>Time in Pit</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {results.topFourFighters?.map((fighter) => (
                <CTableRow key={fighter.name}>
                  <CTableDataCell>
                    <CBadge color={getBadgeColor(fighter.rank)}>
                      {fighter.rank}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {fighter.name}
                    {fighter.earnedAward && ' 🏆'}
                  </CTableDataCell>
                  <CTableDataCell>{fighter.level}</CTableDataCell>
                  <CTableDataCell>{fighter.longestStreak}</CTableDataCell>
                  <CTableDataCell>
                    {fighter.totalWins}/{fighter.totalLosses}/{fighter.totalSimuls}
                  </CTableDataCell>
                  <CTableDataCell>{formatPercentage(fighter.winRate)}</CTableDataCell>
                  <CTableDataCell>{formatTime(fighter.timeInPit)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Tournament Statistics */}
      <CCard>
        <CCardHeader>
          <h4>📊 Tournament Statistics</h4>
        </CCardHeader>
        <CCardBody>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Total Fights:</strong> {results.totalFights}</p>
              <p><strong>Total Simuls:</strong> {results.totalSimuls} ({formatPercentage(results.totalSimuls / results.totalFights)})</p>
              <p><strong>Round Duration:</strong> {results.roundDuration} minutes</p>
            </div>
            <div className="col-md-6">
              {results.retiredCount !== undefined && (
                <p><strong>Retired Fighters:</strong> {results.retiredCount}/{results.maxRetirements || 3}</p>
              )}
              <p><strong>Active Fighters:</strong> {results.fighterStats?.length || 0}</p>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
}