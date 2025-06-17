'use client';
import { CRow, CCol, CFormLabel, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react';
import React from 'react';
import InfoButton from '../common/InfoButton';

export function FightDurationSettings({ config, onConfigChange }) {
  return (
    <div className="mb-3">
      <h6 className="mb-3">Fight Duration Settings</h6>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Mean Duration</span>
            <InfoButton description="The average length of a fight in seconds. Most fights will be close to this duration, with some variation based on the standard deviation." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="0.1"
              min="5"
              max="60"
              value={config.meanFightDurationSeconds}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('meanFightDurationSeconds', value === '' ? '' : parseFloat(value));
              }} 
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Standard Deviation</span>
            <InfoButton description="Controls how much fight durations vary from the mean. Higher values create more unpredictable fight lengths, while lower values keep fights more consistent." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="0.1"
              min="1"
              max="30"
              value={config.fightDurationStdDev}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('fightDurationStdDev', value === '' ? '' : parseFloat(value));
              }} 
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Outlier Chance</span>
            <InfoButton description="The chance of a fight being significantly shorter or longer than normal." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="1"
              min="0"
              max="50"
              value={Math.round(config.outlierChance * 100)}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('outlierChance', value === '' ? '' : parseInt(value) / 100);
              }} 
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Min Duration</span>
            <InfoButton description="The shortest possible duration for a fight. This prevents fights from being unrealistically short." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              min="1"
              max="30"
              value={config.minFightDurationSeconds}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('minFightDurationSeconds', value === '' ? '' : parseInt(value));
              }} 
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Max Duration</span>
            <InfoButton description="The longest possible duration for a fight. This prevents fights from being unrealistically long." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              min="30"
              max="120"
              value={config.maxFightDurationSeconds}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('maxFightDurationSeconds', value === '' ? '' : parseInt(value));
              }} 
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex align-items-center">
            <span style={{ minWidth: '120px' }}>Simulation Time Step</span>
            <InfoButton description="The time interval used for simulation calculations. Lower values give more precise timing but slower simulation. Higher values make simulation faster but less accurate." />
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={config.simulationTimeStepSeconds}
              onChange={(e) => {
                const value = e.target.value;
                onConfigChange('simulationTimeStepSeconds', value === '' ? '' : parseFloat(value));
              }} 
            />
            <CInputGroupText>seconds</CInputGroupText>
          </CInputGroup>
        </CCol>
      </CRow>
    </div>
  );
}
