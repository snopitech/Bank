/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';

function TeamsPage({ user }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const res = await fetch(`${API_URL}/teams/user/${user.userId}`);
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return;
    await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName, description: newTeamDesc, userId: user.userId })
    });
    setNewTeamName('');
    setNewTeamDesc('');
    setShowCreateForm(false);
    loadTeams();
  }

  const styles = {
    container: { padding: '24px', fontFamily: 'Segoe UI, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    backBtn: { padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    createBtn: { padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    teamsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    teamCard: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' },
    teamIcon: { width: '50px', height: '50px', backgroundColor: '#667eea', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', marginBottom: '12px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' },
    input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '4px' },
    modalButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
    saveBtn: { padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Teams</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
          <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}>+ New Team</button>
        </div>
      </div>

      <div style={styles.teamsGrid}>
        {teams.map(team => (
          <div key={team.id} style={styles.teamCard} onClick={() => navigate('/dashboard')}>
            <div style={styles.teamIcon}>{team.name?.charAt(0)}</div>
            <h3>{team.name}</h3>
            <p>{team.description}</p>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Create Team</h3>
            <input type="text" placeholder="Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} style={styles.input} />
            <input type="text" placeholder="Description" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} style={styles.input} />
            <div style={styles.modalButtons}>
              <button onClick={createTeam} style={styles.saveBtn}>Create</button>
              <button onClick={() => setShowCreateForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamsPage;