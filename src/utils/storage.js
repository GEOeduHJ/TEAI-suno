const STORAGE_KEY = 'chatbot-history';

export const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('채팅 저장 중 오류 발생:', error);
  }
};

export const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('채팅 불러오기 중 오류 발생:', error);
    return [];
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('채팅 초기화 중 오류 발생:', error);
  }
};