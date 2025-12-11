import { useRef, useState } from 'react';
import { downloadCSVTemplate } from '../utils/dataTemplate';
import * as XLSX from 'xlsx';

function FileUpload({ onFileLoad, uploadProgress, loading }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n').slice(0, 4);
        setPreviewData(lines);
      };
      reader.readAsText(file);
      
      onFileLoad(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileLoad(file);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold" style={{ color: '#F59E0B' }}>
            Import Dataset
          </h2>
        </div>
        
        {previewData && !loading && (
          <span className="text-xs sm:text-sm text-green-600 flex items-center gap-1.5 sm:gap-2 font-semibold">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Ready to Upload</span>
          </span>
        )}
      </div>
      
      <div
        className={`rounded-xl sm:rounded-2xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 text-center transition-all duration-300 border-2 border-dashed ${
          isDragging 
            ? 'border-primary-400 bg-gray-50 scale-[1.01]' 
            : 'border-gray-300 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
          aria-label="Upload CSV or Excel file"
          id="data-file-input"
        />
        
        <div className="mb-4 sm:mb-6">
          <div className="inline-block bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md border border-gray-100">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="text-white font-bold py-2.5 sm:py-3 lg:py-4 px-8 sm:px-10 lg:px-12 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 sm:mb-5 text-sm sm:text-base lg:text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#F59E0B' }}
        >
          <span className="flex items-center gap-2 sm:gap-3 justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
            </svg>
            {loading ? 'Uploading...' : 'Pilih File'}
          </span>
        </button>

        <button
          onClick={() => {
            downloadCSVTemplate();
          }}
          disabled={loading}
          className="ml-3 bg-white text-gray-800 font-semibold py-2.5 sm:py-3 lg:py-4 px-4 sm:px-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md text-sm sm:text-base transition-all"
          aria-label="Download template CSV"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M21 21H3" />
            </svg>
            Download Template (CSV)
          </span>
        </button>
        
        {loading && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(to right, #14B8A6, #3B82F6)'
                }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 font-semibold">{uploadProgress}% Complete</p>
          </div>
        )}
        
        <p className="text-gray-700 text-sm sm:text-base mb-1.5 sm:mb-2 font-medium">atau drag & drop file di sini</p>
        <p className="text-xs sm:text-sm text-gray-600">
          Mendukung: <span className="font-bold text-gray-800">CSV, XLSX, XLS</span>
        </p>
        <p className="text-xs text-gray-500 mt-1 sm:mt-2">Max size: 10MB</p>
      </div>
      
      {previewData && !loading && (
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-green-200">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-green-900">Data Preview</h3>
          </div>
          <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 border border-green-200 overflow-x-auto">
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
              {previewData.join('\n')}
            </pre>
          </div>
          <p className="text-xs text-green-700 mt-2 font-medium">Showing first 3 rows...</p>
        </div>
      )}
      
    </div>
  );
}

export default FileUpload;