// components/AI/AIPredictions.js
import { formatCurrency } from './AICore';

export const getMonthlyPrediction = (spendingData) => {
  if (!spendingData.summary?.totalSpent) return null;
  
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const spentSoFar = spendingData.summary.totalSpent;
  const dailyAverage = spentSoFar / currentDay;
  const predictedMonthly = dailyAverage * daysInMonth;
  
  return {
    spentSoFar,
    dailyAverage,
    predictedMonthly,
    daysSoFar: currentDay,
    daysInMonth,
    completionPercentage: (currentDay / daysInMonth) * 100
  };
};

export const getComparisonToLastMonth = (spendingData) => {
  if (!spendingData.monthlyTrend || spendingData.monthlyTrend.length < 2) {
    return null;
  }
  
  const currentMonth = spendingData.monthlyTrend[spendingData.monthlyTrend.length - 1];
  const lastMonth = spendingData.monthlyTrend[spendingData.monthlyTrend.length - 2];
  
  const difference = currentMonth.amount - lastMonth.amount;
  const percentageChange = (difference / lastMonth.amount) * 100;
  
  return {
    current: currentMonth.amount,
    previous: lastMonth.amount,
    difference,
    percentageChange,
    trend: percentageChange > 0 ? 'higher' : 'lower'
  };
};

export const analyzePredictions = (query, spendingData) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('end of month')) {
    const prediction = getMonthlyPrediction(spendingData);
    
    if (!prediction) {
      return "I need more spending data to make predictions. Check back in a few days!";
    }
    
    const comparison = getComparisonToLastMonth(spendingData);
    
    let response = `📊 **Monthly Spending Prediction:**\n`;
    response += `• Spent so far: ${formatCurrency(prediction.spentSoFar)} (${prediction.daysSoFar}/${prediction.daysInMonth} days)\n`;
    response += `• Daily average: ${formatCurrency(prediction.dailyAverage)}\n`;
    response += `• Predicted month end: ${formatCurrency(prediction.predictedMonthly)}\n`;
    response += `• Month completion: ${prediction.completionPercentage.toFixed(1)}%\n\n`;
    
    if (comparison) {
      response += `📈 **Comparison to Last Month:**\n`;
      response += `• Current: ${formatCurrency(comparison.current)}\n`;
      response += `• Last month: ${formatCurrency(comparison.previous)}\n`;
      response += `• Difference: ${comparison.difference > 0 ? '+' : ''}${formatCurrency(comparison.difference)} (${comparison.percentageChange.toFixed(1)}% ${comparison.trend})\n`;
    }
    
    if (prediction.predictedMonthly > (comparison?.previous || 0) * 1.1) {
      response += `\n⚠️ **Alert:** You're on track to spend ${((prediction.predictedMonthly / (comparison?.previous || prediction.predictedMonthly)) * 100 - 100).toFixed(1)}% more than last month.`;
    }
    
    return response;
  }
  
  if (lowerQuery.includes('daily') || (lowerQuery.includes('average') && lowerQuery.includes('spend'))) {
    const prediction = getMonthlyPrediction(spendingData);
    
    if (!prediction) {
      return "I need more spending data to calculate daily averages.";
    }
    
    return `Your daily spending average is ${formatCurrency(prediction.dailyAverage)}.
So far this month (${prediction.daysSoFar} days), you've spent ${formatCurrency(prediction.spentSoFar)}.
At this rate, you'll spend about ${formatCurrency(prediction.predictedMonthly)} by month end.`;
  }
  
  return null;
};