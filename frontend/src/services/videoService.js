import apiClient from './api';

// Video Services
export const uploadVideo = async (videoUrl) => {
  try {
    const response = await apiClient.post('/videos/upload', {
      video_source: 'url',
      video_url: videoUrl,
      title: videoUrl.split('/').pop() || 'Untitled',
      description: 'Video uploaded via Pause AI',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVideoStatus = async (videoId) => {
  try {
    const response = await apiClient.get(`/videos/${videoId}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await apiClient.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVideoSegments = async (videoId) => {
  try {
    const response = await apiClient.get(`/videos/${videoId}/segments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Doubt/Chat Services
export const askQuestion = async (videoId, question, contextWindow = 5) => {
  try {
    const response = await apiClient.post('/doubts/ask', {
      video_id: videoId,
      question: question,
      context_window: contextWindow,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getChatHistory = async (videoId, limit = 50, offset = 0) => {
  try {
    const response = await apiClient.get(`/videos/${videoId}/chat-history`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search Services
export const searchContent = async (videoId, query, topK = 5) => {
  try {
    const response = await apiClient.post('/search', {
      video_id: videoId,
      query: query,
      top_k: topK,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Health Check
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
