'use client';

import React from 'react';
import {
  CButton,
  CForm
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
  isValid 
}) {
  return (
    <CForm onSubmit={onSubmit}>
      <BasicSettings 
        config={config} 
        fighters={fighters} 
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