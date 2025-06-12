'use client';

import React from 'react';
import {
  CCol,
  CFormLabel,
  CFormSelect,
  CRow
} from '@coreui/react';

function CombatSettings({ config, category, onConfigChange, onCategoryChange }) {
  return (
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>Queue Strategy</CFormLabel>
        <CFormSelect
          value={String(config.useShortestQueue)}
          onChange={(e) => onConfigChange('useShortestQueue', e.target.value === 'true')}
        >
          <option value="false">Shared Queue</option>
          <option value="true">Shortest Queue per Pit</option>
        </CFormSelect>
      </CCol>
      <CCol md={6}>
        <CFormLabel>Category</CFormLabel>
        <CFormSelect
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="single-short">Single Short</option>
          <option value="sword-board">Sword & Board</option>
          <option value="flo">Flo</option>
        </CFormSelect>
      </CCol>
    </CRow>
  );
}

export default CombatSettings;