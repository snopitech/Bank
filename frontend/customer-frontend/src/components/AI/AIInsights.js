// components/AI/AIInsights.js
import { formatCurrency, getTopCategory } from './AICore';

export const analyzeSpendingInsights = (query, spendingData) => {
  const lowerQuery = query.toLowerCase();
  const topCategory = getTopCategory(spendingData);
  
  // Savings potential
  if (lowerQuery.includes('save') && (lowerQuery.includes('potential') || lowerQuery.includes('could save'))) {
    if (topCategory.name === 'No data') {
      return "I need more data to suggest savings opportunities.";
    }
    
    const potentialSavings = topCategory.value * 0.1;
    
    let response = `💡 **Savings Opportunity:**\n`;
    response += `Your top spending category (${topCategory.name}) is ${formatCurrency(topCategory.value)}.\n`;
    response += `By reducing this by just 10%, you could save ${formatCurrency(potentialSavings)} this month!\n`;
    response += `That's ${formatCurrency(potentialSavings * 12)} per year!`;
    
    return response;
  }
  
  // Spending efficiency
  if (lowerQuery.includes('efficient') || lowerQuery.includes('optimize')) {
    if (topCategory.name === 'No data') {
      return "I need more spending data to provide optimization tips.";
    }
    
    let response = `💰 **Spending Efficiency Tips:**\n`;
    response += `1. Review your ${topCategory.name} spending - it's ${topCategory.percentage.toFixed(1)}% of your total\n`;
    response += `2. Bundle similar purchases to reduce transaction fees\n`;
    response += `3. Consider bulk purchases for frequently bought items\n`;
    response += `4. Set up spending alerts for categories over budget`;
    
    return response;
  }
  
  // Financial health check
  if (lowerQuery.includes('health') || lowerQuery.includes('how am i doing')) {
    if (topCategory.name === 'No data') {
      return "I need more spending data to assess your financial health.";
    }
    
    const monthlyTrend = spendingData.monthlyTrend || [];
    const hasMultipleMonths = monthlyTrend.length >= 2;
    
    let response = `🏥 **Financial Health Check:**\n`;
    response += `1. You have ${spendingData.summary?.transactionCount || 0} transactions this month\n`;
    response += `2. Average transaction: ${formatCurrency(spendingData.summary?.averageTransaction || 0)}\n`;
    response += `3. Top category: ${topCategory.name} (${topCategory.percentage.toFixed(1)}% of total)\n`;
    
    if (hasMultipleMonths) {
      const comparison = getComparisonToLastMonth(spendingData);
      response += `4. Monthly trend: ${comparison.percentageChange > 0 ? '📈 Increasing' : '📉 Decreasing'} by ${Math.abs(comparison.percentageChange).toFixed(1)}%\n`;
    }
    
    response += `\n📝 **Recommendation:** ${topCategory.percentage > 40 ? 'Consider diversifying your spending across more categories.' : 'Your spending distribution looks balanced!'}`;
    
    return response;
  }
  
  return null;
};