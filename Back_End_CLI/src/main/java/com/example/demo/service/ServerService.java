package com.example.demo.service;

import com.example.demo.controller.server.dto.ServerListDto;
import com.example.demo.domain.Server;
import com.example.demo.repository.server.ServerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
public class ServerService {
    private final ServerRepository serverRepository;

    public ServerService(ServerRepository serverRepository) {
        this.serverRepository = serverRepository;
    }

    // 목록 조회
    public List<Server> findservers() {
        return serverRepository.findAll();
    }

    // 서버 추가
    public Server addServer(Server server) {
        //같은 이름이 있는 중복 회원 X

        validateDuplicateMember(server);

        server = serverRepository.save(server);

        return server;
    }

    private void validateDuplicateMember(Server server) {
        serverRepository.findByName(server.getName())
                .ifPresent(m -> {
                    throw new IllegalStateException("이미 존재하는 서버입니다.");
                });
    }

    // 서버 삭제
    public Boolean delServer(Long serverId){
        if (serverRepository.findById(serverId).isPresent()){
            serverRepository.deleteById(serverId);

            if(serverRepository.findById(serverId).isEmpty()){
                System.out.print("정상적으로 삭제되었습니다.");
                return true;
            }
            return false;
        }
        return false;
    }

    public Optional<Server> findOne(Long serverId) {
        return serverRepository.findById(serverId);
    }

    public Optional<Server> findOne(String serverName) {
        return serverRepository.findByName(serverName);
    }
}
