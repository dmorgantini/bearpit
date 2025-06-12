import React from 'react';
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge } from '@coreui/react';
import { formatTime } from '../../../utils/helpers.js';

function getBadgeColor(place) {
  switch (place) {
    case 1: return 'warning'; // Gold
    case 2: return 'secondary'; // Silver
    case 3: return 'dark'; // Bronze
    default: return 'light';
  }
}

export default function RetirementResults({ results }) {
  if (!results.retiredFighters || results.retiredFighters.length === 0) return null;

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4>🏁 Top {results.maxRetirements} Retirement Race Results (Target: {results.retirementStreakLength} wins)</h4>
      </CCardHeader>
      <CCardBody>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Place</CTableHeaderCell>
              <CTableHeaderCell>Fighter</CTableHeaderCell>
              <CTableHeaderCell>Level</CTableHeaderCell>
              <CTableHeaderCell>Retirement Time</CTableHeaderCell>
              <CTableHeaderCell>Fights to Victory</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {results.retiredFighters
              .sort((a, b) => a.retiredAt - b.retiredAt)
              .map((fighter, index) => (
                <CTableRow key={fighter.name}>
                  <CTableDataCell>
                    <CBadge color={getBadgeColor(index + 1)}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
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
  );
}