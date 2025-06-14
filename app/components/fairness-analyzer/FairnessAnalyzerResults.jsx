import React from 'react';
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
  CCol
} from '@coreui/react';

export default function FairnessAnalyzerResults({ results }) {
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

  return (
    <div>
      {/* Top Configurations */}
      <CCard className="mb-3">
        <CCardHeader>
          <h4>🏆 Top Configurations</h4>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Rank</CTableHeaderCell>
                <CTableHeaderCell>Configuration</CTableHeaderCell>
                <CTableHeaderCell>Score</CTableHeaderCell>
                <CTableHeaderCell>Fight Distribution CV</CTableHeaderCell>
                <CTableHeaderCell>Skill-Win Correlation</CTableHeaderCell>
                <CTableHeaderCell>Total Fights</CTableHeaderCell>
                <CTableHeaderCell>Fights/Fighter</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {results.slice(0, 5).map((result, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {result.configuration.time}min, {result.configuration.pits} pit(s),{' '}
                    {result.configuration.useShortestQueue ? 'shortest' : 'shared'} queue
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getScoreColor(result.optimizedScore)}>
                      {result.optimizedScore.toFixed(1)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getCVColor(result.averageMetrics.fightDistribution.fightDistributionCV)}>
                      {result.averageMetrics.fightDistribution.fightDistributionCV.toFixed(3)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {result.averageMetrics.competitiveBalance.skillWinCorrelation.toFixed(3)}
                  </CTableDataCell>
                  <CTableDataCell>
                    {result.averageMetrics.rawStats.totalFights.toFixed(1)}
                  </CTableDataCell>
                  <CTableDataCell>
                    {result.averageMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Detailed Metrics for Top Configuration */}
      {results[0] && (
        <CCard className="mb-3">
          <CCardHeader>
            <h4>📊 Detailed Metrics for Best Configuration</h4>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <h5>Fight Distribution</h5>
                <p>
                  <strong>CV:</strong>{' '}
                  <CBadge color={getCVColor(results[0].averageMetrics.fightDistribution.fightDistributionCV)}>
                    {results[0].averageMetrics.fightDistribution.fightDistributionCV.toFixed(3)}
                  </CBadge>
                </p>
                <p><strong>Avg Fights/Fighter:</strong> {results[0].averageMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}</p>
                <p><strong>Fight Range:</strong> {results[0].averageMetrics.fightDistribution.minFights.toFixed(0)}-{results[0].averageMetrics.fightDistribution.maxFights.toFixed(0)}</p>
                <p><strong>Fights per Minute:</strong> {results[0].averageMetrics.fightDistribution.avgFightsPerMinute.toFixed(1)}</p>
              </CCol>
              <CCol md={6}>
                <h5>Competitive Balance</h5>
                <p><strong>Skill-Win Correlation:</strong> {results[0].averageMetrics.competitiveBalance.skillWinCorrelation.toFixed(3)}</p>
                <p><strong>Unlucky Fighter Rate:</strong> {(results[0].averageMetrics.competitiveBalance.unluckyFighterRate * 100).toFixed(1)}%</p>
                <p><strong>Total Fights:</strong> {results[0].averageMetrics.rawStats.totalFights.toFixed(1)}</p>
                <p><strong>Simul Rate:</strong> {(results[0].averageMetrics.efficiency.simulRate * 100).toFixed(1)}%</p>
              </CCol>
            </CRow>

            {results[0].averageMetrics.retirement && (
              <CRow className="mt-3">
                <CCol md={6}>
                  <h5>Retirement Metrics</h5>
                  <p><strong>Retirement Success:</strong> {(results[0].averageMetrics.retirement.retirementSuccess * 100).toFixed(1)}%</p>
                  <p><strong>Retired Count:</strong> {results[0].averageMetrics.retirement.retiredCount.toFixed(1)}/{results[0].averageMetrics.retirement.maxRetirements}</p>
                  {results[0].averageMetrics.retirement.averageRetirementTime && (
                    <p><strong>Avg Retirement Time:</strong> {results[0].averageMetrics.retirement.averageRetirementTime.toFixed(1)} minutes</p>
                  )}
                </CCol>
              </CRow>
            )}

            <CRow className="mt-3">
              <CCol>
                <h5>Realism Flags</h5>
                {Object.entries(results[0].averageMetrics.realism)
                  .filter(([_, value]) => value > 0.5)
                  .map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong>{' '}
                      <CBadge color="warning">
                        {(value * 100).toFixed(1)}%
                      </CBadge>
                    </p>
                  ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* Configuration Comparison */}
      <CCard>
        <CCardHeader>
          <h4>🔄 Configuration Comparison</h4>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover size="sm">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Time</CTableHeaderCell>
                <CTableHeaderCell>Pits</CTableHeaderCell>
                <CTableHeaderCell>Queue</CTableHeaderCell>
                <CTableHeaderCell>Score</CTableHeaderCell>
                <CTableHeaderCell>CV</CTableHeaderCell>
                <CTableHeaderCell>Fights</CTableHeaderCell>
                <CTableHeaderCell>Fights/Fighter</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {results.map((result, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{result.configuration.time}min</CTableDataCell>
                  <CTableDataCell>{result.configuration.pits}</CTableDataCell>
                  <CTableDataCell>{result.configuration.useShortestQueue ? 'Shortest' : 'Shared'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getScoreColor(result.optimizedScore)}>
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
    </div>
  );
} 