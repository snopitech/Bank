const API_BASE = "http://localhost:8080";

// ==================== EMPLOYEE API CALLS ====================

// Get all employees
export const getAllEmployees = async () => {
  const response = await fetch(`${API_BASE}/api/employees/admin/all`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch employees");
  }
  return response.json();
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch employee");
  }
  return response.json();
};

// Create new employee
export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE}/api/employees/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create employee");
  }
  return data;
};

// Update employee profile
export const updateEmployeeProfile = async (id, updateData) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/update-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update employee");
  }
  return data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete employee");
  }
  return true;
};

// Search employees
export const searchEmployees = async (searchTerm) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/search?q=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to search employees");
  }
  return response.json();
};

// Get pending employees
export const getPendingEmployees = async () => {
  const response = await fetch(`${API_BASE}/api/employees/admin/pending`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch pending employees");
  }
  return response.json();
};

// Get approved employees
export const getApprovedEmployees = async () => {
  const response = await fetch(`${API_BASE}/api/employees/admin/approved`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch approved employees");
  }
  return response.json();
};

// ==================== EMPLOYEE ACTIONS ====================

// Approve employee
export const approveEmployee = async (id, approvedBy = "snopitech@gmail.com") => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      approvedBy,
      sendWelcomeEmail: true
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to approve employee");
  }
  return data;
};

// Reject employee
export const rejectEmployee = async (id, reason) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
      sendNotificationEmail: true
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to reject employee");
  }
  return data;
};

// Reset employee password (HR-initiated)
export const resetEmployeePassword = async (id) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/reset-password`, {
    method: 'POST'
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
};

// Disable employee
export const disableEmployee = async (id) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/disable`, {
    method: 'PUT'
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to disable employee");
  }
  return data;
};

// Enable employee
export const enableEmployee = async (id) => {
  const response = await fetch(`${API_BASE}/api/employees/admin/${id}/enable`, {
    method: 'PUT'
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to enable employee");
  }
  return data;
};

// ==================== AUTHENTICATION ====================

// HR Login (using employee login + permission check)
export const hrLogin = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Invalid email or password");
  }

  // Check if user has HR permissions
  const employee = data.employee;
  const hasHRAccess = employee.permissions?.manageEmployees === true;

  if (!hasHRAccess) {
    throw new Error("Access denied. HR privileges required.");
  }

  return employee;
};

// Logout
export const hrLogout = () => {
  localStorage.removeItem('hrUser');
};

// Get current HR user
export const getCurrentHRUser = () => {
  const user = localStorage.getItem('hrUser');
  return user ? JSON.parse(user) : null;
};

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const employees = await getAllEmployees();
    
    return {
      totalEmployees: employees.length,
      pendingApprovals: employees.filter(emp => emp.status === "PENDING").length,
      activeEmployees: employees.filter(emp => emp.status === "APPROVED" && emp.isActive).length,
      departments: [...new Set(employees.map(emp => emp.department).filter(Boolean))].length,
      recentActivity: employees
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          status: emp.status,
          createdAt: emp.createdAt
        }))
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
};