import React from 'react';
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react';
import { formatTime } from '../../../utils/helpers.js';

function formatWinLossRecord(fighter) {
  return `${fighter.totalWins}W/${fighter.totalLosses}L/${fighter.totalSimuls}S`;
}

export default function AllPerformers({ results }) {
  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4>📊 All Performers</h4>
      </CCardHeader>
      <CCardBody>
        <CTable striped hover size="sm">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Fighter</CTableHeaderCell>
              <CTableHeaderCell>Level</CTableHeaderCell>
              <CTableHeaderCell>Streak</CTableHeaderCell>
              <CTableHeaderCell>W/L/S</CTableHeaderCell>
              <CTableHeaderCell>Unlucky %</CTableHeaderCell>
              <CTableHeaderCell>Lucky %</CTableHeaderCell>
              <CTableHeaderCell>Total Fights</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {results.fighterStats?.map((fighter, index) => (
              <CTableRow key={fighter.name}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>
                  {fighter.name}
                  {fighter.earnedAward && ' 🏆'}
                </CTableDataCell>
                <CTableDataCell>{fighter.level}</CTableDataCell>
                <CTableDataCell>{fighter.longestStreak}</CTableDataCell>
                <CTableDataCell>{formatWinLossRecord(fighter)}</CTableDataCell>
                <CTableDataCell>{fighter.unluckyPercentage}</CTableDataCell>
                <CTableDataCell>{fighter.luckyPercentage}</CTableDataCell>
                <CTableDataCell>{fighter.totalFights}</CTableDataCell>
                <CTableDataCell>
                  {fighter.isRetired && (
                    <span className="text-success">
                      🏁({fighter.retiredAfterFights}F@{formatTime(fighter.retiredAt)})
                    </span>
                  )}
                  {!fighter.isRetired && results.retirementStreakLength && fighter.longestStreak >= results.retirementStreakLength && (
                    <span className="text-warning">⚠️(blocked)</span>
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