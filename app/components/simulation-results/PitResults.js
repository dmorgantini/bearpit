
import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { formatTime } from '../../../utils/helpers.js';

export default function PitResults({ results }) {
  if (!results.pitResults || results.pitResults.length === 0) return null;

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4>⚔️ Pit Results</h4>
      </CCardHeader>
      <CCardBody>
        <CRow>
          {results.pitResults.map((pitResult) => (
            <CCol md={6} key={pitResult.pitId} className="mb-3">
              <div className="border p-3 rounded">
                <h6>Pit {pitResult.pitId}</h6>
                {pitResult.champion ? (
                  <p><strong>Last Winner:</strong> {pitResult.champion.name} (Level {pitResult.champion.level})</p>
                ) : (
                  <p><strong>Last Winner:</strong> No champion (no fights or last fight was simul)</p>
                )}
                <p><strong>Total Fights:</strong> {pitResult.totalFights}</p>
                <p><strong>Total Simuls:</strong> {pitResult.totalSimuls}</p>
                <p><strong>Pit Duration:</strong> {formatTime(pitResult.duration)}</p>
              </div>
            </CCol>
          ))}
        </CRow>
      </CCardBody>
    </CCard>
  );
}