import React, { useState } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner
} from '@coreui/react';
import { distributions } from '../../../lib/distributions.js';
import { DEFAULT_CONFIG } from '../../../utils/constants.js';
import CombatSettings from '../tournament-config/CombatSettings.jsx';
import TournamentModeSettings from '../tournament-config/TournamentModeSettings.jsx';
import AdvancedSettings from '../tournament-config/AdvancedSettings.jsx';

const ANALYZER_CONFIG = {
  fighterCount: 16,
  distribution: distributions[0].name,
  timeOptions: [10, 15, 20, 25],
  pitOptions: [1, 2, 3, 4],
  queueOptions: [false, true],
  iterations: 25
};

export default function FairnessAnalyzerConfig({ onRunAnalysis, disabled = false }) {
  const [analyzerConfig, setAnalyzerConfig] = useState(ANALYZER_CONFIG);
  const [tournamentConfig, setTournamentConfig] = useState(DEFAULT_CONFIG);
  const [category, setCategory] = useState('default');

  const handleAnalyzerConfigChange = (field, value) => {
    setAnalyzerConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTournamentConfigChange = (field, value) => {
    setTournamentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunAnalysis({
      ...analyzerConfig,
      baseConfig: tournamentConfig
    });
  };

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Fighter Count</CFormLabel>
          <CFormInput
            type="number"
            min="4"
            max="60"
            value={analyzerConfig.fighterCount}
            onChange={(e) => handleAnalyzerConfigChange('fighterCount', parseInt(e.target.value))}
            disabled={disabled}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel>Skill Distribution</CFormLabel>
          <CFormSelect
            value={analyzerConfig.distribution}
            onChange={(e) => handleAnalyzerConfigChange('distribution', e.target.value)}
            disabled={disabled}
          >
            {distributions.map(dist => (
              <option key={dist.name} value={dist.name}>{dist.name}</option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Time Options (minutes)</CFormLabel>
          <CFormInput
            type="text"
            value={analyzerConfig.timeOptions.join(', ')}
            onChange={(e) => handleAnalyzerConfigChange('timeOptions', 
              e.target.value.split(',').map(t => parseInt(t.trim())))}
            placeholder="10, 15, 20, 25"
            disabled={disabled}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel>Pit Options</CFormLabel>
          <CFormInput
            type="text"
            value={analyzerConfig.pitOptions.join(', ')}
            onChange={(e) => handleAnalyzerConfigChange('pitOptions',
              e.target.value.split(',').map(p => parseInt(p.trim())))}
            placeholder="1, 2, 3, 4"
            disabled={disabled}
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Iterations per Test</CFormLabel>
          <CFormInput
            type="number"
            min="1"
            max="100"
            value={analyzerConfig.iterations}
            onChange={(e) => handleAnalyzerConfigChange('iterations', parseInt(e.target.value))}
            disabled={disabled}
          />
        </CCol>
      </CRow>

      <CombatSettings 
        config={tournamentConfig} 
        category={category}
        onConfigChange={handleTournamentConfigChange} 
        onCategoryChange={handleCategoryChange}
        disabled={disabled}
      />

      <TournamentModeSettings 
        config={tournamentConfig} 
        onConfigChange={handleTournamentConfigChange}
        disabled={disabled}
      />

      <AdvancedSettings 
        config={tournamentConfig} 
        onConfigChange={handleTournamentConfigChange}
        disabled={disabled}
      />

      <div className="d-grid">
        <CButton type="submit" color="primary" size="lg" disabled={disabled}>
          {disabled ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Running Analysis...
            </>
          ) : (
            '🔍 Run Fairness Analysis'
          )}
        </CButton>
      </div>
    </CForm>
  );
} 