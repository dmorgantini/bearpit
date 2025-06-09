'use client';

import React, { useState } from 'react';
import { CContainer, CRow, CCol } from '@coreui/react';
import TournamentConfig from './components/TournamentConfig.js';
import SimulationResults from './components/SimulationResults.js';
import TournamentSimulator from '../lib/tournament-simulator.js';

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleRunTournament = async (tournamentConfig) => {
    setIsRunning(true);
    setResults(null);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const simulator = new TournamentSimulator(tournamentConfig);
      const tournamentResults = simulator.runRound();
      
      setResults(tournamentResults);
    } catch (error) {
      console.error('Tournament simulation failed:', error);
      // You could add error handling UI here
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <CContainer fluid>
      <div className="py-4">
        <h1 className="mb-4">🏟️ Boffer Foam Tournament Simulator</h1>
        
        <CRow>
          <CCol lg={4}>
            <TournamentConfig 
              onConfigChange={handleConfigChange}
              onRunTournament={handleRunTournament}
            />
          </CCol>
          
          <CCol lg={8}>
            {isRunning ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Running tournament...</span>
                </div>
                <p className="mt-3">Running tournament simulation...</p>
              </div>
            ) : (
              <SimulationResults results={results} />
            )}
          </CCol>
        </CRow>
      </div>
    </CContainer>
  );
}