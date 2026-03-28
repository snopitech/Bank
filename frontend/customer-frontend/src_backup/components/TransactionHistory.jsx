/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const API_BASE = "http://localhost:8080";

const TransactionHistory = ({
  transactions,
  selectedAccount,
  setSelectedAccount,
  filterType,
  setFilterType,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  filterMinAmount,
  setFilterMinAmount,
  filterMaxAmount,
  setFilterMaxAmount,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  transactionsPerPage,
  renderType,
  clearAllFilters,
  filteredTransactions,
  currentTransactions,
  totalPages,
  handlePageChange,
  checkingAccount,
  savingsAccount,
   loanAccounts = [],  
  businessAccounts = [],
  creditAccounts = []
}) => {
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  // Fetch transactions when selected account changes
  useEffect(() => {
    fetchAccountTransactions();
    console.log('Loan accounts in TransactionHistory:', loanAccounts)
  }, [selectedAccount]);

const fetchAccountTransactions = async () => {
  setLoading(true);
  try {
    let response;
    
    // Handle different account types
    if (selectedAccount === "CHECKING" && checkingAccount) {
      response = await fetch(`${API_BASE}/api/accounts/${checkingAccount.id}/transactions`);
      if (response && response.ok) {
        const data = await response.json();
        setAccountTransactions(data);
      } else {
        setAccountTransactions([]);
      }
    } 
    else if (selectedAccount === "SAVINGS" && savingsAccount) {
      response = await fetch(`${API_BASE}/api/accounts/${savingsAccount.id}/transactions`);
      if (response && response.ok) {
        const data = await response.json();
        setAccountTransactions(data);
      } else {
        setAccountTransactions([]);
      }
    }
    else if (selectedAccount.startsWith("BUSINESS_")) {
      const businessId = selectedAccount.replace("BUSINESS_", "");
      const business = businessAccounts.find(b => b.id.toString() === businessId);
      if (business && business.accountId) {
        response = await fetch(`${API_BASE}/api/accounts/${business.accountId}/transactions`);
        if (response && response.ok) {
          const data = await response.json();
          setAccountTransactions(data);
        } else {
          setAccountTransactions([]);
        }
      }
    }
    else if (selectedAccount.startsWith("CREDIT_")) {
      const creditId = selectedAccount.replace("CREDIT_", "");
      response = await fetch(`${API_BASE}/api/credit/accounts/${creditId}/transactions?userId=${user.id}`);
      if (response && response.ok) {
        const data = await response.json();
        setAccountTransactions(data);
      } else {
        setAccountTransactions([]);
      }
    }
    else if (selectedAccount.startsWith("LOAN_")) {
      const loanId = selectedAccount.replace("LOAN_", "");
      console.log('Fetching loan transactions for ID:', loanId);
      response = await fetch(`${API_BASE}/api/loan/accounts/${loanId}/payments`, {
        headers: { 'sessionId': user?.sessionId }
      });
      console.log('Loan response status:', response.status);
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('Raw loan transaction data:', data);
        
        const transformedData = data.map((payment, index) => ({
          id: payment.id || `loan-${loanId}-${index}`,
          timestamp: payment.date || payment.paymentDate || payment.timestamp || new Date().toISOString(),
          type: 'PAYMENT',
          description: payment.description || 'Loan Payment',
          amount: payment.amount || 0,
          balanceAfter: payment.balanceAfter || payment.remainingBalance || 0
        }));
        
        console.log('Transformed data:', transformedData);
        setAccountTransactions(transformedData);
      } else {
        setAccountTransactions([]);
      }
    }
    
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    setAccountTransactions([]);
  } finally {
    setLoading(false);
  }
};


  // Use either the passed transactions or account-specific transactions
  const displayTransactions = accountTransactions.length > 0 ? accountTransactions : transactions;

  // Apply filters to account transactions
  const getFilteredAccountTransactions = () => {
    return displayTransactions.filter(tx => {
      if (filterType !== "ALL" && tx.type !== filterType) return false;

      if (filterStartDate) {
        const txDate = new Date(tx.timestamp);
        const start = new Date(filterStartDate);
        if (txDate < start) return false;
      }

      if (filterEndDate) {
        const txDate = new Date(tx.timestamp);
        const end = new Date(filterEndDate);
        if (txDate > end) return false;
      }

      if (filterMinAmount && tx.amount < parseFloat(filterMinAmount)) return false;
      if (filterMaxAmount && tx.amount > parseFloat(filterMaxAmount)) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const descriptionMatch = tx.description?.toLowerCase().includes(query);
        const amountMatch = tx.amount.toString().includes(query);
        const typeMatch = tx.type?.toLowerCase().includes(query);
        const dateMatch = new Date(tx.timestamp)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query);
        
        return descriptionMatch || amountMatch || typeMatch || dateMatch;
      }

      return true;
    });
  }

  const filteredAccountTransactions = getFilteredAccountTransactions();
  
  // Pagination for account transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentAccountTransactions = filteredAccountTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const accountTotalPages = Math.ceil(filteredAccountTransactions.length / transactionsPerPage);

  // Calculate pagination values
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  
  // Use either the passed transactions or our fetched ones
  const currentDisplayTransactions = accountTransactions.length > 0 
    ? currentAccountTransactions 
    : currentTransactions;
  
  const displayTotalPages = accountTransactions.length > 0 
    ? accountTotalPages 
    : totalPages;

  // Helper function to get account display name
const getAccountDisplayName = (accountType) => {
  if (accountType === "CHECKING") return "Everyday Checking";
  if (accountType === "SAVINGS") return "Everyday Savings";
  if (accountType.startsWith("BUSINESS_")) {
    const businessId = accountType.replace("BUSINESS_", "");
    const business = businessAccounts.find(b => b.id.toString() === businessId);
    return business?.businessName || "Business Account";
  }
  if (accountType.startsWith("CREDIT_")) {
    const creditId = accountType.replace("CREDIT_", "");
    const credit = creditAccounts.find(c => c.id.toString() === creditId);
    return "Credit Card" + (credit?.maskedAccountNumber ? ` (${credit.maskedAccountNumber.slice(-4)})` : "");
  }
  // ADD THIS SECTION
  if (accountType.startsWith("LOAN_")) {
    const loanId = accountType.replace("LOAN_", "");
    const loan = loanAccounts.find(l => l.id.toString() === loanId);
    return "Loan Account" + (loan?.maskedAccountNumber ? ` (${loan.maskedAccountNumber.slice(-4)})` : "");
  }
  return accountType;
};

  // Build list of available accounts
const availableAccounts = [
  ...(checkingAccount ? [{ type: "CHECKING", label: "Everyday Checking" }] : []),
  ...(savingsAccount ? [{ type: "SAVINGS", label: "Everyday Savings" }] : []),
  ...businessAccounts.map((biz) => ({
    type: `BUSINESS_${biz.id}`,
    label: biz.businessName || "Business Account"
  })),
  ...creditAccounts.map((credit) => ({
    type: `CREDIT_${credit.id}`,
    label: "Credit Card",
    maskedNumber: credit.maskedAccountNumber
  })),
  // ADD THIS SECTION
  ...(loanAccounts || []).map((loan) => ({
    type: `LOAN_${loan.id}`,
    label: "Loan Account",
    maskedNumber: loan.maskedAccountNumber
  }))
];

  if (loading) {
    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Transaction History
      </h2>

      {/* Account Switcher - Dynamically render all available accounts */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableAccounts.map((account) => {
          // Determine color based on account type
          let bgColor = "bg-gray-200";
          let activeBgColor = "bg-gray-800";
          
          if (account.type.startsWith("BUSINESS_")) {
            bgColor = "bg-purple-200";
            activeBgColor = "bg-purple-700";
          } else if (account.type.startsWith("CREDIT_")) {
            bgColor = "bg-blue-200";
            activeBgColor = "bg-blue-700";
          } 
          else if (account.type.startsWith("LOAN_")) {
            bgColor = "bg-green-200";
            activeBgColor = "bg-green-700";
   }

          return (
            <button
              key={account.type}
              onClick={() => setSelectedAccount(account.type)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedAccount === account.type
                  ? `${activeBgColor} text-white`
                  : `${bgColor} text-gray-700 hover:bg-opacity-80`
              }`}
              title={account.maskedNumber ? `Account: ${account.maskedNumber}` : ""}
            >
              {account.label}
            {account.type.startsWith("LOAN_") && (
            <span className="ml-2 text-xs opacity-75">
             {account.maskedNumber ? account.maskedNumber.slice(-4) : "••••"}
            </span>
            )}
            </button>
          );
        })}

        {availableAccounts.length === 0 && (
          <p className="text-gray-500">No accounts available</p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            id="search-transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by description, amount, date, or type..."
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Searching for: "<span className="font-semibold">{searchQuery}</span>"
            {filteredAccountTransactions.length > 0 && (
              <span className="ml-2">
                • Found {filteredAccountTransactions.length} transaction{filteredAccountTransactions.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER">Transfer Out</option>
              <option value="TRANSFER_IN">Transfer In</option>
              <option value="BILL_PAYMENT">Bill Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={clearAllFilters}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition flex items-center"
          >
            <span className="mr-2">🗑️</span>
            Clear All Filters & Search
          </button>
          
          <div className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">📊</span>
            Showing {filteredAccountTransactions.length} transaction{filteredAccountTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transaction table with scrolling */}
      <div className="border rounded-lg overflow-hidden shadow">
        {/* Table container with fixed height and scrolling */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>

            <tbody>
              {(accountTransactions.length > 0 ? currentAccountTransactions : currentTransactions).map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b hover:bg-gray-50 transition-all duration-150 transform hover:scale-[1.01] cursor-pointer"
                >
                  <td className="py-3 px-4">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">{renderType(tx)}</td>

                  <td className="py-3 px-4">
                    {tx.description || "—"}
                  </td>

                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" || tx.type === "BILL_PAYMENT"
                        ? "text-gray-800"
                        : "text-green-600"
                    }`}
                  >
                    {tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" || tx.type === "BILL_PAYMENT"
                      ? `-$${tx.amount.toFixed(2)}`
                      : `$${tx.amount.toFixed(2)}`}
                  </td>

                  <td className="py-3 px-4 text-right">
                    ${tx.balanceAfter?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}

              {currentDisplayTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    {searchQuery || filterType !== "ALL" || filterStartDate || filterEndDate || filterMinAmount || filterMaxAmount ? (
                      <div>
                        <p className="mb-2">No transactions match your search criteria.</p>
                        <button
                          onClick={clearAllFilters}
                          className="text-gray-800 hover:text-gray-900 font-semibold underline"
                        >
                          Clear all filters and search
                        </button>
                      </div>
                    ) : (
                      "No transactions found."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {filteredAccountTransactions.length > transactionsPerPage && (
          <div className="bg-gray-50 border-t px-4 py-3 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === displayTotalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === displayTotalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLast, filteredAccountTransactions.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredAccountTransactions.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === displayTotalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === displayTotalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionHistory;