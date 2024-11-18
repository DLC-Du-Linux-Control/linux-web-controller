package com.example.demo.controller.dockerCompose;

import com.example.demo.domain.Server;
import com.example.demo.service.CommandService;
import com.example.demo.service.ServerService;
import com.example.demo.service.utils.SSHClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compose")
@RequiredArgsConstructor
public class ComposeController {

    private final ServerService serverService;
    private final CommandService commandService;

    // 1. Read File
    @PostMapping("/readFile")
    public ResponseEntity<?> readFile(@RequestBody Map<String, String> request) {
        String serverName = request.get("name");
        String filePath = request.get("path");

        try {
            List<String> content = commandService.executeCommandWithSudo(serverName,"sudo cat " + filePath);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "content", content
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error reading file: " + e.getMessage()
            ));
        }
    }

    // 2. Write File
    @PostMapping("/writeFile")
    public ResponseEntity<?> writeFile(@RequestBody Map<String, Object> request) {

        String serverName = (String) request.get("name");
        String filePath = (String) request.get("path");
        List<String> content = (List<String>) request.get("content");

        try {
            StringBuilder command = new StringBuilder("sudo bash -c 'echo \"");
            for (String line : content) {
                command.append(line.replace("\"", "\\\"")).append("\\n");
            }
            command.append("\" > ").append(filePath).append("'");

            commandService.executeCommandWithSudo(serverName, command.toString());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "File written successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error writing file: " + e.getMessage()
            ));
        }
    }

    // 3. Docker Compose Up
    @PostMapping("/up")
    public ResponseEntity<?> composeUp(@RequestBody Map<String, String> request) {
        String serverName = request.get("name");
        String filePath = request.get("path");

        try {
            List<String> output = commandService.executeCommandWithSudo(serverName, "sudo docker-compose -f " + filePath + " up -d");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "docker-compose up executed successfully",
                    "output", String.join("\n", output)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error executing docker-compose up: " + e.getMessage()
            ));
        }
    }

    // 4. Docker Compose Down
    @PostMapping("/down")
    public ResponseEntity<?> composeDown(@RequestBody Map<String, String> request) {
        String serverName = request.get("name");
        String filePath = request.get("path");

        try {
            List<String> output = commandService.executeCommandWithSudo(serverName, "sudo docker-compose -f " + filePath + " down");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "docker-compose down executed successfully",
                    "output", String.join("\n", output)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error executing docker-compose down: " + e.getMessage()
            ));
        }
    }
}

