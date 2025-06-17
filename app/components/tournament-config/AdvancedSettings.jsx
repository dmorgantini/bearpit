'use client';

import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CRow
} from '@coreui/react';
import { FightDurationSettings } from './FightDurationSettings';

function AdvancedSettings({ config, onConfigChange }) {
  return (
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
            onChange={(e) => onConfigChange('skillMultiplier', parseFloat(e.target.value))}
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
            onChange={(e) => onConfigChange('fatigueMultiplier', parseFloat(e.target.value))}
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
            onChange={(e) => onConfigChange('restPeriodSeconds', parseInt(e.target.value))}
          />
        </CCol>
      </CRow>
      <FightDurationSettings config={config} onConfigChange={onConfigChange} />
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Base Simul Chance (%)</CFormLabel>
          <CFormInput
            type="number"
            step="1"
            min="0"
            max="50"
            value={Math.round(config.baseSimulChance * 100)}
            onChange={(e) => onConfigChange('baseSimulChance', parseInt(e.target.value) / 100)}
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
            onChange={(e) => onConfigChange('simulReductionPerLevel', parseInt(e.target.value) / 100)}
          />
        </CCol>
      </CRow>
    </details>
  );
}

export default AdvancedSettings;