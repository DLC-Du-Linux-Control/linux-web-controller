/**
 * AI Chat Component
 * 
 * API Endpoints:
 * 1. POST /api/chat
 *    Description: AI에게 질문을 전송하고 답변을 받음
 *    Request: {
 *      message: string    // 사용자 질문
 *    }
 *    Response: {
 *      answer: string,    // AI 답변
 *      success: boolean,  // 성공 여부
 *      message?: string   // 오류 메시지 (실패 시)
 *    }
 */

export default class Chat {
    constructor() {
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-chat');
        this.chatScreen = document.getElementById('chat-screen');
        this.clearButton = document.getElementById('clear-chat');
        
        if (!this.chatInput || !this.sendButton || !this.chatScreen || !this.clearButton) {
            console.error('Chat elements not found');
            return;
        }
        
        this.init();
        this.addWelcomeMessage();
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.clearButton.addEventListener('click', () => this.clearChat());
        
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 텍스트 영역 자동 크기 조절
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 150) + 'px';
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'ai',
            content: '안녕하세요! 저는 AI 채팅 도우미입니다. 무엇을 도와드릴까요?'
        };
        this.appendMessage(welcomeMessage);
    }

    clearChat() {
        if (confirm('대화 내용을 모두 지우시겠습니까?')) {
            this.chatScreen.innerHTML = '';
            this.addWelcomeMessage();
        }
    }

    appendMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = message.type === 'user' ? '사용자' : 'AI 도우미';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        this.chatScreen.appendChild(messageDiv);
        
        this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.appendMessage({
            type: 'user',
            content: message
        });

        this.chatInput.value = '';
        this.chatInput.style.height = '45px';
        this.chatInput.focus();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '메시지 전송 실패');
            }

            if (!data.success) {
                throw new Error(data.message || 'AI 응답 실패');
            }

            this.appendMessage({
                type: 'ai',
                content: data.answer
            });

        } catch (error) {
            console.error('Error details:', error);
            this.appendMessage({
                type: 'ai',
                content: `죄송합니다. 오류가 발생했습니다: ${error.message}`
            });
        }
    }
} 