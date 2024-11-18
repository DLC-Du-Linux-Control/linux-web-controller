package com.example.demo.controller.explorer.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class LocationDto {
    private String name;
    private String path;
}
