package controller;

import org.apache.catalina.util.ServerInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import service.ServerInfoService;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
public class ServerInfoController {


    @Autowired
    private ServerInfoService service;

    @GetMapping
    public List<ServerInfo> getServers() {
        return service.getAllServers();
    }

    @PostMapping
    public ServerInfo addServer(@RequestBody ServerInfo serverInfo) {
        return service.addServer(serverInfo);
    }
}
