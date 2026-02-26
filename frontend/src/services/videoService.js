import apiClient from './api';

// --- MOCK SERVICE FOR FRONTEND-ONLY SIMULATION ---

const MOCK_DELAY = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Video Services
export const uploadVideo = async (videoUrl) => {
  await MOCK_DELAY(1500);
  return { id: 'mock-video-123', url: videoUrl, title: 'Sample Video' };
};

export const getVideoStatus = async (videoId) => {
  await MOCK_DELAY(500);
  // Simulating immediate readiness for frontend demo
  return { status: 'completed' };
};

export const getVideoDetails = async (videoId) => {
  await MOCK_DELAY(500);

  // To support dynamic URLs directly from the Home page state or local storage 
  // we check if it looks like a URL. Otherwise fallback.
  const isUrl = videoId.startsWith('http') || videoId.startsWith('www');

  return {
    id: videoId,
    title: isUrl ? 'Dynamic Video Upload' : 'Pause AI Interactive Demo Video',
    video_url: isUrl ? videoId : 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };
};

export const getVideoSegments = async (videoId) => {
  await MOCK_DELAY(500);
  return { segments: [] };
};

// Doubt/Chat Services
export const askQuestion = async (videoId, question, contextWindow = 5) => {
  // Simulate the whole RAG pipeline delay
  await MOCK_DELAY(3000);

  // Return a mock response with simulated pipeline data
  return {
    answer: `[Simulated AI Mock] Based on the context at this timestamp, here is the explanation for your doubt: "${question}".\n\nThe mock video context confirms that this concept is essential for modern applications. The visual frames show a diagram explaining the architecture, and the narrator explicitly mentions the importance of this topic. This allows systems to be highly resilient and dynamic.`,
    confidence: 0.95,
    processing_time: 2.8,
    // We mock the source context that the AI supposedly extracted
    sources: [
      { type: 'transcript', content: '...and as you can see, this mechanism...', timestamp: 125 },
      { type: 'ocr', content: '[Detected text in frame]: SYSTEM ARCHITECTURE OVERVIEW', timestamp: 125 }
    ]
  };
};

export const getChatHistory = async (videoId, limit = 50, offset = 0) => {
  await MOCK_DELAY(500);
  return { chats: [] };
};

// Search Services
export const searchContent = async (videoId, query, topK = 5) => {
  await MOCK_DELAY(1000);
  return { results: [] };
};

// Health Check
export const checkHealth = async () => {
  return { status: 'ok' };
};
