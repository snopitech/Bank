// components/AI/AIBudget.js
import { formatCurrency, getTopCategory, getCurrentMonth } from './AICore';

export const analyzeBudget = (query, spendingData) => {
  const lowerQuery = query.toLowerCase();
  const topCategory = getTopCategory(spendingData);
  const totalSpent = spendingData.summary?.totalSpent || 0;
  
  if (lowerQuery.includes('budget') || (lowerQuery.includes('save money') && !lowerQuery.includes('potential'))) {
    if (totalSpent === 0) {
      return "I need more spending data to provide budget recommendations.";
    }
    
    let response = `📋 **Budget Recommendations for ${getCurrentMonth()}:**\n`;
    response += `1. Your ${topCategory.name} spending is ${topCategory.percentage.toFixed(1)}% of your total. Consider a ${formatCurrency(topCategory.value * 0.8)} budget for this category.\n`;
    response += `2. Try to save at least 20% of your income each month.\n`;
    response += `3. Review recurring subscriptions and cancel any unused services.\n`;
    response += `4. Set up automated transfers to savings on payday.\n`;
    response += `5. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
    
    return response;
  }
  
  // Budget alerts
  if (lowerQuery.includes('over budget') || lowerQuery.includes('exceed')) {
    if (topCategory.name === 'No data') {
      return "I need more data to check budget status.";
    }
    
    // Simple check: if top category is > 40% of total, it might be high
    if (topCategory.percentage > 40) {
      return `⚠️ **Budget Alert:** Your ${topCategory.name} spending (${topCategory.percentage.toFixed(1)}% of total) might be too high. Consider reducing this category.`;
    }
    
    return "Your spending looks balanced across categories. No budget alerts at this time.";
  }
  
  // Budget setup help
  if (lowerQuery.includes('set budget') || lowerQuery.includes('create budget')) {
    return `📝 **How to Set Up a Budget:**\n`;
    response += `1. Calculate your monthly income\n`;
    response += `2. Track all expenses for one month\n`;
    response += `3. Categorize expenses (needs, wants, savings)\n`;
    response += `4. Allocate percentages: 50% needs, 30% wants, 20% savings\n`;
    response += `5. Use budgeting tools or apps to track\n`;
    response += `6. Review and adjust monthly`;
    
    return response;
  }
  
  return null;
};