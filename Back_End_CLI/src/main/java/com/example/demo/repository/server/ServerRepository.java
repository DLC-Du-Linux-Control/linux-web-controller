package com.example.demo.repository.server;


import com.example.demo.domain.Server;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServerRepository extends JpaRepository<Server, Long> {
    @Override
    Server save(Server server);
    @Override
    Optional<Server> findById(Long id);
    Optional<Server> findByName(String name);
    @Override
    List<Server> findAll();
}
