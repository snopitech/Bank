import React, { useState } from 'react';

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
  handlePageChange
}) => {
  // Calculate pagination values
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Transaction History
      </h2>

      {/* Account Switcher */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedAccount("CHECKING")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedAccount === "CHECKING"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Everyday Checking
        </button>

        <button
          onClick={() => setSelectedAccount("SAVINGS")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedAccount === "SAVINGS"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Everyday Savings
        </button>
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
            {filteredTransactions.length > 0 && (
              <span className="ml-2">
                • Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
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
            Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
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
              {currentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => {
                    // Keep any existing click handler logic here
                  }}
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
                        ? "text-gray-800" // Changed from red-600 to gray-800
                        : "text-green-600"
                    }`}
                  >
                    {tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" || tx.type === "BILL_PAYMENT"
                      ? `-$${tx.amount.toFixed(2)}`
                      : `$${tx.amount.toFixed(2)}`}
                  </td>

                  <td className="py-3 px-4 text-right">
                    ${tx.balanceAfter.toFixed(2)}
                  </td>
                </tr>
              ))}

              {currentTransactions.length === 0 && (
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
                          className="text-gray-800 hover:text-gray-900 font-semibold underline" // Changed from red-700 to gray-800
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
        {filteredTransactions.length > transactionsPerPage && (
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
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
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
                  Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastTransaction, filteredTransactions.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredTransactions.length}</span> results
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600" // Changed from red-50/red-500/red-600 to blue
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
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