package com.example.demo.controller.docker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContainerInfoDto {
    private String id;
    private String image;
    private String command;
    private String status;
    private String ports;
    private String names;

    public ContainerInfoDto(String id, String image, String command, String status, String ports, String names) {
        this.id = id;
        this.image = image;
        this.command = command;
        this.status = status;
        this.ports = ports;
        this.names = names;
    }
}
