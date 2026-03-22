import React from 'react';

const SpendingAnalytics = ({ spendingData }) => {
  return (
    <section className="mb-10 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Spending Analytics</h2>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                ${spendingData.summary.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <p className="text-xs text-blue-500 mt-2">
            {spendingData.summary.transactionCount} transactions
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Avg Transaction</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                ${spendingData.summary.averageTransaction.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <p className="text-xs text-green-500 mt-2">Average spend per transaction</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Largest Transaction</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">
                ${spendingData.summary.largestTransaction.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
          <p className="text-xs text-purple-500 mt-2">Biggest single expense</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Top Category</p>
              <p className="text-lg font-bold text-orange-800 mt-1">
                {spendingData.topCategories[0]?.name || "N/A"}
              </p>
            </div>
            <div className="text-3xl">{spendingData.topCategories[0]?.icon || "📦"}</div>
          </div>
          <p className="text-xs text-orange-500 mt-2">
            {spendingData.topCategories[0] ? `$${spendingData.topCategories[0].amount.toFixed(2)} spent` : "No data"}
          </p>
        </div>
      </div>

      {/* Charts and Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</h3>
          {spendingData.categories.length > 0 ? (
            <>
              {/* Pie Chart Visualization */}
              <div className="mb-6 flex justify-center">
                <div className="relative w-48 h-48">
                  {spendingData.categories.slice(0, 5).map((category, index, array) => {
                    const totalAngle = 360;
                    const percentage = category.percentage;
                    const rotation = array
                      .slice(0, index)
                      .reduce((sum, cat) => sum + cat.percentage, 0);
                    
                    return (
                      <div
                        key={category.id}
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{
                          clipPath: `conic-gradient(${category.color} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                          transform: `rotate(${rotation * 3.6}deg)`,
                        }}
                      />
                    );
                  })}
                  <div className="absolute inset-1/4 bg-white rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">${spendingData.summary.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                {spendingData.categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                        <span className="text-sm">{category.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${category.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No spending data available for analysis
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Spending Trend</h3>
          {spendingData.monthlyTrend.length > 0 ? (
            <>
              {/* Bar Chart */}
              <div className="mb-6">
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {spendingData.monthlyTrend.map((month) => {
                    const maxAmount = Math.max(...spendingData.monthlyTrend.map(m => m.amount));
                    const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={month.month} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-500 hover:opacity-90"
                          style={{ height: `${height}%` }}
                          title={`$${month.amount.toFixed(2)}`}
                        ></div>
                        <p className="text-xs text-gray-600 mt-2 truncate">{month.displayMonth}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Categories List */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {spendingData.topCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${category.color}`}
                            style={{ width: `${Math.min(category.percentage * 2, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">${category.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No monthly trend data available
            </div>
          )}
        </div>
      </div>

      {/* All Categories Table */}
      {spendingData.categories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">All Spending Categories</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendingData.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                          <span className="text-sm">{category.icon}</span>
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">${category.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{category.count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{category.percentage.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${Math.min(category.percentage * 2, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default SpendingAnalytics;