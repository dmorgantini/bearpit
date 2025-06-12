'use client';

import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CRow
} from '@coreui/react';

function BasicSettings({ config, fighters, onConfigChange }) {
  return (
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>Number of Pits</CFormLabel>
        <CFormInput
          type="number"
          min="1"
          max={Math.floor(fighters.length / 2)}
          value={config.numberOfPits}
          onChange={(e) => onConfigChange('numberOfPits', parseInt(e.target.value))}
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
          onChange={(e) => onConfigChange('roundDurationMinutes', parseInt(e.target.value))}
        />
      </CCol>
    </CRow>
  );
}

export default BasicSettings;