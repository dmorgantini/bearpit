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
import InfoButton from '../common/InfoButton';

function BasicSettings({ config, fighterCount, onConfigChange }) {
  const maxPits = Math.floor(fighterCount / 2);

  return (
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel className="d-flex align-items-center">
          <span style={{ minWidth: '120px' }}>Number of Pits</span>
          <InfoButton description="The number of fighting pits in the tournament. Each pit can host one fight at a time." />
        </CFormLabel>
        <CFormInput
          type="number"
          min="1"
          max={maxPits}
          value={config.numberOfPits}
          onChange={(e) => {
            const value = e.target.value;
            onConfigChange('numberOfPits', value === '' ? '' : parseInt(value));
          }}
        />
        <small className="text-muted">
          Max: {maxPits} for {fighterCount} fighters
        </small>
      </CCol>
      <CCol md={6}>
        <CFormLabel className="d-flex align-items-center">
          <span style={{ minWidth: '120px' }}>Round Duration</span>
          <InfoButton description="The total duration of the tournament round. After this time, the tournament will end." />
        </CFormLabel>
        <CInputGroup>
          <CFormInput
            type="number"
            min="5"
            max="60"
            value={config.roundDurationMinutes}
            onChange={(e) => {
              const value = e.target.value;
              onConfigChange('roundDurationMinutes', value === '' ? '' : parseInt(value));
            }}
          />
          <CInputGroupText>minutes</CInputGroupText>
        </CInputGroup>
      </CCol>
    </CRow>
  );
}

export default BasicSettings;