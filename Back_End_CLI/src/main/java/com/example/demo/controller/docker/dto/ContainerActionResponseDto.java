package com.example.demo.controller.docker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContainerActionResponseDto {
    private boolean success;
    private String message;

    public ContainerActionResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
