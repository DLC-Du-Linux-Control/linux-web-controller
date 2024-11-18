package com.example.demo.controller.cli;

import com.example.demo.controller.cli.dto.CommandDto;
import com.example.demo.controller.cli.dto.ReturnCommandDto;
import com.example.demo.service.CommandService;
import com.example.demo.service.ServerService;
import com.jcraft.jsch.JSchException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;

@Controller
public class CliController {
    private final CommandService commandService;

    public CliController(CommandService commandService){
        this.commandService = commandService;
    }

    @PostMapping("/api/command")
    public ResponseEntity<ReturnCommandDto> sendCommand(@RequestBody @Valid CommandDto commandDto) throws JSchException, IOException {
        ReturnCommandDto returnCommandDto = new ReturnCommandDto();
        returnCommandDto.setReturnCommand(
                commandService.sendCommand(commandDto.getName(), commandDto.getCommand()));
        return ResponseEntity.ok()
                .body(returnCommandDto);
    }
}
