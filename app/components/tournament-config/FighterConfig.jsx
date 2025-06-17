'use client';

import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormLabel,
  CButton,
  CFormSelect,
  CRow,
  CCol,
  CBadge
} from '@coreui/react';
import { distributions } from '../../../lib/distributions.js';
import { generateFightersFromDistribution } from '../../../utils/helpers.js';

export default function FighterConfig({ fighters, onFightersChange }) {
  const [selectedDistribution, setSelectedDistribution] = useState('');
  const [fighterCount, setFighterCount] = useState(fighters.length);

  const handleFighterChange = (index, field, value) => {
    const newFighters = [...fighters];
    newFighters[index] = { ...newFighters[index], [field]: value };
    onFightersChange(newFighters);
  };

  const addFighter = () => {
    const newFighters = [...fighters, { 
      name: `Fighter${fighters.length + 1}`, 
      level: 1 
    }];
    onFightersChange(newFighters);
    setFighterCount(newFighters.length);
  };

  const removeFighter = (index) => {
    const newFighters = fighters.filter((_, i) => i !== index);
    onFightersChange(newFighters);
    setFighterCount(newFighters.length);
  };

  const clearAllFighters = () => {
    onFightersChange([]);
    setFighterCount(0);
  };

  const handleDistributionGenerate = () => {
    if (!selectedDistribution || fighterCount < 1) return;
    
    const distribution = distributions.find(d => d.name === selectedDistribution);
    if (distribution) {
      const newFighters = generateFightersFromDistribution(fighterCount, distribution.dist);
      onFightersChange(newFighters);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'secondary',
      2: 'info', 
      3: 'primary',
      4: 'success',
      5: 'warning',
      6: 'danger',
      7: 'dark',
      8: 'dark',
      9: 'dark',
      10: 'dark'
    };
    return colors[level] || 'light';
  };

  const getFighterCountByLevel = () => {
    const counts = {};
    fighters.forEach(fighter => {
      counts[fighter.level] = (counts[fighter.level] || 0) + 1;
    });
    return counts;
  };

  const levelCounts = getFighterCountByLevel();
  const avgLevel = fighters.length > 0 
    ? (fighters.reduce((sum, f) => sum + f.level, 0) / fighters.length).toFixed(1)
    : 0;

  return (
    <CCard>
      <CCardHeader>
        <h5>Fighter Configuration</h5>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            Total: {fighters.length} fighters | Average Level: {avgLevel}
          </span>
          <div>
            {Object.entries(levelCounts).map(([level, count]) => (
              <CBadge 
                key={level} 
                color={getLevelColor(parseInt(level))} 
                className="me-1"
              >
                L{level}: {count}
              </CBadge>
            ))}
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        {/* Quick Generation */}
        <div className="mb-4">
          <h6>Quick Fighter Generation</h6>
          <CRow className="align-items-end">
            <CCol md={4}>
              <CFormLabel>Fighter Count</CFormLabel>
              <CFormInput
                type="number"
                min="1"
                max="100"
                value={fighterCount}
                onChange={(e) => {
                  const value = e.target.value;
                  setFighterCount(value === '' ? '' : parseInt(value) || 0);
                }}
              />
            </CCol>
            <CCol md={5}>
              <CFormLabel>Level Distribution</CFormLabel>
              <CFormSelect
                value={selectedDistribution}
                onChange={(e) => setSelectedDistribution(e.target.value)}
              >
                <option value="">Select distribution...</option>
                {distributions.map(dist => (
                  <option key={dist.name} value={dist.name}>
                    {dist.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CButton 
                color="primary" 
                onClick={handleDistributionGenerate}
                disabled={!selectedDistribution || fighterCount < 1}
              >
                Generate
              </CButton>
            </CCol>
          </CRow>
          
          {/* Distribution Preview */}
          {selectedDistribution && (
            <div className="mt-2">
              <small className="text-muted">
                Preview for {fighterCount} fighters: {
                  distributions.find(d => d.name === selectedDistribution)?.dist &&
                  Object.entries(distributions.find(d => d.name === selectedDistribution).dist)
                    .map(([level, weight]) => `L${level}: ${Math.round(fighterCount * weight)}`)
                    .join(', ')
                }
              </small>
            </div>
          )}
        </div>

        {/* Manual Fighter Entry */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Manual Fighter Entry</h6>
            <div>
              <CButton 
                color="secondary" 
                size="sm" 
                onClick={addFighter}
                className="me-2"
              >
                Add Fighter
              </CButton>
              {fighters.length > 0 && (
                <CButton 
                  color="danger" 
                  size="sm" 
                  onClick={clearAllFighters}
                >
                  Clear All
                </CButton>
              )}
            </div>
          </div>

          {fighters.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No fighters configured. Add fighters manually or use quick generation above.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {fighters.map((fighter, index) => (
                <CRow key={index} className="mb-2 align-items-center">
                  <CCol md={5}>
                    <CFormInput
                      placeholder="Fighter Name"
                      value={fighter.name}
                      onChange={(e) => handleFighterChange(index, 'name', e.target.value)}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      min="1"
                      max="10"
                      value={fighter.level}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFighterChange(index, 'level', value === '' ? '' : parseInt(value) || 1);
                      }}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CBadge color={getLevelColor(fighter.level)}>
                      Level {fighter.level}
                    </CBadge>
                  </CCol>
                  <CCol md={2}>
                    <CButton 
                      color="danger" 
                      size="sm"
                      onClick={() => removeFighter(index)}
                    >
                      ✕
                    </CButton>
                  </CCol>
                </CRow>
              ))}
            </div>
          )}
        </div>

        {/* Fighter Validation */}
        {fighters.length > 0 && (
          <div className="mt-3">
            {fighters.length < 4 && (
              <div className="alert alert-warning">
                ⚠️ Warning: Need at least 4 fighters for a meaningful tournament.
              </div>
            )}
            {fighters.some(f => !f.name.trim()) && (
              <div className="alert alert-danger">
                ❌ Error: All fighters must have names.
              </div>
            )}
            {new Set(fighters.map(f => f.name.trim())).size !== fighters.length && (
              <div className="alert alert-danger">
                ❌ Error: Fighter names must be unique.
              </div>
            )}
          </div>
        )}
      </CCardBody>
    </CCard>
  );
}