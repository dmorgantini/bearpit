import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { formatPercentage } from '../../../utils/helpers.js';

export default function AwardSystemAnalysis({ results }) {
  if (!results.awardAnalysis) return null;

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4>🏆 Award System Analysis</h4>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol md={6}>
            <p><strong>Award Eligibility:</strong> {results.awardAnalysis.eligibleFighters}/{results.awardAnalysis.totalFighters} fighters eligible ({formatPercentage(results.awardAnalysis.eligibilityRate)})</p>
            <p><strong>Award Winners:</strong> {results.awardAnalysis.awardWinners} fighters earned awards ({formatPercentage(results.awardAnalysis.awardSuccessRate)} success rate)</p>
            <p><strong>Eliminations by Award Winners:</strong> {results.awardAnalysis.eliminationsByAwardWinners}/{results.awardAnalysis.totalEliminations} ({formatPercentage(results.awardAnalysis.awardWinnerEliminationRate)})</p>
          </CCol>
          <CCol md={6}>
            {results.awardAnalysis.mostAffectedFighters && results.awardAnalysis.mostAffectedFighters.length > 0 && (
              <div>
                <h6>Most Affected by Award Winners:</h6>
                {results.awardAnalysis.mostAffectedFighters.map((fighter, index) => (
                  <p key={fighter.name} className="mb-1 small">
                    {index + 1}. {fighter.name} (Level {fighter.level}) - {fighter.eliminatedByAwardWinner}/{fighter.totalEliminations} eliminations ({formatPercentage(fighter.eliminationRate)})
                  </p>
                ))}
              </div>
            )}
          </CCol>
        </CRow>
        
        {results.awardAnalysis.eliminationsByLevel && (
          <div className="mt-3">
            <h6>Elimination Rates by Level:</h6>
            <CRow>
              {Object.entries(results.awardAnalysis.eliminationsByLevel)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([level, data]) => (
                  <CCol md={4} key={level} className="mb-2">
                    <p className="mb-1 small">
                      <strong>Level {level}:</strong> {data.eliminationsByAwardWinners}/{data.totalEliminations} eliminations by award winners ({formatPercentage(data.eliminationRate)})
                    </p>
                  </CCol>
                ))}
            </CRow>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
}