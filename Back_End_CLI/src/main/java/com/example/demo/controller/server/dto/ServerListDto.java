package com.example.demo.controller.server.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ServerListDto {
    private String name;
    private String host;
    private String port;
    private String username;
    private String password;
}
