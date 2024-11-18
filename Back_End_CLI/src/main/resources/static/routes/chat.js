const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: '메시지가 비어있습니다.'
            });
        }

        // Ollama API 호출
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "ggmlQ5",
                prompt: message,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Ollama API 호출 실패');
        }

        const data = await response.json();
        
        res.json({
            success: true,
            answer: data.response
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'AI 응답 생성 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 