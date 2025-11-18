import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const getTimeZone = (hour) => {
      const h = parseInt(hour);
      if (h >= 6 && h < 12) return { zone: 'Pagi', color: '#F59E0B', emoji: '🌅' };
      if (h >= 12 && h < 17) return { zone: 'Siang', color: '#EF4444', emoji: '☀️' };
      if (h >= 17 && h < 20) return { zone: 'Sore', color: '#EC4899', emoji: '🌆' };
      return { zone: 'Malam', color: '#6366F1', emoji: '🌙' };
    };
    
    const timeZone = getTimeZone(label);
    
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#F59E0B' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl sm:text-2xl">{timeZone.emoji}</span>
          <div>
            <p className="font-bold text-gray-800 text-sm sm:text-base">{label}</p>
            <p className="text-xs font-medium" style={{ color: timeZone.color }}>{timeZone.zone}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm" style={{ color: '#F59E0B' }}>
            Akses: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Duration: <span className="font-bold">{payload[0].payload.duration} min</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

function HourlyUsageChart({ data }) {
  const maxAccess = Math.max(...data.map(d => d.count));
  const threshold = maxAccess * 0.8;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Peak Usage Hours</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Jam-jam dengan aktivitas tertinggi</p>
          </div>
        </div>
      </div>

      {/* Time Zone Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-5 text-xs">
        {[
          { zone: 'Pagi', color: '#F59E0B', emoji: '🌅' },
          { zone: 'Siang', color: '#EF4444', emoji: '☀️' },
          { zone: 'Sore', color: '#EC4899', emoji: '🌆' },
          { zone: 'Malam', color: '#6366F1', emoji: '🌙' },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="text-sm">{item.emoji}</span>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: item.color }}></div>
            <span className="text-gray-600 font-medium">{item.zone}</span>
          </div>
        ))}
      </div>
      
      <ResponsiveContainer width="100%" height={240} className="sm:h-[280px] lg:h-[300px]">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <ReferenceArea x1="6:00" x2="12:00" fill="#F59E0B" fillOpacity={0.05} />
          <ReferenceArea x1="12:00" x2="17:00" fill="#EF4444" fillOpacity={0.05} />
          <ReferenceArea x1="17:00" x2="20:00" fill="#EC4899" fillOpacity={0.05} />
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="hour" 
            tick={{ fill: '#6b7280', fontSize: 9 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 9 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={threshold} 
            stroke="#EF4444" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: 'Peak', 
              position: 'insideTopLeft',
              fill: '#EF4444',
              fontSize: 10,
              fontWeight: 'bold'
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#F59E0B" 
            strokeWidth={2.5} 
            fill="url(#colorHourly)" 
            name="Access Count"
            dot={{ fill: '#F59E0B', r: 2 }}
            activeDot={{ r: 5, fill: '#D97706' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Peak Hours Summary */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { 
            label: 'Peak Hour', 
            value: data.reduce((max, item) => item.count > max.count ? item : max, data[0])?.hour,
            subtext: `${data.reduce((max, item) => item.count > max.count ? item : max, data[0])?.count} akses`,
            icon: '🔥',
            color: '#EF4444'
          },
          { 
            label: 'Avg Access', 
            value: Math.round(data.reduce((sum, d) => sum + d.count, 0) / data.length),
            subtext: 'per hour',
            icon: '📊',
            color: '#3B82F6'
          },
          { 
            label: 'Off-Peak', 
            value: data.reduce((min, item) => item.count < min.count ? item : min, data[0])?.hour,
            subtext: `${data.reduce((min, item) => item.count < min.count ? item : min, data[0])?.count} akses`,
            icon: '🌙',
            color: '#6366F1'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-gray-200 text-center">
            <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2 block">{stat.icon}</span>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1 truncate">{stat.label}</p>
            <p className="text-base sm:text-xl lg:text-2xl font-extrabold mb-1 truncate" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-600 truncate">{stat.subtext}</p>
          </div>
        ))}
      </div>
      
      {/* Key Insight */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}></div>
        <div className="relative">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse" style={{ backgroundColor: '#F59E0B' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#92400e' }}>
                Peak Time Alert
                <span className="px-1.5 sm:px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">INFO</span>
              </p>
              <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#b45309' }}>
                Jam sibuk: <span className="font-bold text-base sm:text-xl" style={{ color: '#F59E0B' }}>{data.reduce((max, item) => item.count > max.count ? item : max, data[0])?.hour}</span> dengan <span className="font-bold" style={{ color: '#EF4444' }}>{data.reduce((max, item) => item.count > max.count ? item : max, data[0])?.count} akses</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HourlyUsageChart;