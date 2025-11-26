import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#14B8A6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].payload.department}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#10B981' }}>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></span>
            Productive: <span className="font-bold">{payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#F59E0B' }}>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span>
              Unproductive: <span className="font-bold">{payload[1].value}</span>
            </p>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Total: <span className="font-bold">{payload[0].payload.productive + payload[0].payload.unproductive}</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Rate: <span className="font-bold" style={{ color: '#14B8A6' }}>{payload[0].payload.productivityRate}%</span>
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
  
  if (isMobile && value < 10) return null; // Hide small values on mobile
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill="#374151" 
      textAnchor="middle" 
      fontSize={isMobile ? "10" : "12"}
      fontWeight="600"
    >
      {value}
    </text>
  );
};

function ProductivityChart({ data, rawData }) {
  const [selectedDept, setSelectedDept] = useState(null);
  const [timePeriod, setTimePeriod] = useState('week');

  const handleBarClick = (data) => {
    setSelectedDept(data.department);
    console.log('Department clicked:', data.department);
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const localData = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return data || [];
    }

    // Find the most recent date in the data to use as reference point
    let maxDate = null;
    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (!isNaN(ts.getTime())) {
        if (!maxDate || ts > maxDate) {
          maxDate = ts;
        }
      }
    }

    // If no valid dates found, return all data
    if (!maxDate) {
      return data || [];
    }

    let startDate = null;
    if (timePeriod === 'day') {
      startDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    } else if (timePeriod === 'week') {
      startDate = new Date(maxDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'month') {
      startDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    }

    const map = {};
    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) continue;
      if (startDate && ts < startDate) continue;

      const dept = log.department || 'Unknown';
      if (!map[dept]) map[dept] = { department: dept, productive: 0, unproductive: 0, total: 0 };
      map[dept].total++;
      if (String(log.is_productive).toLowerCase() === 'yes' || log.is_productive === true) {
        map[dept].productive++;
      } else {
        map[dept].unproductive++;
      }
    }

    const out = Object.keys(map).map(k => ({
      department: map[k].department,
      productive: map[k].productive,
      unproductive: map[k].unproductive,
      productivityRate: map[k].total > 0 ? ((map[k].productive / map[k].total) * 100).toFixed(1) : '0.0'
    }));

    out.sort((a, b) => parseFloat(b.productivityRate) - parseFloat(a.productivityRate));
    return out;
  }, [rawData, timePeriod, data]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Productivity by Department</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Perbandingan aktivitas produktif vs non-produktif</p>
          </div>
        </div>
        
        {/* Time Period Filter */}
        <div className="flex gap-1.5 sm:gap-2">
          {['day', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => handleTimePeriodChange(period)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md sm:rounded-lg transition-all ${
                timePeriod === period
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ backgroundColor: timePeriod === period ? '#14B8A6' : undefined }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-5 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-gray-600 font-medium">Productive</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span className="text-gray-600 font-medium">Unproductive</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280} className="sm:h-[320px] lg:h-[340px]">
        <BarChart data={localData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="department" 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }} />
          <Bar 
            dataKey="productive" 
            fill="#10B981" 
            radius={[6, 6, 0, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <LabelList content={renderCustomLabel} />
            {localData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={selectedDept === entry.department ? '#059669' : '#10B981'}
              />
            ))}
          </Bar>
          <Bar 
            dataKey="unproductive" 
            fill="#F59E0B" 
            radius={[6, 6, 0, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <LabelList content={renderCustomLabel} />
            {localData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={selectedDept === entry.department ? '#D97706' : '#F59E0B'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Key Insight */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#F0FDFA', borderColor: '#14B8A6' }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #14B8A6 0%, transparent 70%)' }}></div>
        <div className="relative">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#0f766e' }}>
                Key Insight
                <span className="px-1.5 sm:px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded-full">TOP</span>
              </p>
              <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#115e59' }}>
                Departemen <span className="font-bold" style={{ color: '#F59E0B' }}>{localData[0]?.department}</span> memiliki produktivitas tertinggi dengan rate <span className="font-bold text-base sm:text-xl" style={{ color: '#14B8A6' }}>{localData[0]?.productivityRate}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductivityChart;