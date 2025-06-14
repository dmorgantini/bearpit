'use client';

import React, { useState, useEffect } from 'react';
import { CContainer, CRow, CCol, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import TournamentConfig from './components/TournamentConfig.js';
import SimulationResults from './components/SimulationResults.js';
import FairnessAnalyzerTab from './components/FairnessAnalyzerTab.jsx';

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [tournamentResults, setTournamentResults] = useState(null);
  const [fairnessResults, setFairnessResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('tournament');
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    // Create Web Worker
    const tournamentWorker = new Worker(new URL('./tournament-worker.js', import.meta.url), { type: 'module' });
    
    // Set up message handler
    tournamentWorker.onmessage = (e) => {
      const { type, result, error } = e.data;
      
      if (error) {
        console.error('Worker error:', error);
        setIsRunning(false);
        return;
      }
      
      switch (type) {
        case 'tournamentComplete':
          setTournamentResults(result);
          setIsRunning(false);
          break;
          
        case 'analysisComplete':
          setFairnessResults(result);
          setIsRunning(false);
          break;
      }
    };
    
    setWorker(tournamentWorker);
    
    // Cleanup
    return () => {
      tournamentWorker.terminate();
    };
  }, []);

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleRunTournament = async (tournamentConfig) => {
    if (!worker) {
      console.error('Worker not initialized');
      return;
    }
    
    setIsRunning(true);
    setTournamentResults(null);

    try {
      worker.postMessage({
        type: 'runTournament',
        config: tournamentConfig
      });
    } catch (error) {
      console.error('Failed to start tournament simulation:', error);
      setIsRunning(false);
    }
  };

  const handleRunFairnessAnalysis = async (analysisConfig) => {
    if (!worker) {
      console.error('Worker not initialized');
      return;
    }
    
    setIsRunning(true);
    setFairnessResults(null);

    try {
      worker.postMessage({
        type: 'runFairnessAnalysis',
        config: analysisConfig
      });
    } catch (error) {
      console.error('Failed to start fairness analysis:', error);
      setIsRunning(false);
    }
  };

  return (
    <CContainer fluid>
      <div className="py-4">
        <h1 className="mb-4">🏟️ Boffer Foam Tournament Simulator</h1>
        
        <CNav variant="tabs" className="mb-4">
          <CNavItem>
            <CNavLink
              active={activeTab === 'tournament'}
              onClick={() => setActiveTab('tournament')}
            >
              🏟️ Tournament Simulator
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'fairness'}
              onClick={() => setActiveTab('fairness')}
            >
              🔍 Fairness Analyzer
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeTab === 'tournament'}>
            <CRow>
              <CCol lg={4}>
                <TournamentConfig 
                  onConfigChange={handleConfigChange}
                  onRunTournament={handleRunTournament}
                  isRunning={isRunning}
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
                  <SimulationResults results={tournamentResults} />
                )}
              </CCol>
            </CRow>
          </CTabPane>

          <CTabPane visible={activeTab === 'fairness'}>
            <FairnessAnalyzerTab
              onRunAnalysis={handleRunFairnessAnalysis}
              isRunning={isRunning}
              results={fairnessResults}
            />
          </CTabPane>
        </CTabContent>
      </div>
    </CContainer>
  );
}