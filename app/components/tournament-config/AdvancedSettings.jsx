'use client';

import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CRow,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import { FightDurationSettings } from './FightDurationSettings';
import InfoButton from '../common/InfoButton';

function AdvancedSettings({ config, onConfigChange }) {
  return (
    <details className="mb-3">
      <summary className="mb-2">Advanced Settings</summary>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Skill Multiplier</span>
            <InfoButton description="Controls how much a fighter's skill level affects their win chance. Higher values make skill differences more impactful, while lower values make fights more random." />
          </CFormLabel>
          <CFormInput
            type="number"
            step="0.1"
            min="1"
            max="10"
            value={config.skillMultiplier}
            onChange={(e) => {
              const value = e.target.value;
              onConfigChange('skillMultiplier', value === '' ? '' : parseFloat(value));
            }}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Fatigue Multiplier</span>
            <InfoButton description="Reduces a fighter's win chance for each consecutive win, simulating fatigue. For example, at 2%, a fighter with 3 wins has 6% lower win chance." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={(config.fatigueMultiplier * 1000).toFixed(1)}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('fatigueMultiplier', value === '' ? '' : parseFloat(value) / 1000);
              }}
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Rest after Loss</span>
            <InfoButton description="The time a fighter must wait after losing before they can fight again. This prevents unrealistic consecutive fights." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              min="10"
              max="120"
              value={config.restPeriodSeconds}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('restPeriodSeconds', value === '' ? '' : parseInt(value));
              }}
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
      <FightDurationSettings config={config} onConfigChange={onConfigChange} />
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Base Simul Chance</span>
            <InfoButton description="The base chance for two fighters to kill each other in the same fight." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="1"
              min="0"
              max="50"
              value={Math.round(config.baseSimulChance * 100)}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('baseSimulChance', value === '' ? '' : parseInt(value) / 100);
              }}
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Simul % Decrease</span>
            <InfoButton description="Reduces the chance of simultaneous kills depending on the difference in level between the fighters." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="1"
              min="0"
              max="50"
              value={Math.round(config.simulReductionPerLevel * 100)}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('simulReductionPerLevel', value === '' ? '' : parseInt(value) / 100);
              }}
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
    </details>
  );
}

export default AdvancedSettings;