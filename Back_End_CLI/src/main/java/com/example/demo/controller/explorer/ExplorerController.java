package com.example.demo.controller.explorer;

import com.example.demo.controller.explorer.dto.FileDto;
import com.example.demo.controller.explorer.dto.FileUploadRequestDto;
import com.example.demo.controller.explorer.dto.LocationDto;
import com.example.demo.controller.explorer.dto.ReturnResultDto;
import com.example.demo.service.CommandService;
import com.example.demo.service.ExplorerService;
import com.jcraft.jsch.JSchException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Objects;

@Controller
public class ExplorerController {
    private final ExplorerService explorerService;

    public ExplorerController(ExplorerService explorerService) {
        this.explorerService = explorerService;
    }

    @PostMapping("/api/files")
    public ResponseEntity<FileDto> fileList(@RequestBody @Valid LocationDto locationDto) throws JSchException, IOException {
        FileDto fileDto = new FileDto();
        fileDto.setFiles(
                explorerService.getFileList(locationDto.getName(), locationDto.getPath()));
        System.out.println(fileDto.getFiles());
        return ResponseEntity.ok()
                .body(fileDto);
    }

    @PostMapping("/api/upload")
    public ResponseEntity<ReturnResultDto> fileUpload(@ModelAttribute FileUploadRequestDto request) {
        ReturnResultDto returnResultDto = new ReturnResultDto();
        // 요청 데이터 확인
        String serverName = request.getName();
        String uploadPath = request.getPath();
        MultipartFile[] files = request.getFiles();

        uploadPath = "H:\\home\\jiho";
        // 서버 이름과 경로 출력 (디버깅용)
        System.out.println("Server Name: " + serverName);
        System.out.println("Upload Path: " + uploadPath);

        if (files == null || files.length == 0) {
            returnResultDto.setSuccess(false);
            returnResultDto.setMessage("No files provided!");
            return ResponseEntity.ok()
                    .body(returnResultDto);
        }

        try {
            // 전체 경로 생성
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs(); // 디렉토리 생성
            }

            // 파일 저장
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    File saveFile = new File(uploadPath, Objects.requireNonNull(file.getOriginalFilename()));
                    file.transferTo(saveFile);
                    System.out.println("Saved File: " + saveFile.getAbsolutePath());
                }
            }
            returnResultDto.setSuccess(true);
            returnResultDto.setMessage("Files uploaded successfully to: " + uploadPath);
            return ResponseEntity.ok()
                    .body(returnResultDto);
        } catch (IOException e) {
            e.printStackTrace();
            returnResultDto.setSuccess(false);
            returnResultDto.setMessage("File upload failed: " + e.getMessage());
            return ResponseEntity.ok()
                    .body(returnResultDto);
        }
    }

    @PostMapping("/api/download")
    public ResponseEntity<?> fileDownload(@RequestBody @Valid LocationDto locationDto) throws JSchException, IOException {

        try {
            // 전체 경로 생성
            String fullPath = locationDto.getPath();
            File file = new File(fullPath);

            // 파일 존재 여부 확인
            if (!file.exists()) {
                return ResponseEntity.status(404).body("File not found: " + fullPath);
            }

            // InputStreamResource로 파일을 읽음
            InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

            // HTTP 응답 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"");

            // Blob 형태로 응답 반환
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error downloading file: " + e.getMessage());
        }
    }
}
