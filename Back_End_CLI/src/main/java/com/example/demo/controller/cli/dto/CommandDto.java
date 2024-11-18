package com.example.demo.controller.cli.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class CommandDto {
    private String Name;
    private String command;
}
