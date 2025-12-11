import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function BehaviorInsights({ rawData }) {
  const insights = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return null;
    }

    // 1. Work Hours vs Non-Work Hours
    const workHours = { count: 0, bandwidth: 0 };
    const nonWorkHours = { count: 0, bandwidth: 0 };
    
    // 2. Action Distribution
    const actionMap = {};
    
    // 3. Peak vs Off-Peak
    const hourlyActivity = Array(24).fill(0);
    
    // 4. User Consistency
    const userActivity = {};
    const userDays = {};
    
    rawData.forEach(log => {
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) return;
      
      const hour = date.getHours();
      const bandwidth = parseInt(log.bandwidth) || 0;
      const username = log.username || 'Unknown';
      const action = log.action || 'Unknown';
      
      // Work hours analysis (9-17)
      if (hour >= 9 && hour < 17) {
        workHours.count++;
        workHours.bandwidth += bandwidth;
      } else {
        nonWorkHours.count++;
        nonWorkHours.bandwidth += bandwidth;
      }
      
      // Action distribution
      actionMap[action] = (actionMap[action] || 0) + 1;
      
      // Hourly activity
      hourlyActivity[hour]++;
      
      // User consistency
      const dateKey = date.toDateString();
      if (!userDays[username]) userDays[username] = new Set();
      userDays[username].add(dateKey);
      userActivity[username] = (userActivity[username] || 0) + 1;
    });

    // Calculate metrics
    const totalActivities = rawData.length;
    const workHoursPercentage = ((workHours.count / totalActivities) * 100).toFixed(1);
    
    // Top 5 actions
    const topActions = Object.entries(actionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => ({
        action,
        count,
        percentage: ((count / totalActivities) * 100).toFixed(1)
      }));

    // Peak hours (top 5)
    const peakHours = hourlyActivity
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // User engagement levels
    const totalUsers = Object.keys(userActivity).length;
    const avgActivitiesPerUser = (totalActivities / totalUsers).toFixed(0);
    
    const activeUsers = Object.entries(userActivity).filter(([_, count]) => count > 100).length;
    const moderateUsers = Object.entries(userActivity).filter(([_, count]) => count > 20 && count <= 100).length;
    const casualUsers = Object.entries(userActivity).filter(([_, count]) => count <= 20).length;

    // Multi-day users
    const multiDayUsers = Object.values(userDays).filter(days => days.size > 1).length;
    const userRetention = ((multiDayUsers / totalUsers) * 100).toFixed(1);

    return {
      workHours: {
        data: [
          { name: 'Jam Kerja\n(09:00-17:00)', value: workHours.count, percentage: workHoursPercentage },
          { name: 'Di Luar Jam Kerja', value: nonWorkHours.count, percentage: (100 - workHoursPercentage).toFixed(1) }
        ]
      },
      topActions,
      peakHours,
      userEngagement: {
        total: totalUsers,
        avgActivities: avgActivitiesPerUser,
        distribution: [
          { level: 'Sangat Aktif', count: activeUsers, color: '#14B8A6', description: '>100 aktivitas' },
          { level: 'Moderat', count: moderateUsers, color: '#F59E0B', description: '20-100 aktivitas' },
          { level: 'Casual', count: casualUsers, color: '#6B7280', description: '<20 aktivitas' }
        ],
        retention: userRetention
      }
    };
  }, [rawData]);

  if (!insights) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <p className="text-gray-500 text-center">Tidak ada data untuk dianalisis</p>
      </div>
    );
  }

  const COLORS = ['#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

  return (
    <div className="space-y-4">
      {/* Work Hours Analysis */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Analisis Jam Kerja</h3>
            <p className="text-xs text-gray-500">Distribusi aktivitas berdasarkan jam kerja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={insights.workHours.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#14B8A6" />
                <Cell fill="#F59E0B" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col justify-center space-y-3">
            {insights.workHours.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: index === 0 ? '#F0FDFA' : '#FEF3C7' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: index === 0 ? '#14B8A6' : '#F59E0B' }}></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: index === 0 ? '#14B8A6' : '#F59E0B' }}>
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #3B82F6' }}>
          <p className="text-sm text-gray-700">
            <span className="font-bold" style={{ color: '#3B82F6' }}>💡 Insight:</span> 
            {insights.workHours.data[0].percentage > 60 
              ? ' Sebagian besar aktivitas terjadi pada jam kerja, menunjukkan penggunaan yang produktif.'
              : ' Aktivitas signifikan di luar jam kerja. Pertimbangkan untuk mereview kebijakan akses atau kebutuhan karyawan.'}
          </p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEE2E2' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Top 5 Aktivitas</h3>
            <p className="text-xs text-gray-500">Aksi yang paling sering dilakukan</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insights.topActions} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis type="category" dataKey="action" tick={{ fill: '#6b7280', fontSize: 12 }} width={90} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {insights.topActions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {insights.topActions.map((action, index) => (
            <div key={index} className="p-2 rounded-lg text-center" style={{ backgroundColor: COLORS[index] + '20' }}>
              <p className="text-xs font-medium text-gray-600 truncate" title={action.action}>{action.action}</p>
              <p className="text-sm font-bold" style={{ color: COLORS[index] }}>{action.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3E8FF' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Tingkat Engagement User</h3>
            <p className="text-xs text-gray-500">Distribusi aktivitas pengguna</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#F9FAFB', border: '2px solid #E5E7EB' }}>
            <p className="text-xs text-gray-500 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{insights.userEngagement.total}</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#F0FDFA', border: '2px solid #14B8A6' }}>
            <p className="text-xs text-gray-500 mb-1">Rata-rata Aktivitas</p>
            <p className="text-2xl font-bold" style={{ color: '#14B8A6' }}>{insights.userEngagement.avgActivities}</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#FEF3C7', border: '2px solid #F59E0B' }}>
            <p className="text-xs text-gray-500 mb-1">User Retention</p>
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{insights.userEngagement.retention}%</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.userEngagement.distribution.map((level, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }}></div>
                  <span className="text-sm font-medium text-gray-700">{level.level}</span>
                  <span className="text-xs text-gray-500">({level.description})</span>
                </div>
                <span className="text-sm font-bold" style={{ color: level.color }}>{level.count} users</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: level.color,
                    width: `${(level.count / insights.userEngagement.total * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F5F3FF', borderLeft: '4px solid #8B5CF6' }}>
          <p className="text-sm text-gray-700">
            <span className="font-bold" style={{ color: '#8B5CF6' }}>💡 Insight:</span> 
            {insights.userEngagement.retention > 50 
              ? ` User retention ${insights.userEngagement.retention}% menunjukkan engagement yang baik. Mayoritas user aktif dalam beberapa hari.`
              : ` User retention ${insights.userEngagement.retention}% cukup rendah. Pertimbangkan untuk meningkatkan engagement atau mereview kebutuhan akses.`}
          </p>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Top 5 Jam Tersibuk</h3>
            <p className="text-xs text-gray-500">Waktu dengan aktivitas tertinggi</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {insights.peakHours.map((peak, index) => (
            <div 
              key={index} 
              className="p-4 rounded-xl text-center transform hover:scale-105 transition-all"
              style={{ 
                backgroundColor: index === 0 ? '#14B8A6' : '#F0FDFA',
                border: index === 0 ? 'none' : '2px solid #14B8A6'
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-2">
                {index === 0 && (
                  <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <p className={`text-xs font-medium ${index === 0 ? 'text-white' : 'text-gray-500'}`}>
                  #{index + 1}
                </p>
              </div>
              <p className={`text-2xl font-bold mb-1 ${index === 0 ? 'text-white' : 'text-gray-800'}`}>
                {String(peak.hour).padStart(2, '0')}:00
              </p>
              <p className={`text-sm ${index === 0 ? 'text-teal-100' : 'text-gray-600'}`}>
                <span className="font-bold">{peak.count.toLocaleString()}</span> aktivitas
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
          <p className="text-sm text-gray-700">
            <span className="font-bold" style={{ color: '#F59E0B' }}>💡 Insight:</span> 
            Jam tersibuk adalah pukul <span className="font-bold">{String(insights.peakHours[0].hour).padStart(2, '0')}:00</span> dengan <span className="font-bold">{insights.peakHours[0].count.toLocaleString()}</span> aktivitas. Pertimbangkan untuk mengoptimalkan bandwidth pada jam-jam ini.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BehaviorInsights;
