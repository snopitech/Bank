// components/AI/AITransactions.js
import { formatCurrency } from './AICore';

export const getRecentTransactions = (transactions, count = 5) => {
  if (!transactions || transactions.length === 0) return [];
  return transactions.slice(0, count);
};

export const analyzeTransactions = (query, transactions, spendingData) => {
  const lowerQuery = query.toLowerCase();
  
  // Recent transactions
  if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('last transaction')) {
    const recentTransactions = getRecentTransactions(transactions, 3);
    
    if (recentTransactions.length === 0) {
      return "You don't have any recent transactions to show.";
    }
    
    let response = "Here are your 3 most recent transactions:\n";
    recentTransactions.forEach((tx, index) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      const amount = formatCurrency(tx.amount);
      const type = tx.type.toLowerCase().replace('_', ' ');
      response += `${index + 1}. ${date}: ${tx.description || type} - ${amount}\n`;
    });
    
    return response;
  }
  
  // Large transactions
  if (lowerQuery.includes('large') || lowerQuery.includes('big') && lowerQuery.includes('transaction')) {
    const largeThreshold = spendingData.summary?.averageTransaction * 2 || 100;
    const largeTransactions = transactions.filter(tx => tx.amount > largeThreshold);
    
    if (largeTransactions.length === 0) {
      return `You don't have any transactions over ${formatCurrency(largeThreshold)}.`;
    }
    
    let response = `Transactions over ${formatCurrency(largeThreshold)}:\n`;
    largeTransactions.slice(0, 5).forEach((tx, index) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      response += `${index + 1}. ${date}: ${tx.description || tx.type} - ${formatCurrency(tx.amount)}\n`;
    });
    
    return response;
  }
  
  // Transaction patterns
  if (lowerQuery.includes('pattern') || lowerQuery.includes('frequent')) {
    const transactionTypes = {};
    transactions.forEach(tx => {
      const type = tx.type;
      transactionTypes[type] = (transactionTypes[type] || 0) + 1;
    });
    
    const sortedTypes = Object.entries(transactionTypes).sort((a, b) => b[1] - a[1]);
    
    if (sortedTypes.length === 0) {
      return "No transaction patterns detected.";
    }
    
    let response = "📊 **Transaction Patterns:**\n";
    sortedTypes.slice(0, 3).forEach(([type, count]) => {
      const percentage = (count / transactions.length * 100).toFixed(1);
      response += `• ${type}: ${count} transactions (${percentage}%)\n`;
    });
    
    return response;
  }
  
  return null;
};