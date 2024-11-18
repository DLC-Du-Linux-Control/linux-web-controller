package com.example.demo.controller.editor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FileWriteRequestDto {
    private String name;    // 서버 이름
    private String path;    // 파일 경로
    private List<String> content; // 저장할 내용 (줄 단위 배열)
}
