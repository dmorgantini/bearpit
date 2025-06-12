import React from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { formatTime } from '../../../utils/helpers.js';

function formatWinLossRecord(fighter) {
  return `${fighter.totalWins}W/${fighter.totalLosses}L/${fighter.totalSimuls}S`;
}

export default function TournamentWinner({ results }) {
  if (!results.overallWinner) return null;

  return (
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
  );
}