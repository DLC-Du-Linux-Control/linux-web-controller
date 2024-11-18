package com.example.demo.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {
    
    private final WebClient webClient;
    
    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaApiUrl;
    
    @Getter @Setter
    public static class OllamaRequest {
        private String model = "ggmlQ5";
        private String prompt;
        private boolean stream = false;
    }
    
    @Getter @Setter
    public static class OllamaResponse {
        private String response;
        private String model;
        private String created_at;
    }
    
    public String generateResponse(String prompt) {
        OllamaRequest request = new OllamaRequest();
        request.setPrompt(prompt);
        
        try {
            log.info("Sending request to Ollama API: {}", ollamaApiUrl);
            
            return webClient.post()
                .uri(ollamaApiUrl + "/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .map(body -> new RuntimeException("Ollama API 오류: " + body))
                )
                .bodyToMono(OllamaResponse.class)
                .map(OllamaResponse::getResponse)
                .block(Duration.ofSeconds(30));  // 30초 타임아웃 설정
                
        } catch (Exception e) {
            log.error("Error calling Ollama API", e);
            throw new RuntimeException("Ollama API 호출 중 오류 발생: " + e.getMessage());
        }
    }
} 