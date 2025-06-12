import React from 'react';
import LogModal from "./LogModal.jsx";
import EmptyResults from './simulation-results/EmptyResults';
import TournamentWinner from './simulation-results/TournamentWinner';
import RetirementResults from './simulation-results/RetirementResults';
import BlockedRetirements from './simulation-results/BlockedRetirements';
import PitResults from './simulation-results/PitResults';
import TopFighters from './simulation-results/TopFighters';
import AwardSystemAnalysis from './simulation-results/AwardSystemAnalysis';
import AllPerformers from './simulation-results/AllPerformers';
import TournamentStatistics from './simulation-results/TournamentStatistics';

export default function SimulationResults({ results }) {
  if (!results) {
    return <EmptyResults />;
  }

  return (
    <div>
      <LogModal />
      <TournamentWinner results={results} />
      <RetirementResults results={results} />
      <BlockedRetirements results={results} />
      <PitResults results={results} />
      <TopFighters results={results} />
      <AwardSystemAnalysis results={results} />
      <AllPerformers results={results} />
      <TournamentStatistics results={results} />
    </div>
  );
}