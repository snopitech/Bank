import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function EmployeeApproval() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid approval link");
    }
  }, [token]);

  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/employees/approve?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: "snopitech@gmail.com",
          sendWelcomeEmail: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve employee");
      }

      setEmployee(data.employee);
      setSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/employees/reject?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: "Application rejected by admin",
          sendNotificationEmail: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject employee");
      }

      alert("Employee rejected successfully");
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '40px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '20px'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      margin: '10px'
    },
    rejectButton: {
      background: '#ef4444',
    },
    successCard: {
      background: '#f0fdf4',
      border: '2px solid #22c55e',
      borderRadius: '12px',
      padding: '30px',
      marginTop: '20px'
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Invalid Approval Link</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={styles.button}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success && employee) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Employee Approved Successfully!</h2>
          
          <div style={styles.successCard}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Employee Details:</h3>
            <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Employee ID:</strong> {employee.employeeId}</p>
            <p><strong>Role:</strong> {employee.role}</p>
            <p><strong>Status:</strong> {employee.status}</p>
          </div>
          
          <p style={{ marginTop: '30px', color: '#666' }}>
            An email has been sent to the employee with their login credentials.
          </p>
          
          <button
            onClick={() => navigate('/')}
            style={{...styles.button, marginTop: '20px'}}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
        <h2 style={styles.title}>Employee Approval Request</h2>
        
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Please review and approve or reject this employee application.
        </p>
        
        {loading ? (
          <div style={{ margin: '30px 0' }}>
            <div style={{ fontSize: '20px', color: '#667eea' }}>Processing...</div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleApprove}
              style={{...styles.button, background: '#22c55e'}}
            >
              ✓ Approve Employee
            </button>
            <button
              onClick={handleReject}
              style={{...styles.button, ...styles.rejectButton}}
            >
              ✗ Reject Employee
            </button>
          </div>
        )}
      </div>
    </div>
  );
}