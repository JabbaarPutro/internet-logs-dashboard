# 🌐 Internet Logs Dashboard

Dashboard analitik interaktif untuk memvisualisasikan dan menganalisis log aktivitas internet karyawan dalam organisasi. Dibangun dengan React + Vite untuk performa optimal dan pengalaman pengguna yang responsif.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

##  Fitur Utama

###  **Visualisasi Data yang Powerful**
- **Activity Heatmap**: Pola aktivitas per jam dan hari dalam seminggu dengan 8 tingkat gradasi warna
- **Top Active Users**: Analisis 15 pengguna teraktif dengan detail IP dan grup
- **Application Categories**: Distribusi kategori aplikasi dengan pie chart interaktif
- **Actions Distribution**: Analisis tindakan (Log/Reject/Allow) dengan bar chart berwarna
- **Behavior Insights**: 4 analisis mendalam (jam kerja, top actions, engagement, peak hours)
- **Activity Timeline**: Tren aktivitas dari waktu ke waktu dengan area chart

###  **Summary Cards**
- Total Activities dengan sparkline trend
- Unique Users tracking
- Rejected Activities monitoring
- Top Category identification

###  **Fitur Interaktif**
- **Time Period Filter**: Pilih periode Hari, Minggu, atau Bulan
- **Click-to-Detail**: Klik elemen chart untuk informasi detail
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Hover Tooltips**: Informasi lengkap saat hover

###  **Import & Export**
- Support **CSV** dan **Excel** (.xlsx, .xls)
- **Auto-detect** format data lama dan baru
- **Drag & Drop** file upload
- **Download Template** dengan 15,000 baris data sample
- Username cleaning otomatis dari format `user(user)`

###  **User Experience**
- **Modern UI** dengan Tailwind CSS
- **Smooth Animations** dan transitions
- **Color-coded** insights untuk kemudahan baca
- **Loading States** yang informatif
- **Error Handling** yang user-friendly

##  Quick Start

```bash
# Clone repository
git clone https://github.com/JabbaarPutro/internet-logs-dashboard.git

# Masuk ke direktori project
cd internet-logs-dashboard

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Server akan berjalan di `http://localhost:5173`

##  Tech Stack

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.15
- **Excel Parser**: XLSX (SheetJS)
- **Language**: JavaScript (ES6+)

##  Format Data

### CSV Format
```csv
Rank;Username;Group Name;Source IP;Endpoint Device;Location;Dst IP;App Category;Application;Action;Time;Details
1;john.doe(john.doe);/namaperusahaan.id/people;172.16.64.35;Mobile device;Not specified;31.13.95.1;NET Protocol;QUIC;Reject;2025-12-09 10:54:01;"Endpoint Details..."
```

### Excel Format
- Mendukung file .xlsx dan .xls
- Auto-detect header row (mencari kolom "Rank", "Username", dll)
- Skip metadata rows otomatis

### Old Format Support
Tetap support format lama dengan delimiter koma.

##  Use Cases

### 1. **IT Security & Monitoring**
- Monitor aktivitas internet karyawan
- Identifikasi pola akses mencurigakan
- Track rejected/blocked activities

### 2. **Productivity Analysis**
- Analisis jam kerja vs non-jam kerja (08:00-16:00)
- User engagement levels
- Peak activity periods

### 3. **Network Management**
- Bandwidth usage per aplikasi
- Top active users identification
- Application category distribution

### 4. **Compliance & Reporting**
- Export data untuk audit
- Historical trend analysis
- User behavior patterns

##  Build untuk Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Hasil build akan ada di folder `dist/` dan siap di-deploy ke:
- Vercel
- Netlify
- GitHub Pages
- Server sendiri (Apache/Nginx)

##  Responsive Design

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Semua chart dan layout otomatis menyesuaikan ukuran layar.

##  Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

##  License

Distributed under the MIT License.


##  Acknowledgments

- [Recharts](https://recharts.org/) - Amazing charting library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [SheetJS](https://sheetjs.com/) - Excel file processing

