'use client';

import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow
} from '@coreui/react';
import InfoButton from '../common/InfoButton';

function TournamentModeSettings({ config, onConfigChange }) {
  return (
    <>
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Tournament Mode</span>
            <InfoButton description="Traditional: Fighters compete for the longest win streak. Retirement Race: Fighters retire after reaching a target win streak, with a limited number of retirement slots available." />
          </CFormLabel>
          <CFormSelect
            value={config.retirementStreakLength || ''}
            onChange={(e) => {
              const value = e.target.value;
              onConfigChange('retirementStreakLength',
                value === '' ? null :
                  value === 'auto' ? 'auto' :
                    parseInt(value)
              );
            }}
          >
            <option value="">Traditional (longest streak wins)</option>
            <option value="auto">Retirement Race (auto streak)</option>
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
              <CFormLabel className="d-flex align-items-center">
                <span style={{ minWidth: '120px' }}>Max Retirements</span>
                <InfoButton description="The maximum number of fighters that can retire in the tournament. Once this limit is reached, other fighters who reach the target streak will be blocked from retiring." />
              </CFormLabel>
              <CFormInput
                type="number"
                min="1"
                max="10"
                value={config.maxRetirements}
                onChange={(e) => {
                  const value = e.target.value;
                  onConfigChange('maxRetirements', value === '' ? '' : parseInt(value));
                }}
              />
            </>
          )}
        </CCol>
      </CRow>
    </>
  );
}

export default TournamentModeSettings;