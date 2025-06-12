'use client';

import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader
} from '@coreui/react';
import { DEFAULT_CONFIG } from '../../utils/constants.js';
import TournamentConfigForm from './tournament-config/TournamentConfigForm.jsx';
import useConfigValidation from './tournament-config/hooks/useConfigValidation.js';
import useCategoryManager from './tournament-config/hooks/useCategoryManager.js';

function TournamentConfig({ onConfigChange, onRunTournament }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [category, setCategory] = useState('default');
  const [fighters, setFighters] = useState([
    { name: 'Fighter1', level: 4 },
    { name: 'Fighter2', level: 3 },
    { name: 'Fighter3', level: 2 },
    { name: 'Fighter4', level: 1 },
  ]);

  const { errors, isValid } = useConfigValidation(config, fighters);
  const { handleCategoryChange } = useCategoryManager(config, setConfig, onConfigChange);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleFightersChange = (newFighters) => {
    setFighters(newFighters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) {
      alert('Configuration errors:\n' + errors.join('\n'));
      return;
    }

    onRunTournament?.({ ...config, fighters });
  };

  const handleCategoryChangeWrapper = (selectedCategory) => {
    setCategory(selectedCategory);
    handleCategoryChange(selectedCategory);
  };

  return (
    <div>
      <CCard className="mt-3">
        <CCardHeader>
          <h5>Tournament Settings</h5>
        </CCardHeader>
        <CCardBody>
          <TournamentConfigForm
            config={config}
            category={category}
            fighters={fighters}
            onConfigChange={handleConfigChange}
            onCategoryChange={handleCategoryChangeWrapper}
            onFightersChange={handleFightersChange}
            onSubmit={handleSubmit}
            isValid={isValid}
          />
        </CCardBody>
      </CCard>
    </div>
  );
}

export default TournamentConfig;