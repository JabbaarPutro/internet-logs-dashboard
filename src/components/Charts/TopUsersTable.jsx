import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

function TopUsersTable({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const aggregatedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const first = data[0];
    const looksAggregated = first && (first.hasOwnProperty('bandwidth') || first.hasOwnProperty('duration'));
    if (looksAggregated) {
      return data.map(d => ({
        user_id: d.user_id,
        department: d.department || d.dept || '',
        bandwidth: Number(d.bandwidth ?? 0),
        duration: Number(d.duration ?? 0)
      }));
    }

    const map = new Map();
    for (const row of data) {
      const uid = row.user_id || row.user || 'unknown';
      if (!map.has(uid)) {
        map.set(uid, { user_id: uid, department: row.department || row.dept || '', bandwidth: 0, duration: 0 });
      }
      const entry = map.get(uid);
      entry.bandwidth += Number(row.bandwidth ?? row.bandwidth_mb ?? 0);
      entry.duration += Number(row.duration ?? row.duration_minutes ?? 0);
    }
    return Array.from(map.values()).map(e => ({ ...e, bandwidth: parseFloat(e.bandwidth.toFixed(2)), duration: Math.round(e.duration) }));
  }, [data]);

  const globalSorted = useMemo(() => {
    return [...aggregatedData].sort((a, b) => {
      const aVal = Number(a.bandwidth ?? 0);
      const bVal = Number(b.bandwidth ?? 0);
      if (bVal !== aVal) return bVal - aVal;
      return String(a.user_id).localeCompare(String(b.user_id));
    });
  }, [aggregatedData]);

  const filteredData = globalSorted.filter(user => 
    String(user.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBandwidth = (u) => {
    return Number(u.bandwidth ?? u.bandwidth_mb ?? 0);
  };

  const getDuration = (u) => {
    return Number(u.duration ?? u.duration_minutes ?? 0);
  };

  const valueForKey = (u, key) => {
    if (key === 'bandwidth') return getBandwidth(u);
    if (key === 'duration') return getDuration(u);
    return u[key];
  };

  const sortedData = filteredData;
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedData.map(user => user.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleExport = (format) => {
    if (format !== 'excel') {
    return;
    }

    const exportList = selectedUsers.length > 0
      ? globalSorted.filter(u => selectedUsers.includes(u.user_id))
      : globalSorted.slice(0, 10);

    const rows = exportList.map(u => ({
      Rank: globalSorted.findIndex(s => s.user_id === u.user_id) + 1,
      User: u.user_id,
      Department: u.department,
      Bandwidth_MB: getBandwidth(u),
      Duration_min: getDuration(u)
    }));

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows, { header: ['Rank', 'User', 'Department', 'Bandwidth_MB', 'Duration_min'] });
      XLSX.utils.book_append_sheet(wb, ws, 'TopUsers');

      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g, '_');
      const filename = `internet_logs_top_users_${ts}.xlsx`;
      XLSX.writeFile(wb, filename);
      console.log(`✅ Exported ${rows.length} users to ${filename}`);
    } catch (err) {
      console.error('Error exporting XLSX:', err);
      alert('Gagal mengekspor file XLSX. Cek console untuk detail.');
    }
  };

  const getInitials = (userId) => {
    return userId.replace('EMP', '').substring(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors = ['#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];
    return colors[index % colors.length];
  };

  const SortIcon = ({ columnKey }) => {
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <svg className="w-7 h-7" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Top Users by Bandwidth</h3>
            <p className="text-xs text-gray-500">Pengguna dengan konsumsi bandwidth tertinggi</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <span className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg">
              {selectedUsers.length} selected
            </span>
          )}
          <div className="relative group">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            {/* Export Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[250px] relative">
          <input
            type="text"
            placeholder="Search by User ID or Department..."
            value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select 
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <div className="text-sm text-gray-600 font-medium">
          Showing {Math.min(startIndex + 1, sortedData.length)}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ background: 'linear-gradient(to right, #14B8A6, #3B82F6)' }}>
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Department
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider transition-colors"
              >
                  <div className="flex items-center gap-2">
                  Bandwidth (MB)
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider transition-colors"
              >
                  <div className="flex items-center gap-2">
                  Duration (min)
                </div>
              </th>
              {/* Actions column removed as requested */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No users found</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Clear search
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((user, index) => {
                // globalIndex = position in globalSorted (0-based)
                const globalIndex = globalSorted.findIndex(s => s.user_id === user.user_id);
                const actualIndex = globalIndex >= 0 ? globalIndex : (startIndex + index);
                const isSelected = selectedUsers.includes(user.user_id);
                const maxBandwidth = Math.max(...aggregatedData.map(u => getBandwidth(u)) || [1]);
                const userBandwidth = getBandwidth(user);
                const bandwidthPercentage = maxBandwidth > 0 ? ((userBandwidth / maxBandwidth) * 100).toFixed(0) : 0;
                
                return (
                  <tr 
                    key={user.user_id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      globalIndex === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : 
                      globalIndex === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50' :
                      globalIndex === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50' : ''
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectUser(user.user_id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-3xl">
                        {globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : globalIndex === 2 ? '🥉' : 
                        <span className="text-sm font-bold text-gray-600">#{globalIndex + 1}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md"
                          style={{ backgroundColor: getAvatarColor(globalIndex) }}
                        >
                          {getInitials(user.user_id)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.user_id}</p>
                          {globalIndex < 3 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                              backgroundColor: globalIndex === 0 ? '#FEF3C7' : globalIndex === 1 ? '#E5E7EB' : '#FED7AA',
                              color: globalIndex === 0 ? '#92400E' : globalIndex === 1 ? '#374151' : '#9A3412'
                            }}>
                              Top {globalIndex + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg" style={{
                        backgroundColor: `${getAvatarColor(globalIndex)}20`,
                        color: getAvatarColor(globalIndex)
                      }}>
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-gray-900 text-base">{getBandwidth(user)}</span>
                          <span className="text-xs text-gray-500">MB</span>
                        </div>
                        {/* Visual Bandwidth Bar */}
                        <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${bandwidthPercentage}%`,
                              backgroundColor: getAvatarColor(globalIndex)
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{bandwidthPercentage}% of max</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">{getDuration(user)}</span>
                        <span className="text-xs text-gray-500">min</span>
                      </div>
                    </td>
                    {/* Actions column removed */}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'text-white shadow-lg'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={currentPage === page ? { background: 'linear-gradient(to right, #14B8A6, #3B82F6)' } : {}}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Enhanced Key Insight */}
      <div className="mt-6 p-5 rounded-xl border-2 relative overflow-hidden" style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}></div>
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: '#92400e' }}>
                Top User Alert
                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">VIP</span>
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#b45309' }}>
                {globalSorted.length > 0 ? (
                  <>
                    <span className="font-bold text-lg">{globalSorted[0]?.user_id}</span> dari departemen <span className="font-bold">{globalSorted[0]?.department}</span> menggunakan bandwidth tertinggi (<span className="font-bold text-xl" style={{ color: '#EF4444' }}>{getBandwidth(globalSorted[0])} MB</span>)
                  </>
                ) : (
                  <span className="font-bold">No data available</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopUsersTable;