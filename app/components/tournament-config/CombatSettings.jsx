'use client';

import React from 'react';
import {
  CCol,
  CFormLabel,
  CFormSelect,
  CRow
} from '@coreui/react';
import InfoButton from '../common/InfoButton';

function CombatSettings({ config, category, onConfigChange, onCategoryChange }) {
  return (
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel className="d-flex align-items-center">
          <span style={{ minWidth: '120px' }}>Queue Strategy</span>
          <InfoButton description="Shared Queue: All fighters wait in a single queue and are assigned to the first available pit. Shortest Queue: Fighters are assigned to pits with the shortest waiting line." />
        </CFormLabel>
        <CFormSelect
          value={String(config.useShortestQueue)}
          onChange={(e) => onConfigChange('useShortestQueue', e.target.value === 'true')}
        >
          <option value="false">Shared Queue</option>
          <option value="true">Shortest Queue per Pit</option>
        </CFormSelect>
      </CCol>
      <CCol md={6}>
        <CFormLabel className="d-flex align-items-center">
          <span style={{ minWidth: '120px' }}>Category</span>
          <InfoButton description="This varies the default settings for fight duration and simul chance." />
        </CFormLabel>
        <CFormSelect
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="default">Single Short</option>
          <option value="great">Great</option>
          <option value="sword-board">Sword & Board</option>
          <option value="flo">Flo</option>
        </CFormSelect>
      </CCol>
    </CRow>
  );
}

export default CombatSettings;