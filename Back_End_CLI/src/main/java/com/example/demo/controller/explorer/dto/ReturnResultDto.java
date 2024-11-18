package com.example.demo.controller.explorer.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ReturnResultDto {
    Boolean success;
    String message;
}
