package com.example.demo.controller.editor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ResponseReadDto {
        private List<String> content;   // 파일 내용
        private boolean success;  // 성공 여부
        private String message;   // 오류 메시지 (선택적)

        // 생성자
        public ResponseReadDto(List<String> content, boolean success, String message) {
            this.content = content;
            this.success = success;
            this.message = message;
        }
}
