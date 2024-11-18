package com.example.demo.controller.editor;

import com.example.demo.controller.editor.dto.FileReadRequestDto;
import com.example.demo.controller.editor.dto.FileWriteRequestDto;
import com.example.demo.controller.editor.dto.ResponseDto;
import com.example.demo.controller.editor.dto.ResponseReadDto;
import com.example.demo.service.CommandService;
import com.jcraft.jsch.JSchException;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
public class EditorController {
    private final CommandService commandService;

    public EditorController(CommandService commandService) {
        this.commandService = commandService;
    }

    @PostMapping("/api/readFile")
    public ResponseReadDto readFile(@RequestBody FileReadRequestDto request) {
        String serverName = request.getName();
        String filePath = request.getPath();

        try {
            // 파일 내용 읽기
            List<String> content = commandService.sendCommand(serverName, "cat "+filePath);

            return new ResponseReadDto(content, true, null);

        } catch (IOException e) {
            return new ResponseReadDto(null, false, "Error reading file: " + e.getMessage());
        } catch (JSchException e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/api/writeFile")
    public ResponseDto writeFile(@RequestBody FileWriteRequestDto request) {
        String serverName = request.getName();
        String filePath = request.getPath();
        List<String> content = request.getContent();

        try {

            // 파일에 내용 쓰기
            commandService.sendCommand(serverName, "echo "+ content.get(0) + " > " + filePath);

            for (int i = 1; i <content.size(); i++) {
                commandService.sendCommand(serverName, "echo "+ content.get(i) + " >> " + filePath);
            }

            return new ResponseDto(true, "File written successfully.");

        } catch (IOException e) {
            return new ResponseDto(false, "Error writing to file: " + e.getMessage());
        } catch (JSchException e) {
            throw new RuntimeException(e);
        }
    }
}
