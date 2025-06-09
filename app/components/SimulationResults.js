import React from 'react';
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge, CCol, CRow } from '@coreui/react';
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

  const formatWinLossRecord = (fighter) => {
    return `${fighter.totalWins}W/${fighter.totalLosses}L/${fighter.totalSimuls}S`;
  };

  return (
    <div>
      {/* Tournament Winner Section */}
      {results.overallWinner && (
        <CCard className="mb-3">
          <CCardHeader>
            <h4>
              {results.retirementStreakLength ? '🏆 Tournament Winner' : '🏆 Round Winner'}
            </h4>
          </CCardHeader>
          <CCardBody>
            <h5>{results.overallWinner.name} (Level {results.overallWinner.level})</h5>
            {results.retirementStreakLength ? (
              <div>
                <p>🏁 First to reach {results.retirementStreakLength} wins!</p>
                <p>⏱️ Retirement Time: {formatTime(results.overallWinner.retiredAt)}</p>
                <p>⚔️ Fights to Victory: {results.overallWinner.retiredAfterFights}</p>
                <p>📊 Final Stats: {formatWinLossRecord(results.overallWinner)}</p>
              </div>
            ) : (
              <div>
                <p>Longest Streak: {results.overallWinner.longestStreak}</p>
                <p>Total Stats: {formatWinLossRecord(results.overallWinner)}</p>
                <p>Time Fighting: {formatTime(results.overallWinner.timeInPit)}</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* Retirement Results */}
      {results.retiredFighters && results.retiredFighters.length > 0 && (
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
      )}

      {/* Blocked Retirements */}
      {results.blockedRetirements && results.blockedRetirements.length > 0 && (
        <CCard className="mb-3 border-warning">
          <CCardHeader className="bg-warning">
            <h5>⚠️ Blocked Retirements (reached {results.retirementStreakLength} wins but cap was full)</h5>
          </CCardHeader>
          <CCardBody>
            {results.blockedRetirements.map((fighter, index) => (
              <p key={fighter.name} className="mb-1">
                {fighter.name} (Level {fighter.level}) - {fighter.longestStreak} win streak, {fighter.totalFights} total fights
              </p>
            ))}
          </CCardBody>
        </CCard>
      )}

      {/* Pit Results */}
      {results.pitResults && results.pitResults.length > 0 && (
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
      )}

      {/* Top 4 Fighters */}
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
                  <CTableDataCell>{formatTime(fighter.timeInPit)}</CTableDataCell>
                  <CTableDataCell>
                    {fighter.isRetired && (
                      <span className="text-success">RETIRED@{formatTime(fighter.retiredAt)}</span>
                    )}
                    {fighter.efficiency !== null && (
                      <small className="text-muted d-block">
                        Eff: {fighter.efficiency.toFixed(1)}%
                      </small>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Award System Analysis */}
      {results.awardAnalysis && (
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
      )}

      {/* All Performers */}
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

      {/* Tournament Statistics */}
      <CCard>
        <CCardHeader>
          <h4>📊 Tournament Statistics</h4>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6}>
              <p><strong>Total Fights:</strong> {results.totalFights}</p>
              <p><strong>Total Simuls:</strong> {results.totalSimuls} ({formatPercentage(results.totalSimuls / results.totalFights)})</p>
              <p><strong>Round Duration:</strong> {results.roundDuration} minutes</p>
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
    </div>
  );
}