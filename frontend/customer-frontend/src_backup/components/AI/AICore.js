// components/AI/AICore.js

// Helper functions used by all modules
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const getCurrentMonth = () => {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long' });
};

export const getSpendingDataSummary = (spendingData) => {
  return {
    totalSpent: spendingData.summary?.totalSpent || 0,
    averageTransaction: spendingData.summary?.averageTransaction || 0,
    largestTransaction: spendingData.summary?.largestTransaction || 0,
    transactionCount: spendingData.summary?.transactionCount || 0,
    categories: spendingData.categories || [],
    monthlyTrend: spendingData.monthlyTrend || [],
    topCategories: spendingData.topCategories || []
  };
};

export const getTopCategory = (spendingData) => {
  if (!spendingData.categories || spendingData.categories.length === 0) {
    return { name: 'No data', value: 0, percentage: 0, count: 0 };
  }
  return spendingData.categories[0];
};