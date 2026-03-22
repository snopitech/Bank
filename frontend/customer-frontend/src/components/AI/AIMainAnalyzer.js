// components/AI/AIMainAnalyzer.js
import axios from 'axios';  // NEW: Added for Ollama
import { analyzePredictions } from './AIPredictions';
import { analyzeSpendingInsights } from './AIInsights';
import { analyzeTransactions } from './AITransactions';
import { analyzeBudget } from './AIBudget';
import { formatCurrency, getCurrentMonth, getTopCategory } from './AICore';

// ========== OLLAMA AI FUNCTION ==========
const callOllamaAI = async (prompt) => {
  try {
    console.log('🔍 Trying Ollama AI...');
    
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma:2b',
      prompt: prompt,
      stream: false,
      options: { 
        temperature: 0.3,
        top_p: 0.9,
        num_predict: 200
      }
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.response) {
      const aiResponse = response.data.response.trim();
      console.log('✅ Ollama response received');
      return aiResponse;
    }
    
    console.log('⚠️ Ollama returned empty response');
    return null;
    
  } catch (error) {
    console.log('❌ Ollama error:', error.message);
    return null;
  }
};

// ========== FINANCIAL REDIRECT SYSTEM ==========
const financialRedirects = {
  // Politics/Government
  'president': "I'm your Financial Assistant, not a political expert! 😊 Let's focus on your finances instead. Need help with budgeting or savings?",
  'government': "I specialize in personal finance, not government affairs. Want to discuss your financial goals instead?",
  'election': "Elections are important, but let's talk about something I excel at - your money! How's your budget looking?",
  'politics': "I analyze spending patterns, not political patterns! Let me help with your financial strategy instead.",
  
  // Weather
  'weather': "I'm better at forecasting your financial future than the weather! ☀️ Want me to analyze your spending trends?",
  'rain': "Let's talk about raining savings instead! How's your emergency fund looking?",
  'temperature': "I track financial temperatures better than weather temperatures! How's your financial health?",
  
  // Sports/Entertainment
  'sports': "I'm better at tracking expenses than scores! 🏈 Want to review your entertainment spending?",
  'football': "Let's tackle your finances instead! Need help with budgeting?",
  'movie': "My expertise is in finance, not films! 🎬 Check your subscription expenses instead?",
  'music': "I analyze spending patterns, not music patterns! 🎵 How about reviewing your subscription services?",
  'game': "Let's play the savings game instead! Want to set up a savings goal?",
  
  // General Knowledge
  'who is': "I'm a Financial Assistant specializing in money matters. Ask me about managing your finances instead!",
  'what is': "I focus on 'what is' happening with your money. Need help understanding your spending?",
  'when did': "I track when you spend, not historical events! Want to see your spending timeline?",
  'history': "Let's focus on your financial history instead. Want to see your spending patterns over time?",
  
  // Science/Tech
  'science': "My science is financial analysis! 🔬 Want me to analyze your spending data?",
  'technology': "I use AI for financial insights! Need help with your digital banking or budgeting apps?",
  'space': "Let's focus on financial space instead! Need help creating budget headroom?",
  
  // Random/Other
  'hello world': "Hello! I'm your Financial Assistant. I can help with budgeting, savings, and spending analysis!",
  'how are you': "I'm doing great, ready to help with your finances! What would you like to know about your money?",
  'joke': "Why did the dollar go to therapy? It had too many issues! 😄 Now, let's talk about your financial health!",
  'food': "I analyze dining expenses, not recipes! 🍽️ Want to see how much you're spending on food?",
  'travel': "Let's plan your financial journey instead! ✈️ Need help budgeting for your next trip?",
};

// Check if question is complex enough for Ollama
const isComplexQuestion = (query) => {
  const complexKeywords = [
    'why', 'should', 'advice', 'recommend', 'suggest', 
    'how to', 'what if', 'better', 'improve', 'optimize',
    'analysis', 'analyze', 'insight', 'opinion', 'think',
    'advise', 'recommendation', 'suggestion', 'strategy',
    'plan', 'goal', 'save more', 'invest', 'future'
  ];
  
  const isComplex = complexKeywords.some(keyword => query.includes(keyword));
  console.log(`📊 Question complexity: "${query}" -> ${isComplex ? 'Complex' : 'Simple'}`);
  return isComplex;
};

// Safe helper function to format numbers
const safeToFixed = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

// Safe get top category
const safeGetTopCategory = (spendingData) => {
  const category = getTopCategory(spendingData);
  return {
    name: category?.name || 'No data',
    value: category?.value || 0,
    percentage: category?.percentage || 0,
    count: category?.count || 0
  };
};

// Main analysis function with COMPLETE error handling
export const analyzeFinancialData = async (transactions, spendingData, userQuery) => {
  try {
    const query = userQuery.toLowerCase().trim();
    console.log(`📝 Processing: "${userQuery}"`);
    
    // ========== FIRST: CHECK FOR NON-FINANCIAL QUESTIONS ==========
    // Redirect non-financial questions with friendly responses
    for (const [topic, redirectResponse] of Object.entries(financialRedirects)) {
      if (query.includes(topic)) {
        console.log(`🔄 Redirecting non-financial question about "${topic}"`);
        return redirectResponse;
      }
    }
    
    // Get safe data values
    const totalSpent = spendingData?.summary?.totalSpent || 0;
    const topCategory = safeGetTopCategory(spendingData);
    const avgTransaction = spendingData?.summary?.averageTransaction || 0;
    const transactionCount = spendingData?.summary?.transactionCount || transactions?.length || 0;
    
    // ========== SECOND: CHECK FOR COMPLEX QUESTIONS (OLLAMA AI) ==========
    if (isComplexQuestion(query)) {
      console.log('🤔 Complex question detected, trying Ollama...');
      
      const financialContext = `You are a financial expert. Answer this question: ${userQuery}

User's financial data:
- Monthly spending: $${safeToFixed(totalSpent)}
- Top category: ${topCategory.name} ($${safeToFixed(topCategory.value)})
- Average transaction: $${safeToFixed(avgTransaction)}
- Number of transactions: ${transactionCount}

Give helpful, actionable advice:`;

      // Try Ollama AI with timeout
      const aiResponse = await Promise.race([
        callOllamaAI(financialContext),
        new Promise(resolve => setTimeout(() => {
          console.log('⏰ Ollama timeout after 6 seconds');
          resolve(null);
        }, 6000))
      ]);
      
      if (aiResponse && aiResponse.length > 10) {
        console.log('🎯 Using Ollama response');
        return aiResponse;
      }
      console.log('↩️ Falling back to existing system...');
    }
    
    // ========== THIRD: EXACT MATCHES ==========
    
    // Exact greetings
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
    
    // Exact help
    if (query === 'help') {
      return `I can help you with:
• Analyzing your spending habits
• Tracking expenses by category
• Identifying top spending areas
• Viewing recent transactions
• Providing budget suggestions
• Making spending predictions
• Finding savings opportunities
• Checking financial health
• Analyzing transaction patterns

Try asking me things like:
"How much did I spend this month?"
"Predict my monthly spending"
"What's my biggest expense?"
"Show me my recent transactions"
"Give me budget tips"
"Daily spending average"
"How's my financial health?"
"What are my spending patterns?"`;
    }
    
    // ========== FOURTH: MODULE-BASED ANALYSIS ==========
    
    // Try each module in order
    let response;
    
    // 1. Spending amount questions
    if (query.includes('how much') && (query.includes('spend') || query.includes('spent'))) {
      response = `In ${getCurrentMonth()}, you've spent ${formatCurrency(totalSpent)} in total.\n`;
      response += `Your biggest spending category is ${topCategory.name} at ${formatCurrency(topCategory.value)}.\n`;
      response += `This represents ${safeToFixed(topCategory.percentage, 1)}% of your total spending.`;
      
      return response;
    }
    
    // 2. Top expense questions
    if ((query.includes('top') && query.includes('spend')) || 
        query.includes('biggest expense') ||
        query.includes('largest expense')) {
      
      if (topCategory.name === 'No data') {
        return "I don't have enough spending data to analyze yet.";
      }
      
      return `Your top spending category is ${topCategory.name} at ${formatCurrency(topCategory.value)}.
This accounts for ${safeToFixed(topCategory.percentage, 1)}% of your total spending.
You've made ${topCategory.count || 0} transactions in this category.`;
    }
    
    // 3. Check predictions module
    try {
      response = analyzePredictions(query, spendingData);
      if (response) return response;
    } catch (e) {
      console.log('Predictions module error:', e);
    }
    
    // 4. Check transactions module
    try {
      response = analyzeTransactions(query, transactions, spendingData);
      if (response) return response;
    } catch (e) {
      console.log('Transactions module error:', e);
    }
    
    // 5. Check budget module
    try {
      response = analyzeBudget(query, spendingData);
      if (response) return response;
    } catch (e) {
      console.log('Budget module error:', e);
    }
    
    // 6. Check insights module
    try {
      response = analyzeSpendingInsights(query, spendingData);
      if (response) return response;
    } catch (e) {
      console.log('Insights module error:', e);
    }
    
    // 7. Category-specific questions
    if (query.includes('category')) {
      const categoryMatch = query.match(/(food|dining|shopping|bill|utility|entertainment|transport)/i);
      if (categoryMatch) {
        const category = categoryMatch[0].toLowerCase();
        const categories = spendingData?.categories || [];
        const found = categories.find(cat => cat?.name?.toLowerCase().includes(category));
        
        if (found && found.amount !== undefined) {
          return `You've spent ${formatCurrency(found.amount)} on ${found.name || category} this month.`;
        }
      }
    }
    
    // 8. Summary questions
    if (query.includes('summary') || query.includes('overview') || query.includes('financial summary')) {
      const largestTransaction = spendingData?.summary?.largestTransaction || 0;
      
      response = `Here's your financial summary for ${getCurrentMonth()}:\n`;
      response += `• Total Spent: ${formatCurrency(totalSpent)}\n`;
      response += `• Number of Transactions: ${transactionCount}\n`;
      response += `• Average Transaction: ${formatCurrency(avgTransaction)}\n`;
      response += `• Top Category: ${topCategory.name} (${formatCurrency(topCategory.value)})\n`;
      response += `• Largest Single Expense: ${formatCurrency(largestTransaction)}`;
      
      return response;
    }
    
    // 9. Default response
    return `I'm not sure I understand. Try asking me about:
• Your spending habits
• Recent transactions
• Budget suggestions
• Spending predictions
• Savings opportunities
• Financial health
• Transaction patterns

Or type "help" to see what I can do!`;
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR in analyzeFinancialData:', error);
    return `I'm having trouble processing your request. Please try asking about:
• Your monthly spending
• Top expense categories
• Recent transactions
• Budget suggestions`;
  }
};

// Quick questions for the UI
export const getQuickQuestions = () => {
  return [
    "How much did I spend this month?",
    "Predict my monthly spending",
    "What's my biggest expense?",
    "Show recent transactions",
    "Give me budget tips",
    "Daily spending average",
    "How's my financial health?",
    // NEW: Complex questions for Ollama
    "How can I save more money?",
    "What should I improve in my budget?",
    "Analyze my spending patterns",
    "Give me investment advice",
    "How to optimize my expenses?"
  ];
};