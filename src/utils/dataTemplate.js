// Template CSV based on actual internet logs format
// Downloads CSV template without metadata rows

function generateLargeCSVTemplate() {
  const firstNames = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko',
    'Kartika', 'Lina', 'Muhammad', 'Novi', 'Okta', 'Putri', 'Qori', 'Rina', 'Siti', 'Tono',
    'Umar', 'Vina', 'Wati', 'Xavier', 'Yuni', 'Zahra', 'Andi', 'Bella', 'Candra', 'Dian',
    'Erlangga', 'Fitri', 'Gilang', 'Hani', 'Irfan', 'Jessica', 'Kevin', 'Laila', 'Maya', 'Nanda',
    'Omar', 'Prita', 'Qomar', 'Rudi', 'Sari', 'Tari', 'Umi', 'Vero', 'Wanda', 'Yoga',
    'Zaki', 'Agus', 'Bambang', 'Cici', 'Doni', 'Eva', 'Fauzi', 'Gina', 'Hasan', 'Ika',
    'Jihan', 'Kurnia', 'Lestari', 'Mamat', 'Nina', 'Oki', 'Pandu', 'Ratna', 'Santi', 'Taufik',
    'Ucok', 'Vera', 'Wawan', 'Yanto', 'Zulfa', 'Amir', 'Bunga', 'Cahya', 'Diana', 'Edi',
    'Fina', 'Gunawan', 'Hilda', 'Imam', 'Jamilah', 'Kusuma', 'Lukman', 'Mira', 'Nurul', 'Oki',
    'Putra', 'Rahma', 'Susilo', 'Tia', 'Udin', 'Vivi', 'Wahyu', 'Yudi', 'Zainab', 'Anton'
  ];
  
  const lastNames = [
    'Pratama', 'Wijaya', 'Santoso', 'Kusuma', 'Permana', 'Saputra', 'Wibowo', 'Nugroho', 'Hidayat', 'Rahman',
    'Setiawan', 'Kurniawan', 'Hartono', 'Gunawan', 'Hakim', 'Firmansyah', 'Sari', 'Putri', 'Maharani', 'Lestari',
    'Purnomo', 'Wahyudi', 'Sutanto', 'Hermawan', 'Pribadi', 'Safitri', 'Widodo', 'Cahyono', 'Mulyadi', 'Ramadhan',
    'Susanto', 'Irawan', 'Utomo', 'Yanto', 'Suryanto', 'Budiman', 'Subagyo', 'Riyanto', 'Maulana', 'Fadilah',
    'Nasution', 'Suryadi', 'Putranto', 'Wicaksono', 'Harahap', 'Siregar', 'Situmorang', 'Lubis', 'Tampubolon', 'Simanjuntak'
  ];
  
  const groupNames = ['/namaperusahaan.id/people', '/CEO', '/Guest', '/Server', '/IT Department', '/Finance', '/HR', '/Marketing', '/Sales'];
  const deviceTypes = ['Mobile device', 'PC', 'Unknown', 'Tablet'];
  const appCategories = ['NET Protocol', 'Visit Web Site', 'SSL Data', 'Social Networking', 'IM', 'Network storage', 'Web Streaming Media', 'Life-Tools', 'P2P Stream Media'];
  const applications = ['QUIC', 'IT Related', 'IT Industry', 'Google_Data', 'Facebook_Messenger', 'WhatsApp', 'Instagram[Browse]', 'YouTube[Video]', 'OneDrive[Browse]', 'Google_Maps', 'Spotify'];
  const actions = ['Log', 'Reject', 'Allow', 'Block'];
  const protocols = ['UDP', 'TCP'];
  const osTypes = ['Android', 'iOS', 'Windows PC', 'Mac PC', 'Linux'];
  
  const lines = ['Rank;Username;Group Name;Source IP;Endpoint Device;Location;Dst IP;App Category;Application;Action;Time;Details'];
  
  const startDate = new Date('2025-12-09 00:00:00');
  
  for (let i = 1; i <= 15000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const fullUsername = `${username}(${username})`;
    
    const groupName = i <= 10000 ? groupNames[0] : groupNames[Math.floor(Math.random() * groupNames.length)];
    const sourceIP = `172.16.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const dstIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const appCategory = appCategories[Math.floor(Math.random() * appCategories.length)];
    const application = applications[Math.floor(Math.random() * applications.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    // Random time within the day
    const randomSeconds = Math.floor(Math.random() * 86400);
    const timestamp = new Date(startDate.getTime() + randomSeconds * 1000);
    const timeStr = timestamp.toISOString().slice(0, 19).replace('T', ' ');
    
    const srcPort = Math.floor(Math.random() * 65535);
    const dstPort = [80, 443, 8080, 3306, 5432, 22, 21, 25][Math.floor(Math.random() * 8)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const osType = osTypes[Math.floor(Math.random() * osTypes.length)];
    const dnsOptions = ['google.com', 'facebook.com', 'instagram.com', 'youtube.com', 'whatsapp.net', 'microsoft.com', 'apple.com', 'cloudflare.com'];
    const dns = dnsOptions[Math.floor(Math.random() * dnsOptions.length)];
    
    const details = `"Endpoint Details : ${deviceType}(${osType})
DNS : ${dns}
Src Port : ${srcPort}
Port : ${dstPort}
Protocol : ${protocol}"`;
    
    const line = `${i};${fullUsername};${groupName};${sourceIP};${deviceType};Not specified;${dstIP};${appCategory};${application};${action};${timeStr};${details}`;
    lines.push(line);
  }
  
  return lines.join('\n');
}

export function downloadCSVTemplate() {
  const csvContent = generateLargeCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'internet_logs_template.csv';
  link.click();
}

export default downloadCSVTemplate;
