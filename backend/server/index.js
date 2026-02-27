require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Video = require('./models/Video');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up static serving for the uploads folder
// Now hitting http://localhost:3001/uploads/filename.mp4 will play the file
app.use('/uploads', express.static(uploadDir));

// Multer Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique name to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/api/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        // Determine absolute playback URL based on the host
        const videoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

        // Save metadata to MongoDB
        const newVideo = new Video({
            originalName: req.file.originalname,
            filename: req.file.filename,
            videoUrl: videoUrl
        });

        await newVideo.save();

        console.log(`Video uploaded and saved to DB: ${req.file.filename}`);

        // Return the URL and standard info expected by the frontend mock
        res.json({
            success: true,
            video_id: newVideo._id, // Use MongoDB ID
            video_url: videoUrl,
            title: req.file.originalname,
            message: 'Video uploaded and saved to MongoDB'
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Pause AI Video Upload Server running' });
});

// Get all uploaded videos
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ uploadDate: -1 });
        res.json(videos);
    } catch (err) {
        console.error('Error fetching videos:', err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Upload Server running on http://localhost:${PORT}`);
});
