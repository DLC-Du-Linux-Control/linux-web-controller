package com.example.demo.controller;

import com.example.demo.service.OllamaService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final OllamaService ollamaService;

    // DTO 클래스들
    @Getter @Setter
    public static class ChatRequest {
        private String message;
    }

    @Getter @Setter
    public static class ChatResponse {
        private String answer;
        private boolean success;
        private String message;

        // 성공 응답 생성
        public static ChatResponse success(String answer) {
            ChatResponse response = new ChatResponse();
            response.setSuccess(true);
            response.setAnswer(answer);
            return response;
        }

        // 실패 응답 생성
        public static ChatResponse error(String message) {
            ChatResponse response = new ChatResponse();
            response.setSuccess(false);
            response.setMessage(message);
            return response;
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody @Valid ChatRequest request) {
        try {
            log.info("Received chat request: {}", request.getMessage());
            
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity
                    .badRequest()
                    .body(ChatResponse.error("메시지가 비어있습니다."));
            }

            String aiResponse = ollamaService.generateResponse(request.getMessage());
            log.info("Generated AI response successfully");
            
            return ResponseEntity.ok()
                    .body(ChatResponse.success(aiResponse));
            
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ChatResponse.error("AI 서비스 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // ... DTO 클래스들은 이전과 동일 ...
} 