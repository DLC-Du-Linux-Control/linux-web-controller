package com.example.demo.controller.editor.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileReadRequestDto {
    private String name; // 서버 이름
    private String path; // 파일 경로
}
