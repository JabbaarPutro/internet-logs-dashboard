import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#3B82F6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].payload.username}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm">
            Total Activities: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            IP: <span className="font-mono">{payload[0].payload.ip}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Group: <span className="font-semibold">{payload[0].payload.group}</span>
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
  
  if (isMobile && value < 50) return null;
  
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

function TopUsersChart({ data, rawData }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month');

  const handleBarClick = (data) => {
    setSelectedUser(data.username);
  };

  const localData = useMemo(() => {
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

    const userMap = {};
    for (const log of rawData) {
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) continue;
      if (startDate && ts < startDate) continue;

      const username = log.username || log.source_ip || 'Unknown';
      const ip = log.source_ip || 'N/A';
      const group = log.group_name || '/';

      if (!userMap[username]) {
        userMap[username] = {
          username: username,
          ip: ip,
          group: group,
          count: 0
        };
      }
      userMap[username].count++;
      // Update IP to the latest one
      userMap[username].ip = ip;
    }

    const out = Object.values(userMap);
    out.sort((a, b) => b.count - a.count);
    return out.slice(0, 15); // Top 15 users
  }, [rawData, timePeriod]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Top Active Users</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Users dengan aktivitas terbanyak</p>
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

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={localData} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis 
            type="category" 
            dataKey="username" 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            width={95}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
          <Bar 
            dataKey="count" 
            fill="#3B82F6" 
            radius={[0, 6, 6, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <LabelList content={renderCustomLabel} position="right" />
            {localData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={selectedUser === entry.username ? '#1D4ED8' : '#3B82F6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopUsersChart;
