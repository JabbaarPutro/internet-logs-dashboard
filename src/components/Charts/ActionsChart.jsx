import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: payload[0].fill }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].payload.action}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm">
            Count: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (props) => {
  const { x, y, width, value } = props;
  const isMobile = window.innerWidth < 640;
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill="#374151" 
      textAnchor="middle" 
      fontSize={isMobile ? "10" : "12"}
      fontWeight="600"
    >
      {value.toLocaleString()}
    </text>
  );
};

function ActionsChart({ rawData }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month');

  const handleBarClick = (data) => {
    setSelectedAction(data.action);
  };

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

    const actionMap = {};
    let total = 0;

    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) continue;
      if (startDate && ts < startDate) continue;

      const action = log.action || 'Unknown';
      actionMap[action] = (actionMap[action] || 0) + 1;
      total++;
    }

    const out = Object.keys(actionMap).map(key => ({
      action: key,
      count: actionMap[key],
      percentage: ((actionMap[key] / total) * 100).toFixed(1)
    }));

    out.sort((a, b) => b.count - a.count);
    return out;
  }, [rawData, timePeriod]);

  const getBarColor = (action) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('reject') || lowerAction.includes('block') || lowerAction.includes('deny')) {
      return '#EF4444'; // Red
    } else if (lowerAction.includes('allow') || lowerAction.includes('accept')) {
      return '#10B981'; // Green
    } else if (lowerAction.includes('log')) {
      return '#3B82F6'; // Blue
    } else {
      return '#F59E0B'; // Orange
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEE2E2' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Actions Distribution</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Distribusi tindakan (Log/Reject/Allow)</p>
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
              style={{ backgroundColor: timePeriod === period.key ? '#EF4444' : undefined }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-5 text-xs sm:text-sm flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
          <span className="text-gray-600 font-medium">Log</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <span className="text-gray-600 font-medium">Reject/Block</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-gray-600 font-medium">Allow</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span className="text-gray-600 font-medium">Other</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280} className="sm:h-[320px]">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="action" 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
          <Bar 
            dataKey="count" 
            radius={[6, 6, 0, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <LabelList content={renderCustomLabel} />
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getBarColor(entry.action)}
                opacity={selectedAction === entry.action ? 0.7 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {chartData.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444' }}>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)' }}></div>
          <div className="relative">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EF4444' }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#991B1B' }}>
                  Most Common Action
                </p>
                <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#7F1D1D' }}>
                  <span className="font-bold text-base sm:text-xl" style={{ color: '#EF4444' }}>{chartData[0].action}</span> dengan <span className="font-bold">{chartData[0].count.toLocaleString()}</span> aktivitas ({chartData[0].percentage}% dari total)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionsChart;
