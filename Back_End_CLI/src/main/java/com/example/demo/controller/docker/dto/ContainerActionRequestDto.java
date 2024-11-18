package com.example.demo.controller.docker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContainerActionRequestDto {
    private String name;         // 서버 이름
    private String containerId;  // 컨테이너 ID
    private String action;       // 수행 작업 (start, stop, restart)
}
