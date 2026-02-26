# Pause AI - Frontend Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm or yarn package manager
- Backend API running (default: `http://localhost:8000`)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env.local file
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
   echo "VITE_API_TIMEOUT=30000" >> .env.local
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open browser: `http://localhost:5173`

---

## 📋 Available Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎯 Using the Application

### Step 1: Upload a Video

1. Go to home page (`/`)
2. Paste video URL in the upload form
3. Click **Upload Video**
4. Wait for processing to complete (~few seconds to minutes)

**Supported Video Sources**:
- Direct MP4/WebM/MOV links: `https://example.com/video.mp4`
- YouTube videos
- Vimeo videos
- Any CORS-enabled video URL

### Step 2: Watch & Pause

1. Once processing completes, video player becomes interactive
2. Press **Play** to start watching
3. At any point, click **Ask Doubt** ⏸️ button to pause and ask

### Step 3: Ask Your Question

**Option A: Text Input**
- Click the **TEXT** tab in the sidebar
- Type your question (max 500 characters)
- Click **Submit** button

**Option B: Voice Input**
- Click the **VOICE** tab in the sidebar
- Click microphone icon to start recording
- Ask your question clearly
- Click **Stop Recording**
- Review and click **Submit**

### Step 4: Get AI Answer

The system will:
1. Extract context from video around the timestamp
2. Send to RAG + LLM pipeline
3. Generate answer with confidence score
4. List source segments cited

**Response Section Shows**:
- ✅ **Answer**: Full AI-generated response
- 📊 **Confidence**: 0-100% score (high/medium/low)
- ⏱️ **Processing Time**: How long it took to generate
- 🔊 **Audio**: Click to hear AI-generated voice response
- 📚 **Sources**: Video segments used for answer
- 👍 **Feedback**: Mark helpful/not helpful

### Step 5: View Chat History

Click **💬 Chat History** button to see all previous Q&A pairs:
- All questions you've asked
- Corresponding answers
- Timestamps and confidence scores

---

## 🔧 Configuration

### Environment Variables

File: `.env.local`

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000

# Request timeout in milliseconds
VITE_API_TIMEOUT=30000

# Optional: Enable development tools
VITE_ENABLE_DEVTOOLS=true
```

### Backend Connection

If backend is not running locally, update the base URL:

```env
# For deployed backend
VITE_API_BASE_URL=https://api.pauseai.com
```

---

## 🎤 Voice Recording Tips

1. **Browser Permission**: 
   - Allow microphone access when prompted
   - Check browser settings if access is denied

2. **Audio Quality**:
   - Use a quiet environment
   - Speak clearly and at normal pace
   - Avoid background noise

3. **Recording Time**:
   - Keep questions under 30 seconds (optimal)
   - System will process any length
   - Longer recordings take more time to process

---

## 🎨 Component Reference

### Header
- **Logo**: Click to go to home
- **Navigation**: Links to home, docs, about
- **Responsive**: Collapses to mobile menu on small screens

### VideoPlayer
- **Controls**: Play, Pause, Timeline seek
- **Time Display**: Shows current/total duration
- **Ask Doubt Button**: Pauses video and opens doubt capture

### DoubtCapture
- **Text Mode**: Textarea with character counter
- **Voice Mode**: Visual recording indicator with playback
- **Submit**: Validates input before sending

### DoubtResponse
- **Answer Section**: Formatted AI response
- **Confidence Score**: Color-coded (green/yellow/red)
- **Audio Player**: Click to hear generated voice
- **Sources**: Video segments with timestamps
- **Feedback**: Helpful/not helpful voting

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution**:
- Ensure backend is running on port 8000
- Check `.env.local` has correct `VITE_API_BASE_URL`
- Verify backend CORS allows localhost:5173

### Issue: "Microphone access denied"
**Solution**:
- Check browser permissions for this site
- Refresh page and allow permissions again
- Try different browser if issue persists

### Issue: "Video not loading"
**Solution**:
- Verify video URL is accessible
- Check video format is supported (MP4, WebM, etc.)
- Ensure video server has CORS enabled

### Issue: "Processing takes too long"
**Solution**:
- This is normal for first-time processing
- Video is being indexed with semantic embeddings
- Subsequent questions will be faster
- Large videos may take 5-10 minutes

### Issue: "Audio response doesn't play"
**Solution**:
- Check browser volume is not muted
- Verify audio URL is valid in network tab
- Try refreshing the page
- Check browser autoplay policy

---

## 📱 Mobile Usage

The app is fully responsive:

### Portrait Mode
- Video player at top (full width)
- Sidebar sections stacked below
- All controls touch-friendly

### Landscape Mode
- Video player on left
- Sidebar on right
- Optimized for viewing and interaction

**Tips**:
- Tap screen to toggle video controls
- Use full-screen mode for better experience
- Landscape recommended for better layout

---

## 🔐 Data & Privacy

- **Local Storage**: Chat history stored in browser only
- **API Communication**: All requests encrypted (HTTPS in production)
- **Video Data**: Processed on backend, not stored in browser
- **Microphone**: Only accessed during recording with permission

---

## 📚 File Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── services/         # API communication
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.local            # Environment variables
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Deployment

### Build for Production

```bash
# Create optimized build
npm run build

# Output: dist/ folder

# Preview production build
npm run preview
```

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to AWS S3

```bash
# Build
npm run build

# Upload dist folder to S3
aws s3 sync dist s3://your-bucket-name --delete
```

---

## 📊 Performance Metrics

- **Load Time**: < 2 seconds
- **Time Interactive**: < 3 seconds
- **Bundle Size**: ~500KB (gzipped)
- **Video Load**: Depends on video size
- **Processing**: 2-10 minutes for first time (backend)
- **Response Generation**: 2-5 seconds (after processing)

---

## 🤝 Support

### Common Questions

**Q: How long does video processing take?**
A: First time: 5-10 minutes depending on video length. Subsequent questions: 2-5 seconds.

**Q: What video formats are supported?**
A: MP4, WebM, MOV, AVI (any HTML5 video format). Must be URL-accessible.

**Q: Can I ask follow-up questions?**
A: Yes! Each question is independent. Ask as many as needed.

**Q: Is my data private?**
A: Yes. Chat history stored locally. Video processed securely on backend.

**Q: Can I download the answers?**
A: Copy button available for text answers. Audio can be saved from browser.

---

## 📝 Next Steps

1. ✅ Frontend setup complete
2. 📌 Configure backend API URL
3. 🚀 Start development server
4. 🎥 Upload your first video
5. ❓ Ask your first question
6. 🎉 Enjoy AI-powered learning!

---

**For detailed documentation**, see:
- [FRONTEND_IMPLEMENTATION.md](../FRONTEND_IMPLEMENTATION.md) - Architecture & components
- [frontend/README.md](./frontend/README.md) - Frontend-specific docs
- Backend documentation (in backend folder)

**Happy learning with Pause AI! 🎓✨**
