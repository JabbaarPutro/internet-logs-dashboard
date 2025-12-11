import { useState } from 'react';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import TopUsersChart from './components/Charts/TopUsersChart';
import AppCategoriesChart from './components/Charts/AppCategoriesChart';
import ActionsChart from './components/Charts/ActionsChart';
import ActivityHeatmap from './components/Charts/ActivityHeatmap';
import BehaviorInsights from './components/Charts/BehaviorInsights';
import { parseFile } from './utils/dataParser';

function App() {
  const [rawData, setRawData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showUpload, setShowUpload] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const analyzeSummary = (data) => {
    if (!data || data.length === 0) return null;

    const uniqueUsers = new Set();
    const actionCounts = {};
    const categoryMap = {};

    data.forEach(log => {
      const user = log.username || log.source_ip;
      if (user) uniqueUsers.add(user);
      
      const action = log.action || 'Unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
      
      const category = log.app_category || 'Unknown';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'N/A';

    return {
      totalActivities: data.length,
      uniqueUsers: uniqueUsers.size,
      rejectedCount: actionCounts['Reject'] || 0,
      topCategory: topCategory
    };
  };

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
      const summaryData = analyzeSummary(parsedData);
      
      if (!summaryData) {
        setError('Gagal menganalisis data.');
        setLoading(false);
        return;
      }
      
      setSummary(summaryData);
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


            </div>

            {/* Breadcrumb - Hidden on mobile */}
            {summary && (
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-white/80 mt-4 sm:mt-6 pt-4 border-t border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-white font-semibold">Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="hidden md:inline">Network Activity</span>
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

        {!showUpload && summary && (
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

        {loading && !summary && (
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

        {summary && !loading && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <SummaryCards summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TopUsersChart rawData={rawData} />
              <AppCategoriesChart rawData={rawData} />
            </div>

            <ActionsChart rawData={rawData} />

            <ActivityHeatmap rawData={rawData} />

            <BehaviorInsights rawData={rawData} />
          </div>
        )}

        {!summary && !loading && !error && (
          <div className="text-center py-12 sm:py-20 animate-fadeIn">
            <div className="inline-block glass rounded-2xl sm:rounded-3xl px-8 sm:px-20 py-10 sm:py-14 shadow-2xl border-2 border-white/20">
              <div className="mb-6 sm:mb-8">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 text-white/80 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Selamat Datang di Internet Analytics
              </h3>
              <p className="text-white/90 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 px-4 max-w-2xl mx-auto">
                Dashboard analisis penggunaan internet yang powerful dengan visualisasi interaktif dan insight mendalam
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-teal-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">Activity Heatmap</h4>
                  <p className="text-white/70 text-xs">Pola aktivitas per jam & hari</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-amber-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">User Behavior</h4>
                  <p className="text-white/70 text-xs">Analisis engagement user</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">Smart Insights</h4>
                  <p className="text-white/70 text-xs">Rekomendasi otomatis</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {summary && (
          <footer className="mt-8 sm:mt-12 text-center pb-4 sm:pb-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl px-6 sm:px-8 py-3 sm:py-4 inline-block border border-white/20">
              <p className="mt-1 text-white/80 text-xs">© 2025 Network Activity Analytics Dashboard | JabbaarPutro</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
