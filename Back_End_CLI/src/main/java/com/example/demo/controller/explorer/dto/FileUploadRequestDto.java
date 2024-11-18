package com.example.demo.controller.explorer.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class FileUploadRequestDto {
    private String name; // 서버 이름
    private String path; // 업로드 경로
    private MultipartFile[] files; // 업로드할 파일 배열
}
