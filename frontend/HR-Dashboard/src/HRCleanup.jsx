import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

export default function HRCleanup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [days, setDays] = useState(30);
  const [emailPattern, setEmailPattern] = useState('test');

  const cleanupOldVerifications = async () => {
    if (!window.confirm(`Are you sure you want to delete all verifications older than ${days} days?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/verifications/cleanup?olderThanDays=${days}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      setResult({
        type: 'success',
        message: data.message,
        count: data.deletedCount
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupAllVerifications = async () => {
    if (!window.confirm('⚠️ DANGER: This will delete ALL verifications! Are you absolutely sure?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/verifications/cleanup`, {
        method: 'DELETE'
      });
      const data = await response.json();
      setResult({
        type: 'success',
        message: data.message,
        count: data.deletedCount
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    description: {
      fontSize: '14px',
      color: '#666'
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '16px'
    },
    inputGroup: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '20px'
    },
    input: {
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      width: '80px'
    },
    label: {
      fontSize: '14px',
      color: '#666'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    dangerButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    resultCard: {
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '20px'
    },
    errorCard: {
      background: '#fef2f2',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '20px'
    },
    resultMessage: {
      fontSize: '14px',
      color: '#333'
    },
    backButton: {
      background: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Data Cleanup</h1>
        <p style={styles.description}>
          Clean up test data and old records from the system
        </p>
      </div>

      {/* Old Verifications Cleanup */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🧹 Cleanup Old Verifications</h3>
        <div style={styles.inputGroup}>
          <span style={styles.label}>Delete verifications older than</span>
          <input
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            style={styles.input}
          />
          <span style={styles.label}>days</span>
        </div>
        <button
          style={styles.button}
          onClick={cleanupOldVerifications}
          disabled={loading}
        >
          {loading ? 'Cleaning...' : 'Cleanup Old Verifications'}
        </button>
      </div>

      {/* Danger Zone - Delete All */}
      <div style={{...styles.card, border: '2px solid #ef4444'}}>
        <h3 style={{...styles.cardTitle, color: '#ef4444'}}>⚠️ Danger Zone</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          These actions cannot be undone. Be absolutely certain.
        </p>
        <button
          style={styles.dangerButton}
          onClick={cleanupAllVerifications}
          disabled={loading}
        >
          Delete ALL Verifications
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={result.type === 'success' ? styles.resultCard : styles.errorCard}>
          <p style={styles.resultMessage}>
            {result.message}
            {result.count && ` (${result.count} records affected)`}
          </p>
        </div>
      )}
    </div>
  );
}
