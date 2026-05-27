# ChatDVT - Advanced AI Discord Bot & Web Portal 🤖✨

**ChatDVT** là hệ thống Discord Bot đa chức năng thế hệ mới tích hợp **Google Gemini AI**, đi kèm **Web Portal** quản trị trực quan. Dự án kết hợp giữa Backend Node.js (Discord Bot) và Web Dashboard ReactJS hiện đại.

---

## 🔗 Hướng Dẫn Sử Dụng Nhanh

### 1. Mời Bot Vào Server Discord
Nhấp vào liên kết dưới đây để mời Bot tham gia máy chủ của bạn với đầy đủ quyền:
- [Mời ChatDVT tham gia Server](https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot)

### 2. Các Lệnh Cơ Bản Trên Discord
- `@ChatDVT [nội dung tin nhắn]`: Nhắc tên Bot để trò chuyện trực tiếp (hỗ trợ đính kèm hình ảnh để phân tích).
- `/ping`: Kiểm tra độ trễ phản hồi của Bot.
- `/setting`: Mở nhanh bảng điều khiển cấu hình Bot trực tiếp trong Discord (dành cho Admin).

---

## 🚀 Các Tính Năng Chính

- **Trò chuyện với AI (Gemini Flash)**: Trò chuyện tự nhiên, ghi nhớ ngữ cảnh hội thoại của từng người dùng và phân tích hình ảnh.
- **Game & Giải trí**: Hệ thống nuôi Pet, Tu Tiên RPG text-based, mini-game như Sentence Scramble, Word Sprint, Spelling Bee.
- **Tiện ích tâm linh**: Bói bài Tarot AI, Thần số học AI, Tử vi và Cầu pha lê tiên tri.
- **Web Dashboard**: Trang quản trị trực quan điều khiển máy chủ, gửi tin nhắn/Rich Embed từ Web, cấu hình System Prompt và quản lý API Key độc lập cho từng Server (BYOK).

---

## 🛠 Hướng Dẫn Cài Đặt (Self-Hosting)

### Yêu cầu hệ thống
- Node.js >= 16.9.0
- SQLite (mặc định) hoặc PostgreSQL

### Bước 1: Cài đặt Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của dự án với nội dung:
```env
DISCORD_TOKEN="YOUR_DISCORD_BOT_TOKEN"
CLIENT_ID="YOUR_DISCORD_APPLICATION_CLIENT_ID"
DATABASE_URL="file:./dev.db"
JWT_SECRET="YOUR_JWT_SECRET"
ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
PORT=3000
GEMINI_API_KEY="YOUR_GLOBAL_GEMINI_KEY"
```

### Bước 3: Thiết lập Database
```bash
npx prisma generate
npx prisma db push
```

### Bước 4: Khởi chạy dự án
```bash
npm run build
npm run start
```
Truy cập Web Dashboard tại địa chỉ: `http://localhost:3000`.

---

**Developed by tienDang0805** 🚀
