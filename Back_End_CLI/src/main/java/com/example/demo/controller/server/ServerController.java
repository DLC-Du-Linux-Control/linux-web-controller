package com.example.demo.controller.server;

import com.example.demo.controller.server.dto.MessageDto;
import com.example.demo.controller.server.dto.ServerIdDto;
import com.example.demo.controller.server.dto.ServerListDto;
import com.example.demo.domain.Server;
import com.example.demo.service.ServerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
public class ServerController {
    private final ServerService serverService;

    public ServerController(ServerService serverService){
        this.serverService = serverService;
    }

//    @GetMapping("/api/servers")
//    public ResponseEntity<List<Server>> serverList(@RequestBody @Valid ServerListDto ServerListDto){
//        List<Server> serverList = serverService.findservers();
//        return ResponseEntity.ok()
//                .body(serverList);
//    }

    @GetMapping("/api/servers")
    public ResponseEntity<List<Server>> serverList(){
        return ResponseEntity.ok()
                .body(serverService.findservers());
    }

    @PostMapping("/api/servers/add")
    public ResponseEntity<Optional<Server>> serverAdd(@RequestBody @Valid ServerListDto serverListDto){

        Server server = new Server();
        server.setName(serverListDto.getName());
        server.setHost(serverListDto.getHost());
        server.setPort(serverListDto.getPort());
        server.setUsername(serverListDto.getUsername());
        System.out.println(serverListDto.getUsername());
        server.setPassword(serverListDto.getPassword());

        server = serverService.addServer(server);
        return ResponseEntity.ok()
                .body(serverService.findOne(server.getId()));
    }

    @PostMapping("/api/servers/delete")
    public ResponseEntity<MessageDto> serverDel(@RequestBody @Valid ServerIdDto serverId){
        MessageDto messageDto = new MessageDto();
        boolean ans = serverService.delServer(serverId.getId());
        if(ans)
            messageDto.setMessage("Success");
        else
            messageDto.setMessage("Fail");
        return ResponseEntity.ok().body(messageDto);
    }
}
