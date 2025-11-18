// Utility to generate a sample CSV template for internet logs
// Exports: generateCSVTemplate(count) -> string (CSV)

function pad(n) {
  return n.toString().padStart(2, '0');
}

export function generateCSVTemplate(count = 200) {
  const headers = [
    'timestamp',
    'user_id',
    'ip_address',
    'department',
    'website',
    'category',
    'duration_minutes',
    'bandwidth_mb',
    'device_type',
    'is_productive'
  ];

  const departments = ['HR', 'Finance', 'IT', 'Sales', 'Marketing', 'Operations'];
  const websites = ['example.com', 'google.com', 'youtube.com', 'github.com', 'facebook.com', 'linkedin.com', 'netflix.com'];
  const categories = ['Productivity', 'Entertainment', 'Social Media', 'Search Engine', 'Development', 'Streaming'];
  const deviceTypes = ['Desktop', 'Laptop', 'Mobile', 'Tablet'];

  const lines = [];
  lines.push(headers.join(','));

  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Spread timestamps over the past 14 days (2 weeks) up to now
    const minutesAgo = Math.floor(Math.random() * 14 * 24 * 60);
    const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const user_id = `user${(i % 50) + 1}`; // 50 distinct users
    const ip_address = `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const department = departments[i % departments.length];
    const website = websites[i % websites.length];
    const category = categories[i % categories.length];
    const duration_minutes = Math.floor(Math.random() * 60) + 1;
    const bandwidth_mb = (Math.random() * 50 + 0.1).toFixed(2);
    const device_type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const is_productive = Math.random() > 0.5 ? 'Yes' : 'No';

    // Escape double quotes by doubling them and wrap each field with quotes
    const row = [timestamp, user_id, ip_address, department, website, category, duration_minutes, bandwidth_mb, device_type, is_productive]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');

    lines.push(row);
  }

  return lines.join('\n');
}

export default generateCSVTemplate;
