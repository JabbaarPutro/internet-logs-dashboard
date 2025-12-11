function SummaryCards({ summary }) {
  const cards = [
    { 
      title: 'Total Activities', 
      value: summary.totalActivities?.toLocaleString() || '0', 
      percentage: '+2.5',
      isPositive: true,
      bgColor: '#DBEAFE',
      iconColor: '#3B82F6',
      gradientFrom: '#3B82F6',
      gradientTo: '#2563eb',
      sparklineData: [20, 35, 25, 45, 40, 60, 55],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      title: 'Unique Users', 
      value: summary.uniqueUsers?.toLocaleString() || '0', 
      percentage: '+0.5',
      isPositive: true,
      bgColor: '#F0FDFA',
      iconColor: '#14B8A6',
      gradientFrom: '#3B82F6',
      gradientTo: '#2563eb',
      sparklineData: [30, 40, 35, 50, 45, 55, 60],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      title: 'Rejected Activities', 
      value: summary.rejectedCount?.toLocaleString() || '0', 
      percentage: '-0.2',
      isPositive: false,
      bgColor: '#FEE2E2',
      iconColor: '#EF4444',
      gradientFrom: '#EF4444',
      gradientTo: '#DC2626',
      sparklineData: [50, 48, 45, 43, 40, 38, 36],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    { 
      title: 'Top Category', 
      value: summary.topCategory || 'N/A', 
      unit: '',
      percentage: '+0.12',
      isPositive: true,
      bgColor: '#FEF3C7',
      iconColor: '#F59E0B',
      gradientFrom: '#3B82F6',
      gradientTo: '#2563eb',
      sparklineData: [40, 42, 45, 48, 50, 53, 55],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
  ];

  const Sparkline = ({ data, isPositive }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const lineColor = isPositive ? '#3B82F6' : '#EF4444';
    const gradientId = `gradient-${isPositive ? 'positive' : 'negative'}-${Math.random()}`;

    return (
      <svg className="w-full h-10 sm:h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: lineColor, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: lineColor, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,100 ${points} 100,100`}
        />
        
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={lineColor}
              opacity="0.8"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Tooltip - Hidden on mobile */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:block">
            <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-lg whitespace-nowrap">
              View Details
            </div>
          </div>

          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div 
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0"
              style={{ backgroundColor: card.bgColor }}
            >
              <div style={{ color: card.iconColor }}>
                {card.icon}
              </div>
            </div>
            {card.percentage && (
              <span className={`text-xs font-bold flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex-shrink-0 ${
                card.isPositive 
                  ? 'text-white' 
                  : 'text-white'
              }`}
              style={{ backgroundColor: card.isPositive ? '#10B981' : '#EF4444' }}
              >
                {card.isPositive ? (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-xs">{card.percentage}%</span>
              </span>
            )}
          </div>

          <div className="mb-2 sm:mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">
              {card.title}
            </h3>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-none">
                {card.value}
              </p>
              {card.unit && (
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-500">{card.unit}</span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          <div className="mb-2 sm:mb-3">
            <Sparkline 
              data={card.sparklineData} 
              isPositive={card.isPositive}
            />
          </div>

          {/* Progress Bar */}
          <div 
            className="h-1 sm:h-1.5 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-100 scale-x-85"
            style={{ 
              background: `linear-gradient(to right, ${card.gradientFrom}, ${card.gradientTo})`
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;