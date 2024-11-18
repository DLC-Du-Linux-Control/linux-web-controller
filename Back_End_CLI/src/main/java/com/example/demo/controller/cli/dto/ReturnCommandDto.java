package com.example.demo.controller.cli.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ReturnCommandDto {
    private List<String> returnCommand;
}
