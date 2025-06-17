import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CRow,
  CCol
} from '@coreui/react';
import FairnessAnalyzerConfig from './fairness-analyzer/FairnessAnalyzerConfig.jsx';
import FairnessAnalyzerResults from './fairness-analyzer/FairnessAnalyzerResults.jsx';

export default function FairnessAnalyzerTab({ onRunAnalysis, isRunning, results }) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div>
      <CRow>
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <h4>⚙️ Analysis Settings</h4>
            </CCardHeader>
            <CCardBody>
              <FairnessAnalyzerConfig 
                onRunAnalysis={onRunAnalysis}
                disabled={isRunning}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={8}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4>📊 Analysis Results</h4>
            </CCardHeader>
            <CCardBody>
              {isRunning ? (
                <div className="text-center py-5">
                  <CSpinner size="lg" />
                  <p className="mt-3">Running analysis...</p>
                </div>
              ) : (
                <FairnessAnalyzerResults results={results} />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
} 