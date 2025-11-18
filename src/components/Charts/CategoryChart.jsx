import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border-2" style={{ borderColor: '#8B5CF6' }}>
        <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{payload[0].name}</p>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm" style={{ color: '#8B5CF6' }}>
            Duration: <span className="font-bold">{payload[0].value} min</span>
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

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold"
      style={{ textShadow: '0 0 3px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function CategoryChart({ data }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const totalDuration = data.reduce((sum, item) => sum + item.duration, 0);
  
  const processedData = [];
  let othersCount = 0;
  let othersDuration = 0;
  
  data.forEach(item => {
    const percentage = (item.duration / totalDuration * 100);
    if (percentage >= 5) {
      processedData.push({
        ...item,
        name: item.category,
        percentage: percentage.toFixed(1)
      });
    } else {
      othersCount++;
      othersDuration += item.duration;
    }
  });
  
  if (othersCount > 0) {
    processedData.push({
      category: 'Others',
      name: 'Others',
      duration: othersDuration,
      count: othersCount,
      percentage: (othersDuration / totalDuration * 100).toFixed(1)
    });
  }
  
  const chartData = processedData.slice(0, 8);
  const centerValue = `${(totalDuration / 60).toFixed(1)} hrs`;
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Category Distribution</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Kategori website berdasarkan durasi</p>
          </div>
        </div>
        
        {/* Export Button - Hidden on mobile */}
        <button className="hidden sm:flex px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm font-semibold text-purple-600">Export</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donut Chart */}
        <div className="flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height={240} className="sm:h-[280px] lg:h-[300px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={window.innerWidth < 640 ? 80 : window.innerWidth < 1024 ? 90 : 110}
                innerRadius={window.innerWidth < 640 ? 50 : window.innerWidth < 1024 ? 60 : 70}
                fill="#8884d8"
                dataKey="duration"
                paddingAngle={2}
                onMouseEnter={(data) => setSelectedCategory(data.name)}
                onMouseLeave={() => setSelectedCategory(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{ 
                      filter: selectedCategory === entry.name ? 'brightness(1.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800">{centerValue}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Total Time</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-col justify-center space-y-1.5 sm:space-y-2">
          <div className="mb-2 pb-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase">Category Breakdown</p>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5 sm:space-y-2 pr-2">
            {chartData.map((item, index) => {
              const isSelected = selectedCategory === item.name;
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between py-2 px-2.5 sm:px-3 rounded-lg transition-all cursor-pointer ${
                    isSelected ? 'bg-purple-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setSelectedCategory(item.name)}
                  onMouseLeave={() => setSelectedCategory(null)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 shadow-sm" 
                      style={{ background: COLORS[index % COLORS.length] }}
                    ></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.duration} min</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Key Insight */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10" style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}></div>
        <div className="relative">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse" style={{ backgroundColor: '#8B5CF6' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-1 sm:mb-2" style={{ color: '#6b21a8' }}>
                Key Insight
                <span className="px-1.5 sm:px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-bold rounded-full">HIGH</span>
              </p>
              <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: '#7c3aed' }}>
                "<span className="font-bold" style={{ color: '#EC4899' }}>{data[0]?.category}</span>" mendominasi dengan <span className="font-bold text-base sm:text-xl" style={{ color: '#8B5CF6' }}>{data[0]?.duration} menit</span> total penggunaan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;