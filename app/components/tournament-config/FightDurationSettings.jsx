'use client';
import { CRow, CCol, CFormLabel, CFormInput } from '@coreui/react';
import React from 'react';

export function FightDurationSettings({ config, onConfigChange }) {
  return (
    <div className="mb-3">
      <h6 className="mb-3">Fight Duration Settings</h6>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Mean Duration (seconds)</CFormLabel>
          <CFormInput
            type="number"
            step="0.1"
            min="5"
            max="60"
            value={config.meanFightDurationSeconds}
            onChange={(e) => onConfigChange('meanFightDurationSeconds', parseFloat(e.target.value))} />
          <small className="text-muted">Average fight duration in seconds</small>
        </CCol>
        <CCol md={6}>
          <CFormLabel>Standard Deviation (seconds)</CFormLabel>
          <CFormInput
            type="number"
            step="0.1"
            min="1"
            max="30"
            value={config.fightDurationStdDev}
            onChange={(e) => onConfigChange('fightDurationStdDev', parseFloat(e.target.value))} />
          <small className="text-muted">How much fight durations vary from the mean</small>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Outlier Chance (%)</CFormLabel>
          <CFormInput
            type="number"
            step="1"
            min="0"
            max="50"
            value={Math.round(config.outlierChance * 100)}
            onChange={(e) => onConfigChange('outlierChance', parseInt(e.target.value) / 100)} />
          <small className="text-muted">Chance of very short or long fights</small>
        </CCol>
        <CCol md={6}>
          <CFormLabel>Min Duration (seconds)</CFormLabel>
          <CFormInput
            type="number"
            min="1"
            max="30"
            value={config.minFightDurationSeconds}
            onChange={(e) => onConfigChange('minFightDurationSeconds', parseInt(e.target.value))} />
          <small className="text-muted">Shortest possible fight duration</small>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Max Duration (seconds)</CFormLabel>
          <CFormInput
            type="number"
            min="30"
            max="120"
            value={config.maxFightDurationSeconds}
            onChange={(e) => onConfigChange('maxFightDurationSeconds', parseInt(e.target.value))} />
          <small className="text-muted">Longest possible fight duration</small>
        </CCol>
        <CCol md={6}>
          <CFormLabel>Simulation Time Step (seconds)</CFormLabel>
          <CFormInput
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={config.simulationTimeStepSeconds}
            onChange={(e) => onConfigChange('simulationTimeStepSeconds', parseFloat(e.target.value))} />
          <small className="text-muted">Time step for simulation. Lower values give more precise timing but slower simulation.</small>
        </CCol>
      </CRow>
    </div>
  );
}
