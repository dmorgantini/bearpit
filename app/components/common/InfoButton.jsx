import React from 'react';
import { cilInfo } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import { CTooltip } from '@coreui/react';

function InfoButton({ description }) {
  return (
    <CTooltip
      content={description}
      placement="top"
      trigger="hover"
      delay={{ show: 100, hide: 100 }}
    >
      <CIcon 
        icon={cilInfo} 
        size="sm"
        className="ms-auto text-info"
        style={{ cursor: 'help' }}
      />
    </CTooltip>
  );
}

export default InfoButton; 