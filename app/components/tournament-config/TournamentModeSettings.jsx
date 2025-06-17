
'use client';

import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow
} from '@coreui/react';

function TournamentModeSettings({ config, onConfigChange }) {
  return (
    <>
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>Tournament Mode</CFormLabel>
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
              <CFormLabel>Max Retirements</CFormLabel>
              <CFormInput
                type="number"
                min="1"
                max="10"
                value={config.maxRetirements}
                onChange={(e) => onConfigChange('maxRetirements', parseInt(e.target.value))}
              />
            </>
          )}
        </CCol>
      </CRow>
    </>
  );
}

export default TournamentModeSettings;