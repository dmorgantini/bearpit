
import React from 'react';
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge } from '@coreui/react';
import { formatTime, formatPercentage } from '../../../utils/helpers.js';

function getBadgeColor(place) {
  switch (place) {
    case 1: return 'warning'; // Gold
    case 2: return 'secondary'; // Silver
    case 3: return 'dark'; // Bronze
    default: return 'light';
  }
}

function formatWinLossRecord(fighter) {
  return `${fighter.totalWins}W/${fighter.totalLosses}L/${fighter.totalSimuls}S`;
}

export default function TopFighters({ results }) {
  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4>🏅 Top 4 Fighters</h4>
      </CCardHeader>
      <CCardBody>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Rank</CTableHeaderCell>
              <CTableHeaderCell>Fighter</CTableHeaderCell>
              <CTableHeaderCell>Level</CTableHeaderCell>
              <CTableHeaderCell>Streak</CTableHeaderCell>
              <CTableHeaderCell>W/L/S</CTableHeaderCell>
              <CTableHeaderCell>Win Rate</CTableHeaderCell>
              <CTableHeaderCell>Unlucky %</CTableHeaderCell>
              <CTableHeaderCell>Lucky %</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {results.topFourFighters?.map((fighter) => (
              <CTableRow key={fighter.name}>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(fighter.rank)}>
                    {fighter.rank === 1 ? '🥇' : fighter.rank === 2 ? '🥈' : fighter.rank === 3 ? '🥉' : '🏅'} {fighter.rank}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  {fighter.name}
                  {fighter.earnedAward && ' 🏆'}
                </CTableDataCell>
                <CTableDataCell>{fighter.level}</CTableDataCell>
                <CTableDataCell>{fighter.longestStreak}</CTableDataCell>
                <CTableDataCell>{formatWinLossRecord(fighter)}</CTableDataCell>
                <CTableDataCell>{formatPercentage(fighter.winRate)}</CTableDataCell>
                <CTableDataCell>{formatPercentage(fighter.unluckyPercentage)}</CTableDataCell>
                <CTableDataCell>{formatPercentage(fighter.luckyPercentage)}</CTableDataCell>
                <CTableDataCell>{formatTime(fighter.timeInPit)}</CTableDataCell>
                <CTableDataCell>
                  {fighter.isRetired && (
                    <span className="text-success">RETIRED@{formatTime(fighter.retiredAt)}</span>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
}