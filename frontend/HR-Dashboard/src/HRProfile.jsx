import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";

const API_BASE = "";

export default function HRProfile() {
  console.log('HRProfile component rendering');
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    phone: "",
    workPhone: "",
    officeLocation: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: ""
  });

  // Get user from localStorage
  useEffect(() => {
    console.log('useEffect - checking localStorage');
    try {
      const hrUser = localStorage.getItem('hrUser');
      console.log('hrUser from localStorage:', hrUser);
      
      if (hrUser) {
        const parsedUser = JSON.parse(hrUser);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('No hrUser found, redirecting to login');
        navigate('/login');
      }
    } catch (err) {
      console.error('Error parsing user:', err);
      setError('Failed to load user data');
      setLoading(false);
    }
  }, [navigate]);

  // Fetch employee data from API
  useEffect(() => {
    const fetchEmployeeData = async () => {
      console.log('fetchEmployeeData - user:', user);
      if (!user?.id) {
        console.log('No user ID, skipping fetch');
        return;
      }
      
      setLoading(true);
      try {
        const url = `${API_BASE}/api/employees/admin/${user.id}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch employee data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Employee data received:', data);
        
        setEmployeeData(data);
        
        setFormData({
          phone: data.phone || "",
          workPhone: data.workPhone || "",
          officeLocation: data.officeLocation || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "USA",
          emergencyName: data.emergencyName || "",
          emergencyRelationship: data.emergencyRelationship || "",
          emergencyPhone: data.emergencyPhone || ""
        });
        
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError(error.message);
        setSaveMessage({
          type: "error",
          text: "Failed to load profile data"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      const updateData = {
        phone: formData.phone,
        workPhone: formData.workPhone,
        officeLocation: formData.officeLocation,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        emergencyName: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone
      };

      const response = await fetch(`${API_BASE}/api/employees/admin/${user.id}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const updatedData = await response.json();
      setEmployeeData(updatedData);

      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!"
      });
      setIsEditing(false);

      setTimeout(() => {
        setSaveMessage({ type: "", text: "" });
      }, 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage({
        type: "error",
        text: error.message || "Failed to update profile"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (employeeData) {
      setFormData({
        phone: employeeData.phone || "",
        workPhone: employeeData.workPhone || "",
        officeLocation: employeeData.officeLocation || "",
        addressLine1: employeeData.addressLine1 || "",
        addressLine2: employeeData.addressLine2 || "",
        city: employeeData.city || "",
        state: employeeData.state || "",
        zipCode: employeeData.zipCode || "",
        country: employeeData.country || "USA",
        emergencyName: employeeData.emergencyName || "",
        emergencyRelationship: employeeData.emergencyRelationship || "",
        emergencyPhone: employeeData.emergencyPhone || ""
      });
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChangeSuccess = () => {
    localStorage.removeItem('hrUser');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getEmploymentTypeLabel = (type) => {
    switch(type) {
      case 'full-time': return 'Full Time';
      case 'part-time': return 'Part Time';
      case 'contract': return 'Contract';
      case 'intern': return 'Intern';
      default: return type || 'Not specified';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    backButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    saveMessage: {
      background: '#f0fdf4',
      border: '2px solid #22c55e',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    errorMessage: {
      background: '#fef2f2',
      border: '2px solid #ef4444',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    profileHeader: {
      background: 'linear-gradient(to right, #667eea, #764ba2)',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      color: 'white'
    },
    profileHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    profileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    },
    avatar: {
      width: '80px',
      height: '80px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      border: '3px solid white'
    },
    profileName: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    profileMeta: {
      fontSize: '14px',
      opacity: 0.9
    },
    editButton: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    saveButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginRight: '12px'
    },
    cancelButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    fieldGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px',
      fontWeight: '500'
    },
    value: {
      fontSize: '16px',
      color: '#333',
      fontWeight: '500',
      padding: '8px 0'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white'
    },
    divider: {
      height: '1px',
      background: '#f0f0f0',
      margin: '20px 0'
    },
    passwordCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    passwordButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    },
    errorContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      color: '#ef4444'
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div style={styles.loadingContainer}>
        <div>No employee data found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Save/Error Message */}
        {saveMessage.text && (
          <div style={saveMessage.type === 'success' ? styles.saveMessage : styles.errorMessage}>
            <span style={{ fontSize: '20px' }}>{saveMessage.type === 'success' ? '✅' : '❌'}</span>
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.profileHeaderContent}>
            <div style={styles.profileInfo}>
              <div style={styles.avatar}>
                {employeeData.firstName?.charAt(0)}{employeeData.lastName?.charAt(0)}
              </div>
              <div>
                <div style={styles.profileName}>
                  {employeeData.firstName} {employeeData.lastName}
                </div>
                <div style={styles.profileMeta}>
                  {employeeData.role} • {employeeData.department} • HR Portal
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <button style={styles.editButton} onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div>
                <button 
                  style={styles.saveButton} 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  style={styles.cancelButton} 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  ✕ Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information Card - READ ONLY */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>👤</span> Personal Information
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>First Name</div>
              <div style={styles.value}>{employeeData.firstName}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Last Name</div>
              <div style={styles.value}>{employeeData.lastName}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Email Address</div>
              <div style={styles.value}>{employeeData.email}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Employee ID</div>
              <div style={styles.value}>{employeeData.employeeId}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Department</div>
              <div style={styles.value}>{employeeData.department}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Role / Job Title</div>
              <div style={styles.value}>{employeeData.role}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Date of Birth</div>
              <div style={styles.value}>{formatDate(employeeData.dateOfBirth)}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>SSN (Last 4)</div>
              <div style={styles.value}>•••-••-{employeeData.maskedSsn?.slice(-4)}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Hire Date</div>
              <div style={styles.value}>{formatDate(employeeData.hireDate)}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Reports To</div>
              <div style={styles.value}>{employeeData.reportsTo || 'Not specified'}</div>
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Employment Type</div>
              <div style={styles.value}>{getEmploymentTypeLabel(employeeData.employmentType)}</div>
            </div>
          </div>
        </div>

        {/* Contact Information Card - EDITABLE */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>📞</span> Contact Information
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Phone Number</div>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="(123) 456-7890"
                />
              ) : (
                <div style={styles.value}>{employeeData.phone || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Work Phone</div>
              {isEditing ? (
                <input
                  type="text"
                  name="workPhone"
                  value={formData.workPhone}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="(123) 456-7890"
                />
              ) : (
                <div style={styles.value}>{employeeData.workPhone || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Office Location</div>
              {isEditing ? (
                <input
                  type="text"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Building/Floor/Desk"
                />
              ) : (
                <div style={styles.value}>{employeeData.officeLocation || 'Not provided'}</div>
              )}
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Address Line 1</div>
              {isEditing ? (
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Street address"
                />
              ) : (
                <div style={styles.value}>{employeeData.addressLine1 || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Address Line 2</div>
              {isEditing ? (
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Apt/Suite/Unit"
                />
              ) : (
                <div style={styles.value}>{employeeData.addressLine2 || ''}</div>
              )}
            </div>
          </div>

          <div style={styles.grid3}>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>City</div>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="City"
                />
              ) : (
                <div style={styles.value}>{employeeData.city || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>State</div>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="State"
                />
              ) : (
                <div style={styles.value}>{employeeData.state || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Zip Code</div>
              {isEditing ? (
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Zip code"
                />
              ) : (
                <div style={styles.value}>{employeeData.zipCode || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact Card - EDITABLE */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>🚨</span> Emergency Contact
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Contact Name</div>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Full name"
                />
              ) : (
                <div style={styles.value}>{employeeData.emergencyName || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Relationship</div>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Spouse, parent, etc."
                />
              ) : (
                <div style={styles.value}>{employeeData.emergencyRelationship || 'Not provided'}</div>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Emergency Phone</div>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="(123) 456-7890"
                />
              ) : (
                <div style={styles.value}>{employeeData.emergencyPhone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div style={styles.passwordCard}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              🔐 Password
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Change your password regularly for security
            </div>
          </div>
          <button style={styles.passwordButton} onClick={handleChangePassword}>
            Change Password
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={employeeData.email}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}
