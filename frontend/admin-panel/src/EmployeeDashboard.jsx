import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const employeeData = localStorage.getItem("employeeUser");
    if (!employeeData) {
      navigate("/employee-login");
      return;
    }
    setEmployee(JSON.parse(employeeData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("employeeUser");
    navigate("/");
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: '#667eea',
      color: 'white',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    content: {
      padding: '30px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    },
    logoutButton: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  };

  if (!employee) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Employee Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.card}>
          <h2>Welcome, {employee.firstName} {employee.lastName}!</h2>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Employee ID:</strong> {employee.employeeId}</p>
          <p><strong>Role:</strong> {employee.role}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Status:</strong> {employee.status}</p>
        </div>
      </div>
    </div>
  );
}