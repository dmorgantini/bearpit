import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CRow, CCol } from '@coreui/react';
import { FairnessAnalyzer } from '../../lib/fairness-analyzer.js';
import FairnessAnalyzerConfig from './fairness-analyzer/FairnessAnalyzerConfig.jsx';
import FairnessAnalyzerResults from './fairness-analyzer/FairnessAnalyzerResults.jsx';

export default function FairnessAnalyzerTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunAnalysis = async (config) => {
    setIsRunning(true);
    setResults(null);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const analyzer = new FairnessAnalyzer(
        config.fighterCount,
        config.distribution,
        config.baseConfig
      );
      
      const analysisResults = analyzer.analyzeFairness(
        config.timeOptions,
        config.pitOptions,
        config.queueOptions,
        config.iterations
      );
      
      setResults(analysisResults);
    } catch (error) {
      console.error('Fairness analysis failed:', error);
      // You could add error handling UI here
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <CRow>
      <CCol lg={4}>
        <CCard className="mt-3">
          <CCardHeader>
            <h5>Fairness Analysis Settings</h5>
          </CCardHeader>
          <CCardBody>
            <FairnessAnalyzerConfig onRunAnalysis={handleRunAnalysis} />
          </CCardBody>
        </CCard>
      </CCol>
      
      <CCol lg={8}>
        {isRunning ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Running analysis...</span>
            </div>
            <p className="mt-3">Running fairness analysis...</p>
          </div>
        ) : (
          <FairnessAnalyzerResults results={results} />
        )}
      </CCol>
    </CRow>
  );
} 