import React from 'react';
import { CCard, CCardBody } from '@coreui/react';

export default function EmptyResults() {
  return (
    <CCard>
      <CCardBody>
        <p>No results yet. Run a tournament to see results.</p>
      </CCardBody>
    </CCard>
  );
}