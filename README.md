# Room Service Image Upload App

A full-stack application built with **Node.js**, **Express**, **TypeScript**, **Multer**, and **Cloudinary** for uploading and hosting room images, with a **React + Vite + TypeScript** frontend to showcase image upload and display functionality.

---

## 📌 Features
- Upload room images from the frontend
- Store images directly on **Cloudinary** (no local storage)
- **Multer** for file handling (memory storage)
- Industry-standard folder structure:
  - Config
  - Middleware
  - Controllers
  - Services
  - Routes
- **CORS** enabled for frontend-backend communication
- Environment variables for sensitive credentials
- TypeScript for type safety

---

## 🛠 Tech Stack
**Backend**
- Node.js
- Express
- TypeScript
- Multer
- Cloudinary SDK
- dotenv
- CORS

**Frontend**
- React
- Vite
- TypeScript
- Axios

---

## 📂 Project Structure

```
room-service-app/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Cloudinary config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Multer upload middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── .env                 # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/room-service-app.git
cd room-service-app
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file**
```env
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Run backend (dev mode)**
```bash
npm run dev
```

Backend will start on: `http://localhost:5000`

### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will start on: `http://localhost:5173`

---

## 🚀 Usage

1. Open the frontend in your browser (`http://localhost:5173`)
2. Select an image file and click **Upload**
3. The backend uploads the image to Cloudinary
4. The uploaded image appears on the frontend

---

## 📬 API Endpoint

**POST** `/api/rooms/upload`
- **Body**: `multipart/form-data`
  - `image` (File) – The room image to upload
- **Response**:
```json
{
  "imageUrl": "https://res.cloudinary.com/<cloud_name>/rooms/<image_id>.jpg"
}
```

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

---

## 📝 Scripts

**Backend**
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm start           # Start production server
```

**Frontend**
```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 🛡️ Security Features

- Environment variables for sensitive data
- CORS configuration for secure cross-origin requests
- File type validation for image uploads
- Memory storage (no files saved locally)

---

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Image compression
- [ ] Multiple image upload
- [ ] Room management CRUD operations
- [ ] Image gallery with pagination
- [ ] Drag and drop upload interface

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
