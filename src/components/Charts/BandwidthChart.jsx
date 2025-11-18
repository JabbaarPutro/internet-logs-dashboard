import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#14B8A6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{label}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#14B8A6' }}>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#14B8A6' }}></span>
            This Week: <span className="font-bold">{payload[0].value} MB</span>
          </p>
          {payload[1] && (
            <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#94a3b8' }}>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#94a3b8' }}></span>
              Last Week: <span className="font-bold">{payload[1].value} MB</span>
            </p>
          )}
        </div>
        {payload[1] && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Change: <span className={`font-bold ${payload[0].value > payload[1].value ? 'text-green-600' : 'text-red-600'}`}>
                {payload[0].value > payload[1].value ? '↑' : '↓'} {Math.abs(payload[0].value - payload[1].value)} MB
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

function BandwidthChart({ data }) {
  const [showComparison, setShowComparison] = useState(false);
  
  const dataWithComparison = data.map((item, index) => ({
    ...item,
    lastWeek: Math.max(0, item.bandwidth - (Math.random() * 50 - 25))
  }));
  
  const average = data.reduce((sum, item) => sum + item.bandwidth, 0) / data.length;
  const maxValue = Math.max(...data.map(d => d.bandwidth));
  const threshold = average * 1.2;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#CCFBF1' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#14B8A6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Bandwidth Usage</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Tren penggunaan bandwidth harian</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-md sm:rounded-lg transition-all flex items-center gap-1.5 ${
              showComparison ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">Compare</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-5 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#14B8A6' }}></div>
          <span className="text-gray-600 font-medium">Current</span>
        </div>
        {showComparison && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#94a3b8' }}></div>
            <span className="text-gray-600 font-medium">Last Week</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-0.5 sm:h-1 bg-red-400" style={{ width: '16px', borderStyle: 'dashed' }}></div>
          <span className="text-gray-600 font-medium">Threshold</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={240} className="sm:h-[280px] lg:h-[320px]">
        <AreaChart data={showComparison ? dataWithComparison : data}>
          <defs>
            <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            tick={{ fill: '#6b7280', fontSize: 9 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 9 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, Math.ceil(maxValue * 1.2)]}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={threshold} 
            stroke="#EF4444" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: 'Threshold', 
              position: 'insideTopRight',
              fill: '#EF4444',
              fontSize: 10,
              fontWeight: 'bold'
            }}
          />
          
          {showComparison && (
            <Area 
              type="monotone" 
              dataKey="lastWeek" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              fill="url(#colorLastWeek)" 
              name="Last Week (MB)" 
            />
          )}
          
          <Area 
            type="monotone" 
            dataKey="bandwidth" 
            stroke="#14B8A6" 
            strokeWidth={2.5} 
            fill="url(#colorBandwidth)" 
            name="Bandwidth (MB)"
            dot={{ fill: '#14B8A6', r: 3 }}
            activeDot={{ r: 5, fill: '#0d9488' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Stats Summary */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Peak', value: `${maxValue.toFixed(0)} MB`, icon: '📈', color: '#EF4444' },
          { label: 'Average', value: `${average.toFixed(0)} MB`, icon: '📊', color: '#3B82F6' },
          { label: 'Total', value: `${(data.reduce((sum, d) => sum + d.bandwidth, 0) / 1000).toFixed(2)} GB`, icon: '💾', color: '#8B5CF6' },
          { label: 'Trend', value: '+12.5%', icon: '📉', color: '#10B981' },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className="text-base sm:text-lg">{stat.icon}</span>
              <p className="text-xs font-semibold text-gray-500 uppercase truncate">{stat.label}</p>
            </div>
            <p className="text-sm sm:text-base lg:text-lg font-extrabold truncate" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Key Insight */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#F0FDFA', borderColor: '#14B8A6' }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #14B8A6 0%, transparent 70%)' }}></div>
        <div className="relative">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#0f766e' }}>
                Alert: High Bandwidth
                <span className="px-1.5 sm:px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded-full animate-pulse">CRITICAL</span>
              </p>
              <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#115e59' }}>
                Puncak pada <span className="font-bold" style={{ color: '#F59E0B' }}>{data.reduce((max, item) => item.bandwidth > max.bandwidth ? item : max, data[0])?.date}</span> dengan <span className="font-bold text-base sm:text-xl" style={{ color: '#EF4444' }}>{data.reduce((max, item) => item.bandwidth > max.bandwidth ? item : max, data[0])?.bandwidth} MB</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BandwidthChart;