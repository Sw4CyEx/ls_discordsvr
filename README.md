# 🎮 Lost Saga Discord Bot

Bot Discord untuk server **Lost Saga** dengan fitur AI chatbot Ruby, sistem verifikasi, daily rewards, gacha, dan berbagai tools admin/moderasi.

## ✨ Fitur Utama

### 🤖 AI Chatbot - Ruby
- **Karakter AI Ruby** dari Oshi no Ko dengan personality yang imut dan responsif
- **Mood Detection** - Ruby merespons dengan emosi yang sesuai
- **Google Gemini AI** integration untuk percakapan natural
- **Bahasa Indonesia** support dengan gaya anime kawaii

### 🎁 Sistem Reward
- **Daily Rewards** - Hadiah harian untuk semua member
- **Booster Rewards** - Hadiah khusus untuk server booster
- **Gacha System** - Koleksi karakter dengan sistem jual-beli
- **Auto Giveaway** - Sistem giveaway otomatis dengan database integration

### 🔐 Verifikasi & Keamanan
- **Account Verification** - Link akun Discord dengan akun game
- **Role Management** - Otomatis memberikan role setelah verifikasi
- **Permission System** - Kontrol akses berdasarkan role dan user ID

### ⚙️ Admin Tools
- **Give Item** - Berikan item langsung ke player
- **Hard Logout** - Paksa logout akun dari website
- **SQL Query** - Jalankan query database langsung
- **Auto Ranking Update** - Update ranking ladder/fwar otomatis

### 🛡️ Moderasi
- **Ban/Kick** - Moderasi member server
- **Mute/Unmute** - Sistem mute dengan durasi
- **Permission Control** - Kontrol akses command

## 🚀 Quick Start

### Prerequisites
- Node.js v16 atau lebih baru
- MSSQL Database
- Discord Bot Token
- Google Gemini API Key

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/Sw4CyEx/ls_discordsvr.git
   cd elaim-saga-bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   
   Atau gunakan batch file:
   ```bash
   install.bat
   ```

3. **Setup Environment Variables**
   
   Buat file `.env` dan isi dengan konfigurasi berikut:
   
   ```env
   # Bot Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_bot_client_id
   GEMINI_API_KEY=your_gemini_api_key
   
   # Database Configuration
   SQL_USER=your_db_username
   SQL_PASSWORD=your_db_password
   SQL_SERVER=your_server:port
   SQL_PORT=1433
   SQL_DATABASE=LosaGame
   
   # Permission Groups
   ALLOWED_USERS=user_id_1,user_id_2
   ALLOWED_STAFF=user_id_1,user_id_2
   ALLOWED_MODERATOR=user_id_1,user_id_2
   ALLOWED_ADMIN_ONLY=true
   ALLOWED_GUILDS=guild_id_1,guild_id_2
   
   # Role IDs
   VerifyLumi=role_id_for_verified_users
   BoostRole=role_id_for_boosters
   
   # Channels and Webhooks
   NOTIFICATION_CHANNEL_ID=channel_id_for_notifications
   WEBHOOK_URL=your_webhook_url
   HARDLOGOUT_WEBHOOK_URL=your_hardlogout_webhook
   GIVEAWAY_WEBHOOK_URL=your_giveaway_webhook
   VIP_WEBHOOK_URL=your_vip_webhook
   ```

4. **Setup Database**
   
   Pastikan database MSSQL sudah running dan buat tabel yang diperlukan:
   
   ```sql
   -- Tabel untuk daily rewards
   CREATE TABLE Ruby_Discord_Daily (
       id INT IDENTITY(1,1) PRIMARY KEY,
       EtcType INT,
       EtcCode VARCHAR(50),
       EtcQty INT,
       date DATE,
       DiscordName VARCHAR(100),
       DiscordID VARCHAR(50)
   );
   
   -- Tabel untuk booster daily rewards
   CREATE TABLE Ruby_Discord_Daily_Boost (
       id INT IDENTITY(1,1) PRIMARY KEY,
       EtcType INT,
       EtcCode VARCHAR(50),
       EtcQty INT,
       date DATE,
       DiscordName VARCHAR(100),
       DiscordID VARCHAR(50)
   );
   
   -- Tabel untuk gacha characters
   CREATE TABLE Characters (
       id INT IDENTITY(1,1) PRIMARY KEY,
       name VARCHAR(100),
       rarity VARCHAR(20),
       image_url VARCHAR(500),
       sell_price INT
   );
   
   -- Tabel untuk user characters
   CREATE TABLE UserCharacters (
       id INT IDENTITY(1,1) PRIMARY KEY,
       user_id VARCHAR(100),
       character_id INT,
       obtained_at DATETIME DEFAULT GETDATE()
   );
   ```

5. **Deploy Commands & Start Bot**
   ```bash
   node deploy-commands.js
   node index.js
   ```
   
   Atau gunakan batch file:
   ```bash
   start.bat
   ```

## 📋 Commands Documentation

### 🎮 Fun Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/aktifdailydiscord` | Tampilkan tombol daily reward | Admin only |
| `/dailyboost` | Tampilkan tombol daily booster | Admin only |
| `/gacha` | Tarik karakter gacha | Semua user |
| `/koleksi` | Lihat koleksi karakter | Semua user |
| `/jual` | Jual karakter untuk PESO | `/jual character_id:123` |
| `/giveaway` | Mulai giveaway | Admin only |

### 🔐 Verification
| Command | Description | Usage |
|---------|-------------|-------|
| `/verif` | Verifikasi akun game | Semua user |

### ⚙️ Admin Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/giveitem` | Berikan item ke player | `/giveitem player:nick type:3 code:1000 qty:5` |
| `/hardlogout` | Paksa logout akun | `/hardlogout nickname:player` |
| `/query` | Jalankan SQL query | `/query sql:SELECT * FROM table` |

### 🛡️ Moderation Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/ban` | Ban user dari server | `/ban target:@user` |
| `/kick` | Kick user dari server | `/kick target:@user` |
| `/mute` | Mute user | `/mute target:@user duration:60` |
| `/unmute` | Unmute user | `/unmute target:@user` |

## 🤖 Ruby AI Features

### Cara Menggunakan
- **Mention Bot**: `@BotName pertanyaan kamu`
- **Auto Response**: Ruby akan merespons dengan personality Hoshino Ruby
- **Mood Detection**: Ruby mendeteksi mood dari pertanyaan dan merespons sesuai

### Mood Types
- **Happy**: Pertanyaan tentang mimpi, idol, semangat
- **Sad**: Pertanyaan tentang kematian, kehilangan
- **Awkward**: Pertanyaan tentang cinta, pacar
- **Angry**: Kata-kata tidak sopan
- **Neutral**: Pertanyaan umum

## 🗄️ Database Schema

### Required Tables
- `userMemberDB` - Data member game
- `userGameDB` - Data game player
- `Ruby_Discord_Daily` - Log daily rewards
- `Ruby_Discord_Daily_Boost` - Log booster rewards
- `Characters` - Data karakter gacha
- `UserCharacters` - Koleksi karakter user

### Required Stored Procedures
- `elaim_saga_giveaway_add` - Menambah item ke mailbox
- `AGENT_RANKING_LADDER_DAILY` - Update ranking ladder
- `AGENT_RANKING_LADDER_DAILYB` - Update ranking battle
- `AGENT_RANKING_LADDER_TITLE` - Update ranking fwar

## 🔧 Configuration

### Permission Levels
1. **ALLOWED_USERS** - Full admin access
2. **ALLOWED_STAFF** - Staff commands
3. **ALLOWED_MODERATOR** - Moderation commands
4. **ALLOWED_GUILDS** - Server whitelist

### Auto Features
- **Ranking Update**: Setiap 60 menit
- **Activity Status**: Update setiap 30 detik
- **Daily Reset**: Otomatis setiap hari

## 🚀 Deployment

### Local Development
```bash
npm install
node deploy-commands.js
node index.js
```

### Production (PM2)
```bash
npm install -g pm2
pm2 start index.js --name "elaim-bot"
pm2 save
pm2 startup
```

### Docker (Optional)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

## 🛠️ Development

### Project Structure
```
├── commands/
│   ├── admin/          # Admin commands
│   ├── fun/            # Fun commands
│   ├── moderation/     # Moderation commands
│   └── verif/          # Verification commands
├── events/             # Discord events
├── utils/              # Utility functions
├── config.js           # Bot configuration
├── index.js            # Main bot file
└── deploy-commands.js  # Command deployment
```

### Adding New Commands
1. Buat file di folder `commands/category/`
2. Export object dengan `data` dan `execute`
3. Restart bot atau deploy ulang commands

### Adding New Features
1. Tambah utility functions di `utils/`
2. Update database schema jika perlu
3. Test di development environment

## 🐛 Troubleshooting

### Common Issues

**Bot tidak merespons commands**
- Pastikan bot sudah invite dengan permission yang cukup
- Check `ALLOWED_GUILDS` di environment variables

**Database connection error**
- Verify database credentials di `.env`
- Pastikan database server accessible
- Check firewall settings

**AI tidak merespons**
- Verify `GEMINI_API_KEY` valid
- Check API quota limits
- Review console logs untuk error details

**Daily rewards tidak bekerja**
- Check database tables exists
- Verify stored procedures
- Check user permissions

## 📝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **Discord Server**: [Join Server](https://discord.gg/zB3rZa7v4g)
- **Website**: [elaim.lostsaga.moe](https://elaim.lostsaga.moe)
- **Issues**: [GitHub Issues](https://github.com/Sw4CyEx/ls_discordsvr/issues)

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Google Gemini AI](https://ai.google.dev/) - AI chatbot integration
- [MSSQL](https://www.microsoft.com/sql-server) - Database system
- Oshi no Ko - Inspiration untuk karakter Ruby

---

**Made with ❤️ for Lost Saga Community**
```
