import { useMemo } from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-2xl border-2" style={{ borderColor: '#14B8A6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">
          {data.day} - {data.hour}:00
        </p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: '#14B8A6' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#14B8A6' }}></span>
            Aktivitas: <span className="font-bold">{data.count}</span>
          </p>
          <p className="text-xs text-gray-600">
            {data.percentage}% dari total aktivitas hari ini
          </p>
        </div>
      </div>
    );
  }
  return null;
};

function ActivityHeatmap({ rawData }) {
  const { heatmapData, stats } = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return { heatmapData: [], stats: null };
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Create data structure
    const activityMap = {};
    const dayTotals = {};
    
    rawData.forEach(log => {
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) return;
      
      const dayIndex = (date.getDay() + 6) % 7; // Convert to Monday=0
      const hour = date.getHours();
      const key = `${dayIndex}-${hour}`;
      
      activityMap[key] = (activityMap[key] || 0) + 1;
      dayTotals[dayIndex] = (dayTotals[dayIndex] || 0) + 1;
    });

    // Generate heatmap data
    const data = [];
    let maxCount = 0;
    
    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        const key = `${dayIndex}-${hour}`;
        const count = activityMap[key] || 0;
        const dayTotal = dayTotals[dayIndex] || 1;
        
        maxCount = Math.max(maxCount, count);
        
        data.push({
          day,
          dayIndex,
          hour,
          count,
          percentage: ((count / dayTotal) * 100).toFixed(1)
        });
      });
    });

    // Calculate statistics
    const peakActivity = data.reduce((max, curr) => 
      curr.count > max.count ? curr : max, data[0]
    );
    
    const totalActivities = Object.values(activityMap).reduce((sum, val) => sum + val, 0);
    const avgPerHour = (totalActivities / data.filter(d => d.count > 0).length).toFixed(0);
    
    // Find busiest day
    const busiestDay = Object.entries(dayTotals)
      .reduce((max, [day, count]) => count > max.count ? { day, count } : max, { day: 0, count: 0 });

    return {
      heatmapData: data.map(d => ({
        ...d,
        intensity: d.count / maxCount
      })),
      stats: {
        peakActivity,
        avgPerHour,
        busiestDay: { day: days[busiestDay.day], count: busiestDay.count },
        maxCount
      }
    };
  }, [rawData]);

  const getColorIntensity = (intensity) => {
    if (intensity === 0) return '#F3F4F6';
    if (intensity < 0.2) return '#CCFBF1';
    if (intensity < 0.4) return '#99F6E4';
    if (intensity < 0.6) return '#5EEAD4';
    if (intensity < 0.8) return '#2DD4BF';
    return '#14B8A6';
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
          <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#14B8A6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Activity Heatmap</h3>
          <p className="text-xs text-gray-500">Pola aktivitas per jam dan hari dalam seminggu</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hours header */}
          <div className="flex mb-2">
            <div className="w-20 flex-shrink-0"></div>
            <div className="flex-1 flex justify-between px-2">
              {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
                <div key={hour} className="text-xs text-gray-500 font-medium">
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Days rows */}
          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-20 text-xs sm:text-sm font-medium text-gray-600 flex-shrink-0">
                {day}
              </div>
              <div className="flex-1 flex gap-0.5">
                {heatmapData
                  .filter(d => d.dayIndex === dayIndex)
                  .map((cell, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-8 sm:h-10 rounded transition-all hover:scale-110 hover:shadow-lg cursor-pointer group relative"
                      style={{ backgroundColor: getColorIntensity(cell.intensity) }}
                      title={`${cell.day} ${cell.hour}:00 - ${cell.count} aktivitas`}
                    >
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute z-10 -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl whitespace-nowrap">
                        <div className="font-bold">{cell.hour}:00</div>
                        <div>{cell.count} aktivitas</div>
                        <div className="text-gray-300">{cell.percentage}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-xs text-gray-500">Rendah</span>
        <div className="flex gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, idx) => (
            <div
              key={idx}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getColorIntensity(intensity) }}
            ></div>
          ))}
        </div>
        <span className="text-xs text-gray-500">Tinggi</span>
      </div>

      {/* Insights */}
      {stats && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Peak Activity */}
          <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#F0FDFA', borderLeft: '4px solid #14B8A6' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14B8A6' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-700">Waktu Puncak</h4>
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-bold text-lg" style={{ color: '#14B8A6' }}>
                {stats.peakActivity.day}
              </span>
              <br />
              Jam {stats.peakActivity.hour}:00 
              <br />
              <span className="font-bold">{stats.peakActivity.count}</span> aktivitas
            </p>
          </div>

          {/* Busiest Day */}
          <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F59E0B' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-700">Hari Tersibuk</h4>
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-bold text-lg" style={{ color: '#F59E0B' }}>
                {stats.busiestDay.day}
              </span>
              <br />
              <span className="font-bold">{stats.busiestDay.count}</span> total aktivitas
            </p>
          </div>

          {/* Average Activity */}
          <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: '#E0E7FF', borderLeft: '4px solid #6366F1' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366F1' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-700">Rata-rata per Jam</h4>
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-bold text-lg" style={{ color: '#6366F1' }}>
                {stats.avgPerHour}
              </span>
              <br />
              aktivitas per jam aktif
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityHeatmap;
