package service;

import org.apache.catalina.util.ServerInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repository.ServerInfoRepository;

import java.util.List;

@Service
public class ServerInfoService {
    @Autowired
    private ServerInfoRepository repository;

    public List<ServerInfo> getAllServers() {
        return repository.findAll();
    }

    public ServerInfo addServer(ServerInfo serverInfo) {
        return repository.save(serverInfo);
    }

}
