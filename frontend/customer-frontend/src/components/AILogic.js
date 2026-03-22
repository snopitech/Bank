// components/AILogic.js

export const analyzeFinancialData = (transactions, spendingData, userQuery) => {
  // Convert user query to lowercase for easier matching
  const query = userQuery.toLowerCase().trim();
  
  // Helper function to get current month
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  };
  
  // Helper function to calculate total spending
  const getTotalSpending = () => {
    return spendingData.summary?.totalSpent || 0;
  };
  
  // Helper function to find top spending category
  const getTopCategory = () => {
    if (!spendingData.categories || spendingData.categories.length === 0) {
      return { name: 'No data', value: 0, percentage: 0 };
    }
    return spendingData.categories[0];
  };
  
  // Helper function to get recent transactions
  const getRecentTransactions = (count = 5) => {
    if (!transactions || transactions.length === 0) return [];
    return transactions.slice(0, count);
  };
  
  // Helper function to get category spending
  const getCategorySpending = (categoryName) => {
    if (!spendingData.categories) return 0;
    const category = spendingData.categories.find(cat => 
      cat.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    return category ? category.amount : 0;
  };
  
  // Helper function to get total balance
  const getTotalBalance = () => {
    // This would need to be passed from Dashboard.jsx
    // For now, we'll return a placeholder
    return 0;
  };
  
  // Helper function to get spending trend
  const getSpendingTrend = () => {
    if (!spendingData.monthlyTrend || spendingData.monthlyTrend.length < 2) {
      return "stable";
    }
    const recent = spendingData.monthlyTrend.slice(-2);
    const change = ((recent[1].amount - recent[0].amount) / recent[0].amount) * 100;
    
    if (change > 10) return "increasing rapidly";
    if (change > 5) return "increasing";
    if (change < -10) return "decreasing rapidly";
    if (change < -5) return "decreasing";
    return "stable";
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // ========== CHECK CONDITIONS IN ORDER ==========
  
  // 1. FIRST: Check for spending questions (most important)
  if (query.includes('how much') && (query.includes('spend') || query.includes('spent'))) {
    const total = getTotalSpending();
    const topCategory = getTopCategory();
    const trend = getSpendingTrend();
    
    return `In ${getCurrentMonth()}, you've spent ${formatCurrency(total)} in total. 
Your biggest spending category is ${topCategory.name} at ${formatCurrency(topCategory.value)}.
This represents ${topCategory.percentage.toFixed(1)}% of your total spending.
Your spending trend is ${trend} compared to last month.`;
  }
  
  // 2. Check for top/biggest expense questions
  if ((query.includes('top') && query.includes('spend')) || 
      query.includes('biggest expense') ||
      query.includes('largest expense')) {
    const topCategory = getTopCategory();
    
    if (topCategory.name === 'No data') {
      return "I don't have enough spending data to analyze yet. Make a few transactions first!";
    }
    
    return `Your top spending category is ${topCategory.name} at ${formatCurrency(topCategory.value)}.
This accounts for ${topCategory.percentage.toFixed(1)}% of your total spending.
You've made ${topCategory.count || 0} transactions in this category.`;
  }
  
  // 3. Check for recent transactions
  if (query.includes('recent') || query.includes('latest') || query.includes('last transaction')) {
    const recentTransactions = getRecentTransactions(3);
    
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
  
  // 4. Check for category-specific questions
  if (query.includes('category') && (query.includes('food') || query.includes('dining'))) {
    const foodSpending = getCategorySpending('food') || getCategorySpending('dining');
    return `You've spent ${formatCurrency(foodSpending)} on Food & Dining this month.`;
  }
  
  if (query.includes('category') && query.includes('shopping')) {
    const shoppingSpending = getCategorySpending('shopping');
    return `You've spent ${formatCurrency(shoppingSpending)} on Shopping this month.`;
  }
  
  if (query.includes('category') && (query.includes('bill') || query.includes('utility'))) {
    const billsSpending = getCategorySpending('bills') || getCategorySpending('utilities');
    return `You've spent ${formatCurrency(billsSpending)} on Bills & Utilities this month.`;
  }
  
  // 5. Check for budget/saving questions
  if (query.includes('budget') || query.includes('save money') || query.includes('saving')) {
    const topCategory = getTopCategory();
    const totalSpent = getTotalSpending();
    
    if (totalSpent === 0) {
      return "I need more spending data to provide budget recommendations. Check back after you've made some transactions!";
    }
    
    return `Based on your spending patterns, here are my suggestions:
1. Your ${topCategory.name} spending is ${topCategory.percentage.toFixed(1)}% of your total. Consider setting a budget limit for this category.
2. Try to save at least 20% of your income each month.
3. Review recurring subscriptions and cancel any you don't use.
4. Consider automated transfers to savings on payday.`;
  }
  
  // 6. Check for trend/comparison questions
  if (query.includes('trend') || query.includes('compare') || query.includes('last month')) {
    const trend = getSpendingTrend();
    const monthlyTrend = spendingData.monthlyTrend || [];
    
    if (monthlyTrend.length < 2) {
      return "I need at least 2 months of data to show spending trends. Check back next month!";
    }
    
    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const prevMonth = monthlyTrend[monthlyTrend.length - 2];
    const change = ((lastMonth.amount - prevMonth.amount) / prevMonth.amount) * 100;
    
    return `Your spending in ${lastMonth.displayMonth} was ${formatCurrency(lastMonth.amount)}.
In ${prevMonth.displayMonth}, you spent ${formatCurrency(prevMonth.amount)}.
That's a ${change > 0 ? '+' : ''}${change.toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'}.
Your spending trend is ${trend}.`;
  }
  
  // 7. Check for summary/overview questions
  if (query.includes('summary') || query.includes('overview') || query.includes('financial summary')) {
    const totalSpent = getTotalSpending();
    const topCategory = getTopCategory();
    const avgTransaction = spendingData.summary?.averageTransaction || 0;
    const transactionCount = spendingData.summary?.transactionCount || 0;
    
    return `Here's your financial summary for ${getCurrentMonth()}:
• Total Spent: ${formatCurrency(totalSpent)}
• Number of Transactions: ${transactionCount}
• Average Transaction: ${formatCurrency(avgTransaction)}
• Top Category: ${topCategory.name} (${formatCurrency(topCategory.value)})
• Largest Single Expense: ${formatCurrency(spendingData.summary?.largestTransaction || 0)}
• Spending Trend: ${getSpendingTrend()}`;
  }
  
  // 8. Check for EXACT greetings (not partial matches)
  if (
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query === 'hello!' ||
    query === 'hi!' ||
    query === 'hey!'
  ) {
    return `Hello! I'm your AI Financial Assistant. I can analyze your spending, track expenses, and provide financial insights. What would you like to know about your finances today?`;
  }
  
  // 9. Check for help questions
  if (query.includes('help') || query.includes('what can you do') || query.includes('capabilities')) {
    return `I can help you with:
• Analyzing your spending habits
• Tracking expenses by category
• Identifying top spending areas
• Viewing recent transactions
• Providing budget suggestions
• Answering financial questions

Try asking me things like:
"How much did I spend this month?"
"Where is most of my money going?"
"Show me my recent transactions"
"What's my biggest expense?"
"How can I save more money?"`;
  }
  
  // 10. Default response for unrecognized queries
  return `I'm not sure I understand. Try asking me about:
• Your spending habits
• Recent transactions
• Budget suggestions
• Spending by category
• Financial trends

Or type "help" to see what I can do!`;
};

// Helper function for quick questions
export const getQuickQuestions = () => {
  return [
    "How much did I spend this month?",
    "What's my biggest expense?",
    "Show recent transactions",
    "Give me budget tips"
  ];
};