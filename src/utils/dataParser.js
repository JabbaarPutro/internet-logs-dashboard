import * as XLSX from 'xlsx';

export const parseSQLInserts = (sqlContent) => {
};

export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsedData = [];
        
        if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(data);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          parsedData = parseExcel(data);
        } else {
          reject(new Error('Format file tidak didukung. Gunakan .csv atau .xlsx/.xls'));
          return;
        }
        
        console.log(`✅ Successfully parsed ${parsedData.length} records from ${file.name}`);
        resolve(parsedData);
        
      } catch (error) {
        console.error('❌ Error parsing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 10) {
      const record = {
        timestamp: values[0],
        user_id: values[1],
        ip_address: values[2],
        department: values[3],
        website: values[4],
        category: values[5],
        duration_minutes: parseInt(values[6]) || 0,
        bandwidth_mb: parseFloat(values[7]) || 0,
        device_type: values[8],
        is_productive: values[9]
      };
      data.push(record);
    }
  }
  
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length < 2) return [];
  
  const data = [];
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length >= 10) {
      const record = {
        timestamp: row[0],
        user_id: row[1],
        ip_address: row[2],
        department: row[3],
        website: row[4],
        category: row[5],
        duration_minutes: parseInt(row[6]) || 0,
        bandwidth_mb: parseFloat(row[7]) || 0,
        device_type: row[8],
        is_productive: row[9]
      };
      data.push(record);
    }
  }
  
  return data;
}

export const applyFilters = (data, filters) => {
  let filtered = [...data];

  if (filters.department && filters.department !== 'all') {
    filtered = filtered.filter(item => item.department === filters.department);
  }

  if (filters.dateRange && filters.dateRange.preset !== 'all') {
    const now = new Date();
    let startDate;

    switch (filters.dateRange.preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate;
      });
    }
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.user_id.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.website.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }

  return filtered;
};

export const analyzeData = (data) => {
  if (!data || data.length === 0) {
    console.warn('⚠️ No data to analyze');
    return null;
  }
  
  console.log(`📊 Analyzing ${data.length} records...`);
  
  const productivityByDept = data.reduce((acc, log) => {
    if (!acc[log.department]) {
      acc[log.department] = { productive: 0, unproductive: 0, total: 0 };
    }
    acc[log.department].total++;
    if (log.is_productive === 'Yes') {
      acc[log.department].productive++;
    } else {
      acc[log.department].unproductive++;
    }
    return acc;
  }, {});
  
  const productivityChart = Object.keys(productivityByDept).map(dept => ({
    department: dept,
    productive: productivityByDept[dept].productive,
    unproductive: productivityByDept[dept].unproductive,
    productivityRate: ((productivityByDept[dept].productive / productivityByDept[dept].total) * 100).toFixed(1)
  }));
  
  const categoryStats = data.reduce((acc, log) => {
    if (!acc[log.category]) {
      acc[log.category] = { count: 0, duration: 0, bandwidth: 0 };
    }
    acc[log.category].count++;
    acc[log.category].duration += log.duration_minutes;
    acc[log.category].bandwidth += log.bandwidth_mb;
    return acc;
  }, {});
  
  const categoryChart = Object.keys(categoryStats)
    .map(cat => ({
      category: cat,
      count: categoryStats[cat].count,
      duration: categoryStats[cat].duration,
      bandwidth: parseFloat(categoryStats[cat].bandwidth.toFixed(2))
    }))
    .sort((a, b) => b.duration - a.duration);
  
  const bandwidthByDate = data.reduce((acc, log) => {
    const date = log.timestamp.split(' ')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += log.bandwidth_mb;
    return acc;
  }, {});
  
  const bandwidthChart = Object.keys(bandwidthByDate)
    .sort()
    .map(date => ({
      date,
      bandwidth: parseFloat(bandwidthByDate[date].toFixed(2))
    }));
  
  const deviceStats = data.reduce((acc, log) => {
    if (!acc[log.device_type]) {
      acc[log.device_type] = 0;
    }
    acc[log.device_type]++;
    return acc;
  }, {});
  
  const deviceChart = Object.keys(deviceStats).map(device => ({
    name: device,
    value: deviceStats[device]
  }));
  
  const hourlyUsage = data.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    if (!acc[hour]) {
      acc[hour] = { count: 0, duration: 0 };
    }
    acc[hour].count++;
    acc[hour].duration += log.duration_minutes;
    return acc;
  }, {});
  
  const hourlyChart = Object.keys(hourlyUsage)
    .map(hour => ({
      hour: `${hour}:00`,
      count: hourlyUsage[hour].count,
      duration: hourlyUsage[hour].duration
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  
  const userBandwidth = data.reduce((acc, log) => {
    if (!acc[log.user_id]) {
      acc[log.user_id] = { bandwidth: 0, duration: 0, department: log.department };
    }
    acc[log.user_id].bandwidth += log.bandwidth_mb;
    acc[log.user_id].duration += log.duration_minutes;
    return acc;
  }, {});
  
  const topUsers = Object.keys(userBandwidth)
    .map(user => ({
      user_id: user,
      bandwidth: parseFloat(userBandwidth[user].bandwidth.toFixed(2)),
      duration: userBandwidth[user].duration,
      department: userBandwidth[user].department
    }))
    .sort((a, b) => b.bandwidth - a.bandwidth)
    .slice(0, 10);
  
  const totalBandwidth = data.reduce((sum, log) => sum + log.bandwidth_mb, 0);
  const totalDuration = data.reduce((sum, log) => sum + log.duration_minutes, 0);
  const productiveCount = data.filter(log => log.is_productive === 'Yes').length;
  
  const result = {
    summary: {
      totalRecords: data.length,
      totalBandwidth: parseFloat(totalBandwidth.toFixed(2)),
      totalDuration,
      productivityRate: ((productiveCount / data.length) * 100).toFixed(1),
      uniqueUsers: new Set(data.map(log => log.user_id)).size,
      uniqueDepartments: new Set(data.map(log => log.department)).size
    },
    productivityChart,
    categoryChart,
    bandwidthChart,
    deviceChart,
    hourlyChart,
    topUsers,
    rawData: data
  };
  
  console.log('✅ Analysis complete:', result);
  return result;
};