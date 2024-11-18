package com.example.demo.controller.editor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ResponseDto {
    private boolean success;  // 성공 여부
    private String message;   // 오류 메시지 (선택적)

    public ResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
