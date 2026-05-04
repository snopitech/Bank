/* eslint-disable react-hooks/exhaustive-deps */
// src/components/HeaderComponents/hooks/useHeaderData.js
import { useState, useEffect } from 'react';

// Use environment variable for API URL, fallback to empty string for production
const API_BASE = import.meta.env.VITE_API_URL || "";

export default function useHeaderData() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
  const accounts = user?.accounts || [];

  const checkingMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "CHECKING"
  );
  const savingsMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "SAVINGS"
  );

  useEffect(() => {
    fetchHeaderData();
  }, []);

  const fetchHeaderData = async () => {
    try {
      setLoading(true);
      
      let totalBalance = 0;
      let totalAccounts = 0;
      
      // Get current date (day of month)
      const today = new Date();
      const currentDay = today.getDate().toString();

      // Count checking if exists
      if (checkingMeta) {
        totalAccounts++;
        console.log('✓ Checking account counted');
      }

      // Count savings if exists
      if (savingsMeta) {
        totalAccounts++;
        console.log('✓ Savings account counted');
      }

      // Fetch checking balance
      if (checkingMeta?.accountNumber) {
        const checkingRes = await fetch(
          `${API_BASE}/api/accounts/account-number?accountNumber=${checkingMeta.accountNumber}`
        );
        if (checkingRes.ok) {
          const checkingData = await checkingRes.json();
          totalBalance += checkingData.balance || 0;
        }
      }

      // Fetch savings balance
      if (savingsMeta?.accountNumber) {
        const savingsRes = await fetch(
          `${API_BASE}/api/accounts/account-number?accountNumber=${savingsMeta.accountNumber}`
        );
        if (savingsRes.ok) {
          const savingsData = await savingsRes.json();
          totalBalance += savingsData.balance || 0;
        }
      }

      // Fetch business accounts
      if (user?.id) {
        const businessRes = await fetch(`${API_BASE}/api/business/accounts/user/${user.id}`);
        if (businessRes.ok) {
          const businessData = await businessRes.json();
          console.log('Business accounts count:', businessData.length);
          totalAccounts += businessData.length;
          businessData.forEach(biz => {
            totalBalance += biz.accountBalance || 0;
          });
        }
      }

      // Fetch loan accounts - with sessionId header and userId parameter
      if (user?.id && user?.sessionId) {
        try {
          const loanRes = await fetch(`${API_BASE}/api/loan/accounts?userId=${user.id}`, {
            headers: {
              'sessionId': user.sessionId
            }
          });
          if (loanRes.ok) {
            const loanData = await loanRes.json();
            console.log('Loan accounts count:', loanData.length);
            totalAccounts += loanData.length;
          } else {
            console.log('Loan accounts response not OK:', loanRes.status);
          }
        } catch (loanError) {
          console.error('Error fetching loan accounts:', loanError);
        }
      }

      // Also check credit accounts
      if (user?.id) {
        try {
          const creditRes = await fetch(`${API_BASE}/api/credit/accounts/user/${user.id}`);
          if (creditRes.ok) {
            const creditData = await creditRes.json();
            console.log('Credit accounts count:', creditData.length);
            totalAccounts += creditData.length;
            creditData.forEach(credit => {
              totalBalance += credit.currentBalance || 0;
            });
          }
        } catch (creditError) {
          console.error('Error fetching credit accounts:', creditError);
        }
      }

      console.log('Final total accounts count:', totalAccounts);
      console.log('Final total balance:', totalBalance);

      setStats({
        balance: totalBalance,
        totalAccounts: totalAccounts,
        todaysDate: currentDay
      });

    } catch (error) {
      console.error('Error fetching header data:', error);
      // Still show current date even if other fetches fail
      const today = new Date();
      setStats({
        balance: 0,
        totalAccounts: 0,
        todaysDate: today.getDate().toString()
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}