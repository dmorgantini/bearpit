import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader
} from '@coreui/react';
import AwardSystemAnalysis from '../simulation-results/AwardSystemAnalysis';

export default function DetailedMetricsModal({ visible, onClose, result }) {
  if (!result) return null;

  const getCVColor = (cv) => {
    if (cv <= 0.15) return 'success';
    if (cv <= 0.30) return 'info';
    if (cv <= 0.50) return 'warning';
    return 'danger';
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(1);
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(v => formatValue(v)).join(', ');
      }
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join(', ');
    }
    return value;
  };

  const renderAwardAnalysis = () => {
    if (!result.awardAnalysis) return null;

    return (
      <CRow className="mt-3">
        <CCol>
          <h5>Award Analysis</h5>
          {Object.entries(result.awardAnalysis).map(([key, value]) => (
            <div key={key} className="mb-3">
              <h6 className="text-capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h6>
              <p>{formatValue(value)}</p>
            </div>
          ))}
        </CCol>
      </CRow>
    );
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader onClose={onClose}>
        <CModalTitle>
          Detailed Metrics: {result.configuration.time}min, {result.configuration.pits} pit(s),{' '}
          {result.configuration.useShortestQueue ? 'shortest' : 'shared'} queue
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow>
          <CCol md={6}>
            <CCard className="mb-3">
              <CCardHeader>
                <h5 className="mb-0">Fight Distribution</h5>
              </CCardHeader>
              <CCardBody>
                <p>
                  <strong>CV:</strong>{' '}
                  <CBadge color={getCVColor(result.averageMetrics.fightDistribution.fightDistributionCV)}>
                    {result.averageMetrics.fightDistribution.fightDistributionCV.toFixed(3)}
                  </CBadge>
                </p>
                <p><strong>Avg Fights/Fighter:</strong> {result.averageMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}</p>
                <p><strong>Fight Range:</strong> {result.averageMetrics.fightDistribution.minFights.toFixed(0)}-{result.averageMetrics.fightDistribution.maxFights.toFixed(0)}</p>
                <p><strong>Fights per Minute:</strong> {result.averageMetrics.fightDistribution.avgFightsPerMinute.toFixed(1)}</p>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={6}>
            <CCard className="mb-3">
              <CCardHeader>
                <h5 className="mb-0">Competitive Balance</h5>
              </CCardHeader>
              <CCardBody>
                <p><strong>Skill-Win Correlation:</strong> {result.averageMetrics.competitiveBalance.skillWinCorrelation.toFixed(3)}</p>
                <p><strong>Unlucky Fighter Rate:</strong> {(result.averageMetrics.competitiveBalance.unluckyFighterRate * 100).toFixed(1)}%</p>
                <p><strong>Total Fights:</strong> {result.averageMetrics.rawStats.totalFights.toFixed(1)}</p>
                <p><strong>Simul Rate:</strong> {(result.averageMetrics.efficiency.simulRate * 100).toFixed(1)}%</p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {result.averageMetrics.retirement && (
          <CRow>
            <CCol md={6}>
              <CCard className="mb-3">
                <CCardHeader>
                  <h5 className="mb-0">Retirement Metrics</h5>
                </CCardHeader>
                <CCardBody>
                  <p><strong>Retirement Success:</strong> {(result.averageMetrics.retirement.retirementSuccess * 100).toFixed(1)}%</p>
                  <p><strong>Retired Count:</strong> {result.averageMetrics.retirement.retiredCount.toFixed(1)}/{result.averageMetrics.retirement.maxRetirements}</p>
                  {result.averageMetrics.retirement.averageRetirementTime && (
                    <p><strong>Avg Retirement Time:</strong> {result.averageMetrics.retirement.averageRetirementTime.toFixed(1)} minutes</p>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        <CRow>
          <CCol>
            <CCard className="mb-3">
              <CCardHeader>
                <h5 className="mb-0">Realism Flags</h5>
              </CCardHeader>
              <CCardBody>
                {Object.entries(result.averageMetrics.realism)
                  .filter(([_, value]) => value > 0.5)
                  .map(([key, value]) => (
                    <p key={key} className="mb-2">
                      <strong>{key}:</strong>{' '}
                      <CBadge color="warning">
                        {(value * 100).toFixed(1)}%
                      </CBadge>
                    </p>
                  ))}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <AwardSystemAnalysis results={{ awardAnalysis: result.awardAnalysis }} />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
} 