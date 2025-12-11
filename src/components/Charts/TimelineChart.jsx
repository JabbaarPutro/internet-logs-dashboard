import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#14B8A6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].payload.time}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#14B8A6' }}>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#14B8A6' }}></span>
            Activities: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

function TimelineChart({ rawData }) {
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

    const hourlyMap = {};

    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) continue;
      if (startDate && ts < startDate) continue;

      let timeKey;
      if (timePeriod === 'day') {
        // Group by hour for day view
        timeKey = `${String(ts.getHours()).padStart(2, '0')}:00`;
      } else if (timePeriod === 'week') {
        // Group by day for week view
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        timeKey = dayNames[ts.getDay()];
      } else {
        // Group by day of month for month view
        timeKey = `${ts.getDate()}`;
      }

      hourlyMap[timeKey] = (hourlyMap[timeKey] || 0) + 1;
    }

    let sortedKeys;
    if (timePeriod === 'day') {
      // Sort by hour
      sortedKeys = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    } else if (timePeriod === 'week') {
      // Sort by day of week
      sortedKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      // Sort by day of month
      sortedKeys = Object.keys(hourlyMap).sort((a, b) => parseInt(a) - parseInt(b));
    }

    const out = sortedKeys.map(key => ({
      time: key,
      count: hourlyMap[key] || 0
    }));

    // Filter out entries with 0 count for cleaner visualization
    return out.filter(item => item.count > 0 || timePeriod === 'day');
  }, [rawData, timePeriod]);

  const maxActivity = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 0;
  const peakTime = chartData.find(d => d.count === maxActivity);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#14B8A6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Activity Timeline</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Pola aktivitas dari waktu ke waktu</p>
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
              style={{ backgroundColor: timePeriod === period.key ? '#14B8A6' : undefined }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            angle={timePeriod === 'month' ? -45 : 0}
            textAnchor={timePeriod === 'month' ? 'end' : 'middle'}
            height={timePeriod === 'month' ? 60 : 30}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#14B8A6" 
            strokeWidth={2}
            fill="url(#colorActivity)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      {peakTime && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#F0FDFA', borderColor: '#14B8A6' }}>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #14B8A6 0%, transparent 70%)' }}></div>
          <div className="relative">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#0f766e' }}>
                  Peak Activity Time
                  <span className="px-1.5 sm:px-2 py-0.5 bg-teal-200 text-teal-800 text-xs font-bold rounded-full">PEAK</span>
                </p>
                <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#115e59' }}>
                  Waktu puncak aktivitas pada <span className="font-bold" style={{ color: '#F59E0B' }}>{peakTime.time}</span> dengan <span className="font-bold text-base sm:text-xl" style={{ color: '#14B8A6' }}>{peakTime.count.toLocaleString()}</span> aktivitas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineChart;
