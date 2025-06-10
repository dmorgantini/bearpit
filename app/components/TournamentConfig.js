'use client';

import React, {useState} from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow
} from '@coreui/react';
import {DEFAULT_CONFIG} from '../../utils/constants.js';
import FighterConfig from './FighterConfig.jsx';

function TournamentConfig({onConfigChange, onRunTournament}) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [fighters, setFighters] = useState([
    {name: 'Fighter1', level: 3},
    {name: 'Fighter2', level: 2},
    {name: 'Fighter3', level: 1},
  ]);

  const handleConfigChange = (field, value) => {
    const newConfig = {...config, [field]: value};
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleFightersChange = (newFighters) => {
    setFighters(newFighters);
  };

  const validateConfiguration = () => {
    const errors = [];

    if (fighters.length < 4) {
      errors.push('Need at least 4 fighters');
    }

    if (fighters.some(f => !f.name.trim())) {
      errors.push('All fighters must have names');
    }

    if (new Set(fighters.map(f => f.name.trim())).size !== fighters.length) {
      errors.push('Fighter names must be unique');
    }

    if (config.numberOfPits > Math.floor(fighters.length / 2)) {
      errors.push('Too many pits for number of fighters');
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateConfiguration();

    if (errors.length > 0) {
      alert('Configuration errors:\n' + errors.join('\n'));
      return;
    }

    onRunTournament?.({...config, fighters});
  };

  const isConfigValid = validateConfiguration().length === 0;

  return (
    <div>
      {/* Tournament Settings */}
      <CCard className="mt-3">
        <CCardHeader>
          <h5>Tournament Settings</h5>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Basic Settings */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Number of Pits</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  max={Math.floor(fighters.length / 2)}
                  value={config.numberOfPits}
                  onChange={(e) => handleConfigChange('numberOfPits', parseInt(e.target.value))}
                />
                <small className="text-muted">
                  Max: {Math.floor(fighters.length / 2)} for {fighters.length} fighters
                </small>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Round Duration (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  min="5"
                  max="60"
                  value={config.roundDurationMinutes}
                  onChange={(e) => handleConfigChange('roundDurationMinutes', parseInt(e.target.value))}
                />
              </CCol>
            </CRow>

            {/* Combat Settings */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Queue Strategy</CFormLabel>
                <CFormSelect
                  value={String(config.useShortestQueue)}
                  onChange={(e) => handleConfigChange('useShortestQueue', e.target.value === 'true')}
                >
                  <option value="false">Shared Queue</option>
                  <option value="true">Shortest Queue per Pit</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Tournament Mode */}
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Tournament Mode</CFormLabel>
                <CFormSelect
                  value={config.retirementStreakLength || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleConfigChange('retirementStreakLength',
                      value === '' ? null :
                        value === 'auto' ? 'auto' :
                          parseInt(value)
                    );
                  }}
                >
                  <option value="">Traditional (longest streak wins)</option>
                  <option value="auto">Retirement Race (auto streak)</option>
                  <option value="3">Retirement Race (3 wins)</option>
                  <option value="5">Retirement Race (5 wins)</option>
                  <option value="7">Retirement Race (7 wins)</option>
                  <option value="10">Retirement Race (10 wins)</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                {config.retirementStreakLength && (
                  <>
                    <CFormLabel>Max Retirements</CFormLabel>
                    <CFormInput
                      type="number"
                      min="1"
                      max="10"
                      value={config.maxRetirements}
                      onChange={(e) => handleConfigChange('maxRetirements', parseInt(e.target.value))}
                    />
                  </>
                )}
              </CCol>

            </CRow>

            {/* Advanced Settings */}
            <details className="mb-3">
              <summary className="mb-2">Advanced Settings</summary>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Skill Multiplier</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={config.skillMultiplier}
                    onChange={(e) => handleConfigChange('skillMultiplier', parseFloat(e.target.value))}
                  />
                  <small className="text-muted">Higher = more skill-based outcomes</small>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Fatigue Multiplier</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.001"
                    min="0"
                    max="0.1"
                    value={config.fatigueMultiplier}
                    onChange={(e) => handleConfigChange('fatigueMultiplier', parseFloat(e.target.value))}
                  />
                  <small className="text-muted">Higher = more fatigue effect</small>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Rest after Loss (seconds)</CFormLabel>
                  <CFormInput
                    type="number"
                    min="10"
                    max="120"
                    value={config.restPeriodSeconds}
                    onChange={(e) => handleConfigChange('restPeriodSeconds', parseInt(e.target.value))}
                  />
                </CCol>
                </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Average Fight Duration (seconds)</CFormLabel>
                  <CFormInput
                    type="number"
                    min="10"
                    max="120"
                    value={config.averageFightDurationSeconds}
                    onChange={(e) => handleConfigChange('averageFightDurationSeconds', parseInt(e.target.value))}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Fight Duration Variance (seconds)</CFormLabel>
                  <CFormInput
                    type="number"
                    min="0"
                    max="60"
                    value={config.fightDurationVariance}
                    onChange={(e) => handleConfigChange('fightDurationVariance', parseInt(e.target.value))}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Base Simul Chance (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    value={Math.round(config.baseSimulChance * 100)}
                    onChange={(e) => handleConfigChange('baseSimulChance', parseInt(e.target.value) / 100)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Simul % Decrease Per Level</CFormLabel>
                  <CFormInput
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    value={Math.round(config.simulReductionPerLevel * 100)}
                    onChange={(e) => handleConfigChange('simulReductionPerLevel', parseInt(e.target.value) / 100)}
                  />
                </CCol>
              </CRow>
            </details>

            {/* Fighter Configuration */}
            <FighterConfig
              fighters={fighters}
              onFightersChange={handleFightersChange}
            />

            {/* Submit Button */}
            <div className="d-grid">
              <CButton
                type="submit"
                color="primary"
                size="lg"
                disabled={!isConfigValid}
              >
                {isConfigValid ? '🏟️ Run Tournament' : '❌ Fix Configuration Errors'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default TournamentConfig;