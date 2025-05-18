// src/components/ChatBot/ChatBot.js
import React, { useEffect, useRef } from 'react';
import { Groq } from 'groq-sdk';
import './ChatBot.css';
import { saveChatHistory, loadChatHistory } from '../../utils/storage';

const ChatBot = () => {
  // 환경변수에서 API 키 가져오기
  const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

  // API 키가 없을 경우 에러 처리
  if (!API_KEY) {
    console.error('GROQ API 키가 설정되지 않았습니다.');
  }

  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const messagesEndRef = useRef(null);
// messages 배열이 변경될 때마다 스크롤 내리기
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // messages는 채팅 메시지 배열
  

  // 수정: 컴포넌트 마운트 시 저장된 채팅 기록 불러오는 useEffect 추가
  useEffect(() => {
    const savedMessages = loadChatHistory();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // 수정: 메시지 변경될 때마다 저장하는 useEffect 추가
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const handleSubmit = async (e) => {
    if (!inputText.trim()) return;

    

    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // API 키가 없는 경우 에러 처리
      if (!API_KEY) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }

       // 수정: system message 추가
       const systemMessage = {
        role: "system",
        content: "You are a highly skilled conversational AI. Always respond to users politely and reply in a formal/polite style of speech (jondaemal). Provides responses that resonate with the sentiments of the South Korean people. and you must answer in korean."
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: "gemma2-9b-it",
          temperature: 0.7,
          max_tokens: 8192,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {  // 여기에 선언되어야 함
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <button 
          className="clear-button"
          onClick={() => {
            setMessages([]);
            localStorage.removeItem('chatHistory');
          }}
        >
          대화내용 지우기
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {formatMessage(message.content)}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* 여기! */}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          rows="3"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
          className="chat-input textarea"
        />

        
        <button 
        type="submit" 
        classname="send-button"
        onClick={handleSubmit}
        disabled={isLoading}>
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;