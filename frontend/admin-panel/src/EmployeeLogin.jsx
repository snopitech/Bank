import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/employees/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      // Store employee data
      localStorage.setItem("employeeUser", JSON.stringify(data.employee));
      
      // Redirect to employee dashboard
      navigate("/employee-dashboard");

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
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: '30px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    passwordContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: '16px'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666'
    },
    button: {
      width: '100%',
      background: '#667eea',
      color: 'white',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer'
    },
    errorBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      color: '#991b1b',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Employee Login</h1>
        
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            style={styles.input}
            value={form.email}
            onChange={handleChange}
            required
          />
          
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              style={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              background: loading ? '#999' : '#667eea',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}