import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: payload[0].payload.fill }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].name}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm">
            Count: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Percentage: <span className="font-bold">{((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if less than 5%

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function AppCategoriesChart({ rawData }) {
  const [timePeriod, setTimePeriod] = useState('month');

  const chartData = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }

    const timestamps = rawData
      .map(log => new Date(log.timestamp))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => b - a);

    if (timestamps.length === 0) return [];

    const latestDate = timestamps[0];
    let startDate = null;

    if (timePeriod === 'day') {
      startDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
    } else if (timePeriod === 'week') {
      startDate = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'month') {
      startDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    }

    const categoryMap = {};
    let total = 0;

    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) continue;
      if (startDate && ts < startDate) continue;

      const category = log.app_category || 'Unknown';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
      total++;
    }

    const out = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key],
      total: total
    }));

    out.sort((a, b) => b.value - a.value);
    
    // Show top 8 categories, combine rest as "Others"
    if (out.length > 8) {
      const top8 = out.slice(0, 8);
      const othersValue = out.slice(8).reduce((sum, item) => sum + item.value, 0);
      if (othersValue > 0) {
        top8.push({ name: 'Others', value: othersValue, total: total });
      }
      return top8;
    }

    return out;
  }, [rawData, timePeriod]);

  const topCategory = chartData.length > 0 ? chartData[0] : null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Application Categories</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Distribusi kategori aplikasi</p>
          </div>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2">
          {[
            { key: 'day', label: 'Hari' },
            { key: 'week', label: 'Minggu' },
            { key: 'month', label: 'Bulan' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setTimePeriod(period.key)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md sm:rounded-lg transition-all ${
                timePeriod === period.key
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ backgroundColor: timePeriod === period.key ? '#3B82F6' : undefined }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span className="text-xs sm:text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {topCategory && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }}>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}></div>
          <div className="relative">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3B82F6' }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#1E40AF' }}>
                  Top Category
                  <span className="px-1.5 sm:px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">#1</span>
                </p>
                <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#1E3A8A' }}>
                  <span className="font-bold text-base sm:text-xl" style={{ color: '#3B82F6' }}>{topCategory.name}</span> dengan <span className="font-bold">{topCategory.value.toLocaleString()}</span> aktivitas ({((topCategory.value / topCategory.total) * 100).toFixed(1)}% dari total)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppCategoriesChart;
