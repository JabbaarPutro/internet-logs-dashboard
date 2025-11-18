import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import ProductivityChart from './components/Charts/ProductivityChart';
import CategoryChart from './components/Charts/CategoryChart';
import BandwidthChart from './components/Charts/BandwidthChart';
import HourlyUsageChart from './components/Charts/HourlyUsageChart';
import TopUsersTable from './components/Charts/TopUsersTable';
import { parseFile, analyzeData, applyFilters } from './utils/dataParser';
import { useFilter } from './contexts/FilterContext';

function App() {
  const [rawData, setRawData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showUpload, setShowUpload] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { filters, updateFilter, resetFilters } = useFilter();

  useEffect(() => {
    if (rawData) {
      console.log('🔄 Applying filters:', filters);
      const filteredData = applyFilters(rawData, filters);
      console.log(`📊 Filtered data: ${filteredData.length} records`);
      
      if (filteredData.length > 0) {
        const newAnalysis = analyzeData(filteredData);
        setAnalysis(newAnalysis);
      } else {
        setAnalysis({
          summary: {
            totalRecords: 0,
            totalBandwidth: 0,
            totalDuration: 0,
            productivityRate: 0,
            uniqueUsers: 0,
            uniqueDepartments: 0
          },
          productivityChart: [],
          categoryChart: [],
          bandwidthChart: [],
          deviceChart: [],
          hourlyChart: [],
          topUsers: []
        });
      }
    }
  }, [filters, rawData]);

  const handleFileLoad = async (file) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      console.log('📂 File loaded:', file.name, 'Size:', file.size, 'bytes');
      
      const parsedData = await parseFile(file);
      console.log('📊 Parsed records:', parsedData.length);
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      if (parsedData.length === 0) {
        setError('Tidak ada data yang berhasil di-parse. Pastikan format file sudah benar.');
        setLoading(false);
        return;
      }
      
      setRawData(parsedData);
      const analyzedData = analyzeData(parsedData);
      
      if (!analyzedData) {
        setError('Gagal menganalisis data.');
        setLoading(false);
        return;
      }
      
      setAnalysis(analyzedData);
      setShowUpload(false);
      console.log('✅ Dashboard ready!');
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError(`Error: ${error.message}`);
      clearInterval(progressInterval);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    resetFilters();
    setShowMobileFilters(false);
    console.log('🔄 Filters cleared');
  };

  const departments = rawData 
    ? [...new Set(rawData.map(item => item.department))].sort()
    : [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #0d9488 50%, #0f766e 100%)' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile-Optimized Header */}
        <header className="mb-4 sm:mb-6 animate-fadeIn">
          <div className="glass rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-4 sm:py-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between gap-3">
              {/* Logo & Title */}
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}>
                  <svg className="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-extrabold truncate" style={{ color: '#F59E0B' }}>
                    Internet Analytics
                  </h1>
                  <p className="text-white/90 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium hidden sm:block">
                    Dashboard Analisis Penggunaan Internet
                  </p>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              {analysis && (
                <div className="flex items-center gap-2">
                  {/* Mobile Search Toggle */}
                  <button
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                    className="lg:hidden bg-white/20 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden bg-white/20 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all relative"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {(filters.department !== 'all' || filters.dateRange.preset !== 'all' || filters.searchQuery) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>
              )}

              {/* Desktop Search Bar */}
              {analysis && (
                <div className="flex-1 max-w-md ml-8 hidden lg:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users, departments..."
                      value={filters.searchQuery}
                      onChange={(e) => updateFilter('searchQuery', e.target.value)}
                      className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 px-4 py-3 pl-11 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    />
                    <svg className="w-5 h-5 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {filters.searchQuery && (
                      <button
                        onClick={() => updateFilter('searchQuery', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Bar (Collapsible) */}
            {analysis && showMobileSearch && (
              <div className="mt-4 lg:hidden animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 px-4 py-2.5 pl-10 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                  />
                  <svg className="w-4 h-4 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {filters.searchQuery && (
                    <button
                      onClick={() => updateFilter('searchQuery', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Breadcrumb - Hidden on mobile */}
            {analysis && (
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-white/80 mt-4 sm:mt-6 pt-4 border-t border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-white font-semibold">Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="hidden md:inline">Analytics</span>
                <svg className="w-4 h-4 hidden md:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="hidden md:inline">Internet Usage</span>
                {fileName && (
                  <>
                    <svg className="w-4 h-4 hidden lg:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-white/60 truncate max-w-xs hidden lg:inline">{fileName}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Upload Section */}
        {showUpload && (
          <div className="animate-slideInRight">
            <FileUpload 
              onFileLoad={handleFileLoad} 
              uploadProgress={uploadProgress}
              loading={loading}
            />
          </div>
        )}

        {!showUpload && analysis && (
          <div className="mb-4 sm:mb-6 flex justify-end">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 text-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Import New</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg animate-fadeIn">
            <div className="flex items-start gap-3 sm:gap-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-800 font-bold text-base sm:text-lg mb-2">Terjadi Kesalahan</h3>
                <p className="text-red-600 text-xs sm:text-sm mb-2 break-words">{error}</p>
                <p className="text-red-500 text-xs">
                  💡 Tips: Pastikan file CSV/Excel memiliki kolom yang sesuai format
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && !analysis && (
          <div className="text-center py-12 sm:py-20 animate-fadeIn">
            <div className="inline-block glass rounded-2xl sm:rounded-3xl px-8 sm:px-16 py-8 sm:py-10 shadow-2xl border border-white/20">
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-white/30 rounded-full animate-spin mx-auto" style={{ borderTopColor: '#3B82F6' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="w-48 sm:w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <p className="text-white text-base sm:text-xl font-bold mb-2">Menganalisis Data...</p>
              <p className="text-white/80 text-xs sm:text-sm">{uploadProgress}% Complete</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Desktop Filter Bar */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Filters:</span>
                </div>
                
                <select 
                  value={filters.department}
                  onChange={(e) => updateFilter('department', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  {['all', 'today', 'week', 'month'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => updateFilter('dateRange', { ...filters.dateRange, preset })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.dateRange.preset === preset
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset === 'all' ? 'All Time' : 
                       preset === 'today' ? 'Today' :
                       preset === 'week' ? 'This Week' : 'This Month'}
                    </button>
                  ))}
                </div>

                {(filters.department !== 'all' || filters.dateRange.preset !== 'all' || filters.searchQuery) && (
                  <button 
                    onClick={handleClearFilters}
                    className="ml-auto px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                )}

                {analysis.summary.totalRecords < rawData.length && (
                  <div className="ml-auto px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                    {analysis.summary.totalRecords} of {rawData.length} records
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fadeIn" onClick={() => setShowMobileFilters(false)}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filters
                    </h3>
                    <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <select 
                        value={filters.department}
                        onChange={(e) => updateFilter('department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['all', 'today', 'week', 'month'].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => updateFilter('dateRange', { ...filters.dateRange, preset })}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              filters.dateRange.preset === preset
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {preset === 'all' ? 'All Time' : 
                             preset === 'today' ? 'Today' :
                             preset === 'week' ? 'This Week' : 'This Month'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(filters.department !== 'all' || filters.dateRange.preset !== 'all' || filters.searchQuery) && (
                      <button 
                        onClick={handleClearFilters}
                        className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold text-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            {analysis.summary.totalRecords > 0 ? (
              <>
                <SummaryCards summary={analysis.summary} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <ProductivityChart data={analysis.productivityChart} rawData={analysis.rawData} />
                  <CategoryChart data={analysis.categoryChart} />
                </div>

                <BandwidthChart data={analysis.bandwidthChart} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <HourlyUsageChart data={analysis.hourlyChart} />
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">Device Distribution</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {analysis.deviceChart.map((device, index) => {
                        const percentage = (device.value / analysis.summary.totalRecords * 100).toFixed(1);
                        const colors = ['#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
                        return (
                          <div key={index}>
                            <div className="flex justify-between mb-2 text-xs sm:text-sm">
                              <span className="font-medium text-gray-700 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ background: colors[index % colors.length] }}></span>
                                <span className="truncate">{device.name}</span>
                              </span>
                              <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">
                                {device.value} <span className="text-gray-500">({percentage}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  background: colors[index % colors.length]
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#F0FDFA', borderColor: '#14B8A6' }}>
                      <p className="text-xs sm:text-sm font-semibold flex items-center gap-2" style={{ color: '#0f766e' }}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        <span>Key Insight</span>
                      </p>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: '#115e59' }}>
                        {analysis.deviceChart[0]?.name} adalah device yang paling banyak digunakan
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pass full (filtered) raw data so the table shows all users; export logic in TopUsersTable still exports top 10 by default */}
                <TopUsersTable data={analysis.rawData} />
              </>
            ) : (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-lg">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Data Found</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">No records match your current filters</p>
                <button 
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-12 sm:py-20 animate-fadeIn">
            <div className="inline-block glass rounded-2xl sm:rounded-3xl px-8 sm:px-20 py-10 sm:py-14 shadow-2xl border-2 border-white/20">
              <div className="mb-6 sm:mb-8">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 text-white/80 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Belum Ada Data
              </h3>
              <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 px-4">
                Upload file CSV atau Excel untuk memulai analisis
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center text-xs sm:text-sm px-4">
                <span className="bg-white/20 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold border border-white/30 backdrop-blur-sm">✓ CSV</span>
                <span className="bg-white/20 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold border border-white/30 backdrop-blur-sm">✓ Excel (.xlsx)</span>
                <span className="bg-white/20 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold border border-white/30 backdrop-blur-sm">✓ Excel (.xls)</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {analysis && (
          <footer className="mt-8 sm:mt-12 text-center pb-4 sm:pb-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl px-6 sm:px-8 py-3 sm:py-4 inline-block border border-white/20">
              <p className="mt-1 text-white/80 text-xs">© 2025 Internet Analytics Dashboard | JabbaarPutro</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;