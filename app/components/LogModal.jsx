import React, { useState, useEffect, useCallback } from 'react';
import {
  CButton, 
  CCard, 
  CCardBody,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CBadge 
} from '@coreui/react';

// Import the logger from the tournament simulator
import { tournamentLogger } from '../../lib/tournament-simulator.js';

export default function LogModal() {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Handle log updates from the tournament logger
  const handleLogUpdate = useCallback((logEntry, action) => {
    if (action === 'clear') {
      setLogs([]);
      setLogCount(0);
    } else if (logEntry) {
      setLogs(prevLogs => [...prevLogs, logEntry]);
      setLogCount(prevCount => prevCount + 1);
    }
  }, []);

  useEffect(() => {
    // Subscribe to tournament logger
    const unsubscribe = tournamentLogger.addListener(handleLogUpdate);
    
    // Load any existing logs
    const existingLogs = tournamentLogger.getAllLogs();
    if (existingLogs.length > 0) {
      setLogs(existingLogs);
      setLogCount(existingLogs.length);
    }

    return unsubscribe;
  }, [handleLogUpdate]);

  const clearLogs = () => {
    tournamentLogger.clear();
  };

  const getLogStyle = (logType) => {
    switch (logType) {
      case 'header':
        return 'text-primary fw-bold border-bottom pb-2 mb-2';
      case 'winner':
        return 'text-warning fw-bold';
      case 'pit':
        return 'text-success';
      case 'progress':
        return 'text-info small';
      case 'retirement':
        return 'text-danger';
      case 'config':
        return 'text-secondary small';
      case 'summary':
        return 'text-primary fw-bold border-top pt-2 mt-2';
      default:
        return 'text-dark';
    }
  };

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isVisible && logs.length > 0) {
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        setTimeout(() => {
          logContainer.scrollTop = logContainer.scrollHeight;
        }, 100);
      }
    }
  }, [logs.length, isVisible]);

  return (
    <>
      {/* Floating Button - Top Right */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1050 
        }}
      >
        <CButton 
          color="info" 
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="position-relative"
        >
          📋 Simulation Logs
        </CButton>
      </div>

      {/* Off-canvas Sidebar for Logs */}
      <COffcanvas 
        placement="end" 
        visible={isVisible} 
        onHide={() => setIsVisible(false)}
        style={{ width: '600px' }}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>
            🏟️ Tournament Simulation Logs
            {logs.length > 0 && (
              <CBadge color="info" className="ms-2">
                {logs.length} messages
              </CBadge>
            )}
          </COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="text-muted">
              Real-time simulation messages
            </small>
            <div className="d-flex gap-2">
              <CButton 
                color="secondary" 
                size="sm" 
                variant="outline"
                onClick={clearLogs}
                disabled={logs.length === 0}
              >
                Clear Logs
              </CButton>
              {logs.length > 0 && (
                <CButton 
                  color="info" 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const logContainer = document.getElementById('log-container');
                    if (logContainer) {
                      logContainer.scrollTop = logContainer.scrollHeight;
                    }
                  }}
                >
                  Jump to Bottom
                </CButton>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <CCard className="text-center">
              <CCardBody>
                <p className="text-muted mb-2">
                  No logs yet. Run a tournament simulation to see messages here.
                </p>
                <small className="text-muted">
                  💡 Logs are automatically captured from tournament simulations
                </small>
              </CCardBody>
            </CCard>
          ) : (
            <div 
              id="log-container"
              style={{ 
                maxHeight: '70vh', 
                overflowY: 'auto',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid #dee2e6'
              }}
            >
              {logs.map((log) => {
                return (
                  <div 
                    key={log.id} 
                    className="mb-2 pb-2"
                    style={{ 
                      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className={getLogStyle(log.type)} style={{ flex: 1 }}>
                        {log.message.split('\n').map((line, index) => (
                          <div key={index} style={{ marginLeft: index > 0 ? '1rem' : '0' }}>
                            {line}
                          </div>
                        ))}
                      </div>
                      <small className="text-muted ms-2" style={{ minWidth: 'fit-content' }}>
                        {log.timestamp}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-3 text-center">
              <small className="text-muted">
                {logs.length} total messages • Auto-scrolls to new entries
              </small>
            </div>
          )}
        </COffcanvasBody>
      </COffcanvas>
    </>
  );
}