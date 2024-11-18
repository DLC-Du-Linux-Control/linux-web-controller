package com.example.demo.controller.explorer.dto;

import com.example.demo.domain.File;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class FileDto {
    private List<File> files;
}
