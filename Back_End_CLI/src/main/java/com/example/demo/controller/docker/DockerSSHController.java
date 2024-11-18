package com.example.demo.controller.docker;

import com.example.demo.controller.docker.dto.*;
import com.example.demo.domain.Server;
import com.example.demo.service.ServerService;
import com.example.demo.service.utils.SSHClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/containers")
public class DockerSSHController {
    private final ServerService serverService;

    public DockerSSHController(ServerService serverService) {
        this.serverService = serverService;
    }


    // 1. 컨테이너 목록 조회
    @PostMapping("/list")
    public ResponseEntity<ContainerListResponseDto> listContainers(@RequestBody ContainerListRequestDto request) {

        Server server = serverService.findOne(request.getName()).get();

        // SSH 연결 설정
        String HOST = server.getHost();
        int PORT = Integer.parseInt(server.getPort());
        String USERNAME = server.getUsername();
        String PASSWORD = server.getPassword();

        try {
            SSHClient sshClient = new SSHClient(HOST, PORT, USERNAME, PASSWORD);
            String command = "docker ps -a --format \"{{.ID}}|{{.Image}}|{{.Command}}|{{.Status}}|{{.Ports}}|{{.Names}}\"";
            String result = sshClient.executeCommandWithSudo(command);

            System.out.println(result);

            List<ContainerInfoDto> containerInfos = new ArrayList<>();
            String[] lines = result.split("\n");
            for (String line : lines) {
                String[] parts = line.split("\\|");
                if (parts.length == 6) {
                    containerInfos.add(new ContainerInfoDto(
                            parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]
                    ));
                }
            }

            return ResponseEntity.ok()
                    .body(new ContainerListResponseDto(containerInfos, true, null));

        } catch (Exception e) {
            return ResponseEntity.ok()
                    .body(new ContainerListResponseDto(null, false,
                            "Error fetching containers: " + e.getMessage()));
        }
    }

    // 2. 컨테이너 제어
    @PostMapping("/action")
    public ResponseEntity<ContainerActionResponseDto> controlContainer(@RequestBody ContainerActionRequestDto request) {

        Server server = serverService.findOne(request.getName()).get();

        // SSH 연결 설정
        String HOST = server.getHost();
        int PORT = Integer.parseInt(server.getPort());
        String USERNAME = server.getUsername();
        String PASSWORD = server.getPassword();

        try {
            SSHClient sshClient = new SSHClient(HOST, PORT, USERNAME, PASSWORD);
            String action = request.getAction();
            String containerId = request.getContainerId();

            String command;
            switch (action.toLowerCase()) {
                case "start":
                    command = "docker start " + containerId;
                    break;
                case "stop":
                    command = "docker stop " + containerId;
                    break;
                case "restart":
                    command = "docker restart " + containerId;
                    break;
                default:
                    return ResponseEntity.ok()
                            .body(new ContainerActionResponseDto(false, "Invalid action: " + action));
            }

            sshClient.executeCommandWithSudo(command);
            return ResponseEntity.ok()
                    .body(new ContainerActionResponseDto(true, "Container " + action + " successfully."));

        } catch (Exception e) {
            return ResponseEntity.ok()
                    .body(new ContainerActionResponseDto(false, "Error controlling container: " + e.getMessage()));
        }
    }
}

