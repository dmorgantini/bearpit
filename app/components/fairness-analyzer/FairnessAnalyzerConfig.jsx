import React, { useState } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormCheck,
  CAlert
} from '@coreui/react';
import { distributions } from '../../../lib/distributions.js';
import { DEFAULT_CONFIG } from '../../../utils/constants.js';
import CombatSettings from '../tournament-config/CombatSettings.jsx';
import TournamentModeSettings from '../tournament-config/TournamentModeSettings.jsx';
import AdvancedSettings from '../tournament-config/AdvancedSettings.jsx';
import InfoButton from '../common/InfoButton';
import useAnalyzerValidation from './hooks/useAnalyzerValidation';

const ANALYZER_CONFIG = {
  fighterCount: 16,
  distribution: distributions[0].name,
  timeOptions: [10, 15, 20, 25],
  pitOptions: [1, 2, 3, 4],
  queueOptions: [false, true],
  iterations: 100
};

const TIME_OPTIONS = [10, 15, 20, 25, 30, 45, 60];
const PIT_OPTIONS = [1, 2, 3, 4, 6, 8];

export default function FairnessAnalyzerConfig({ onRunAnalysis, disabled = false }) {
  const [analyzerConfig, setAnalyzerConfig] = useState(ANALYZER_CONFIG);
  const [tournamentConfig, setTournamentConfig] = useState(DEFAULT_CONFIG);
  const [category, setCategory] = useState('default');

  const { errors, isValid } = useAnalyzerValidation(analyzerConfig);

  const handleAnalyzerConfigChange = (field, value) => {
    setAnalyzerConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTournamentConfigChange = (field, value) => {
    setTournamentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleTimeOptionToggle = (time) => {
    const newTimeOptions = analyzerConfig.timeOptions.includes(time)
      ? analyzerConfig.timeOptions.filter(t => t !== time)
      : [...analyzerConfig.timeOptions, time].sort((a, b) => a - b);
    handleAnalyzerConfigChange('timeOptions', newTimeOptions);
  };

  const handlePitOptionToggle = (pits) => {
    const newPitOptions = analyzerConfig.pitOptions.includes(pits)
      ? analyzerConfig.pitOptions.filter(p => p !== pits)
      : [...analyzerConfig.pitOptions, pits].sort((a, b) => a - b);
    handleAnalyzerConfigChange('pitOptions', newPitOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onRunAnalysis({
        ...analyzerConfig,
        baseConfig: tournamentConfig
      });
    }
  };

  return (
    <CForm onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="mb-3">
          {errors.map((error, index) => (
            <CAlert key={index} color="danger" className="mb-2">
              ❌ {error}
            </CAlert>
          ))}
        </div>
      )}

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Fighter Count</span>
            <InfoButton description="The number of fighters to use in each test." />
          </CFormLabel>
          <CFormInput
            type="number"
            min="4"
            max="60"
            value={analyzerConfig.fighterCount}
            onChange={(e) => handleAnalyzerConfigChange('fighterCount', parseInt(e.target.value))}
            disabled={disabled}
            className={errors.some(e => e.includes('Fighter count')) ? 'is-invalid' : ''}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Skill Distribution</span>
            <InfoButton description="The distribution of fighter skill levels to use in the analysis." />
          </CFormLabel>
          <CFormSelect
            value={analyzerConfig.distribution}
            onChange={(e) => handleAnalyzerConfigChange('distribution', e.target.value)}
            disabled={disabled}
            className={errors.some(e => e.includes('skill distribution')) ? 'is-invalid' : ''}
          >
            {distributions.map(dist => (
              <option key={dist.name} value={dist.name}>{dist.name}</option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Time Options</span>
            <InfoButton description="The tournament durations to test. Multiple durations help identify how time affects fairness and balance." />
          </CFormLabel>
          <div className={`d-flex flex-wrap gap-2 ${errors.some(e => e.includes('time option')) ? 'border border-danger rounded p-2' : ''}`}>
            {TIME_OPTIONS.map(time => (
              <CFormCheck
                key={time}
                type="checkbox"
                id={`time-${time}`}
                label={`${time}m`}
                checked={analyzerConfig.timeOptions.includes(time)}
                onChange={() => handleTimeOptionToggle(time)}
                disabled={disabled}
              />
            ))}
          </div>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Pit Options</span>
            <InfoButton description="The number of pits to test." />
          </CFormLabel>
          <div className={`d-flex flex-wrap gap-2 ${errors.some(e => e.includes('pit option')) ? 'border border-danger rounded p-2' : ''}`}>
            {PIT_OPTIONS.map(pits => (
              <CFormCheck
                key={pits}
                type="checkbox"
                id={`pits-${pits}`}
                label={`${pits} pit${pits > 1 ? 's' : ''}`}
                checked={analyzerConfig.pitOptions.includes(pits)}
                onChange={() => handlePitOptionToggle(pits)}
                disabled={disabled}
              />
            ))}
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Iterations</span>
            <InfoButton description="The number of times to run each test configuration. More iterations provide more reliable results but take longer to complete." />
          </CFormLabel>
          <CFormInput
            type="number"
            min="1"
            max="100"
            value={analyzerConfig.iterations}
            onChange={(e) => handleAnalyzerConfigChange('iterations', parseInt(e.target.value))}
            disabled={disabled}
            className={errors.some(e => e.includes('Iterations')) ? 'is-invalid' : ''}
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
        <CButton 
          type="submit" 
          color="primary" 
          size="lg" 
          disabled={disabled || !isValid}
        >
          {disabled ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Running Analysis...
            </>
          ) : (
            isValid ? '🔍 Run Fairness Analysis' : '❌ Fix Configuration Errors'
          )}
        </CButton>
      </div>
    </CForm>
  );
} 