import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton
} from '@coreui/react';
import InfoButton from '../common/InfoButton';
import { FairnessCalculator } from '../../../lib/fairness-calculator';
import DetailedMetricsModal from './DetailedMetricsModal';

export default function FairnessAnalyzerResults({ results }) {
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  if (!results) {
    return (
      <CCard>
        <CCardBody>
          <p>No results yet. Run an analysis to see results.</p>
        </CCardBody>
      </CCard>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getCVColor = (cv) => {
    if (cv <= 0.15) return 'success';
    if (cv <= 0.30) return 'info';
    if (cv <= 0.50) return 'warning';
    return 'danger';
  };

  const handleScoreClick = (result) => {
    setSelectedScore(result);
    setShowScoreModal(true);
  };

  const handleRowClick = (result) => {
    setSelectedResult(result);
    setShowMetricsModal(true);
  };

  const renderScoreExplanation = (result) => {
    if (!result) return null;
    const explanations = FairnessCalculator.generateScoreExplanation(result.averageMetrics, FairnessCalculator.calculateFairnessScores(result.averageMetrics));
    
    return (
      <div>
        {Object.entries(explanations).map(([key, explanation]) => (
          <div key={key} className="mb-3">
            <h6 className="text-capitalize">{key}</h6>
            <p><strong>Score:</strong> {explanation.score.toFixed(1)} ({explanation.impact})</p>
            <p>{explanation.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Configuration Comparison */}
      <CCard>
        <CCardHeader>
          <h4>🔄 Configuration Comparison</h4>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover size="sm">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>
                  Time
                  <InfoButton description="Duration of the tournament in minutes" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  Pits
                  <InfoButton description="Number of fighting pits available" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  Queue
                  <InfoButton description="Queue strategy: Shortest or Shared" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  Score
                  <InfoButton description="Overall fairness score combining multiple metrics (click for details)" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  CV
                  <InfoButton description="Coefficient of variation in fight distribution - lower is better" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  Fights
                  <InfoButton description="Total number of fights completed" />
                </CTableHeaderCell>
                <CTableHeaderCell>
                  Fights/Fighter
                  <InfoButton description="Average number of fights per fighter" />
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {results.map((result, index) => (
                <CTableRow 
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(result)}
                >
                  <CTableDataCell>{result.configuration.time}min</CTableDataCell>
                  <CTableDataCell>{result.configuration.pits}</CTableDataCell>
                  <CTableDataCell>{result.configuration.useShortestQueue ? 'Shortest' : 'Shared'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      color={getScoreColor(result.optimizedScore)}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScoreClick(result);
                      }}
                    >
                      {result.optimizedScore.toFixed(1)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getCVColor(result.averageMetrics.fightDistribution.fightDistributionCV)}>
                      {result.averageMetrics.fightDistribution.fightDistributionCV.toFixed(3)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{result.averageMetrics.rawStats.totalFights.toFixed(1)}</CTableDataCell>
                  <CTableDataCell>{result.averageMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Score Explanation Modal */}
      <CModal visible={showScoreModal} onClose={() => setShowScoreModal(false)} size="lg">
        <CModalHeader onClose={() => setShowScoreModal(false)}>
          <CModalTitle>Score Explanation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedScore && renderScoreExplanation(selectedScore)}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowScoreModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Detailed Metrics Modal */}
      <DetailedMetricsModal
        visible={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        result={selectedResult}
      />
    </div>
  );
} 