package com.example.demo.service.utils;

import com.jcraft.jsch.*;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

public class SSHClient {

    private String host;
    private int port;
    private String username;
    private String password;

    public SSHClient(String host, int port, String username, String password) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    public String executeCommandWithSudo(String command) throws Exception {
        JSch jsch = new JSch();
        Session session = null;
        ChannelExec channel = null;

        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(password);

            // 호스트 키 검증 비활성화
            session.setConfig("StrictHostKeyChecking", "no");
            session.connect();

            // Sudo 명령 실행
            String sudoCommand = "echo '" + password + "' | sudo -S " + command;

            channel = (ChannelExec) session.openChannel("exec");
            channel.setCommand(sudoCommand);
            channel.setInputStream(null);
            channel.setErrStream(System.err);

            BufferedReader reader = new BufferedReader(new InputStreamReader(channel.getInputStream()));
            StringBuilder result = new StringBuilder();
            String line;

            channel.connect();

            while ((line = reader.readLine()) != null) {
                result.append(line).append("\n");
            }

            return result.toString().trim();

        } finally {
            if (channel != null) channel.disconnect();
            if (session != null) session.disconnect();
        }
    }

    public String executeCommand(String command) throws Exception {
        JSch jsch = new JSch();
        Session session = null;
        ChannelExec channel = null;

        try {
            session = jsch.getSession(username, host, port);
            session.setPassword(password);

            // 호스트 키 검증 비활성화
            session.setConfig("StrictHostKeyChecking", "no");
            session.connect();

            // 명령 실행
            channel = (ChannelExec) session.openChannel("exec");
            channel.setCommand(command);
            channel.setInputStream(null);
            channel.setErrStream(System.err);

            BufferedReader reader = new BufferedReader(new InputStreamReader(channel.getInputStream()));
            StringBuilder result = new StringBuilder();
            String line;

            channel.connect();

            while ((line = reader.readLine()) != null) {
                result.append(line).append("\n");
            }

            return result.toString().trim();

        } finally {
            if (channel != null) channel.disconnect();
            if (session != null) session.disconnect();
        }
    }
}

