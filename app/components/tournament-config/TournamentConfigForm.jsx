'use client';

import React from 'react';
import {
  CButton,
  CForm,
  CAlert
} from '@coreui/react';
import BasicSettings from './BasicSettings.jsx';
import CombatSettings from './CombatSettings.jsx';
import TournamentModeSettings from './TournamentModeSettings.jsx';
import AdvancedSettings from './AdvancedSettings.jsx';
import FighterConfig from './FighterConfig.jsx';

function TournamentConfigForm({
  config, 
  category,
  fighters, 
  onConfigChange, 
  onCategoryChange,
  onFightersChange,
  onSubmit,
  isValid,
  errors = []
}) {
  return (
    <CForm onSubmit={onSubmit}>
      {errors.length > 0 && (
        <div className="mb-3">
          {errors.map((error, index) => (
            <CAlert key={index} color="danger" className="mb-2">
              ❌ {error}
            </CAlert>
          ))}
        </div>
      )}

      <BasicSettings 
        config={config} 
        fighterCount={fighters.length}
        onConfigChange={onConfigChange} 
      />

      <CombatSettings 
        config={config} 
        category={category}
        onConfigChange={onConfigChange} 
        onCategoryChange={onCategoryChange}
      />

      <TournamentModeSettings 
        config={config} 
        onConfigChange={onConfigChange} 
      />

      <AdvancedSettings 
        config={config} 
        onConfigChange={onConfigChange} 
      />

      <FighterConfig
        fighters={fighters}
        onFightersChange={onFightersChange}
      />

      <div className="d-grid">
        <CButton
          type="submit"
          color="primary"
          size="lg"
          disabled={!isValid}
        >
          {isValid ? '🏟️ Run Tournament' : '❌ Fix Configuration Errors'}
        </CButton>
      </div>
    </CForm>
  );
}

export default TournamentConfigForm;