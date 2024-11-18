package com.example.demo.controller.docker.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ContainerListResponseDto {
    private List<ContainerInfoDto> containers;
    private boolean success;
    private String message;

    public ContainerListResponseDto(List<ContainerInfoDto> containers, boolean success, String message) {
        this.containers = containers;
        this.success = success;
        this.message = message;
    }
}
