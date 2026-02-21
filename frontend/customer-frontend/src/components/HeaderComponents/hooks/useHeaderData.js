// src/components/HeaderComponents/hooks/useHeaderData.js
import { useState, useEffect } from 'react';

const useHeaderData = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch('/api/header/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching header stats:', error);
        // Fallback data
        setStats({
          balance: 1001.50,
          todaysTransactions: 12,
          totalAccounts: 2,
          weeklySpending: 450.75
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  return { stats, loading };
};

export default useHeaderData; // Make sure this line exists