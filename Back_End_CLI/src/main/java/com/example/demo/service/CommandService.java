package com.example.demo.service;
import com.example.demo.domain.Server;
import com.example.demo.repository.server.ServerRepository;
import com.jcraft.jsch.*;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.SimpleTimeZone;

@Service
public class CommandService {
    private final ServerRepository serverRepository;

    public CommandService(ServerRepository serverRepository) {
        this.serverRepository = serverRepository;
    }
//    private final Session session;
//    private final Server server;
//
//    public CommandService(ServerRepository serverRepository, Session session, Server server) {
//        this.serverRepository = serverRepository;
//        this.session = session;
//        this.server = server;
//    }

//    public void connectServer(String serverName) throws JSchException {
//
//    }

    public List<String> sendCommand(String serverName, String command) throws JSchException, IOException {
        Server server = serverRepository.findByName(serverName).get();

        String host = server.getHost();
        int port = Integer.parseInt(server.getPort());
        String user = server.getUsername();
        String password = server.getPassword();

        JSch jsch = new JSch();
        Session session = jsch.getSession(user, host, port);
        session.setPassword(password);
        Properties config = new Properties();
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);
        session.connect();

        // sudo 비밀번호를 묻는 부분 처리
        Channel exec = session.openChannel("exec");
        ((ChannelExec) exec).setCommand(command);
        InputStream in = exec.getInputStream();
        OutputStream out = exec.getOutputStream();

        exec.connect();

        // sudo 비밀번호 입력 부분
        out.write((server.getPassword() + "\n").getBytes());
        out.flush();

        // 명령 실행 결과를 StringBuilder에 저장
        List<String> output = new ArrayList<String>();
        byte[] tmp = new byte[1024];
        while (true) {
            while (in.available() > 0) {
                int i = in.read(tmp, 0, 1024);
                if (i < 0) break;
                output.add(new String(tmp, 0, i));
            }
            if (exec.isClosed()) {
                break;
            }
            try {
                Thread.sleep(1000);
            } catch (Exception ee) {}
        }
        exec.disconnect();
        session.disconnect();

        return output;
    }

    public List<String> executeCommandWithSudo(String serverName, String command) throws Exception {
        Server server = serverRepository.findByName(serverName).get();

        String host = server.getHost();
        int port = Integer.parseInt(server.getPort());
        String username = server.getUsername();
        String password = server.getPassword();

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
            List<String> result = new ArrayList<>();
            String line;

            channel.connect();

            while ((line = reader.readLine()) != null) {
                result.add(line + "\n");
            }

            return result;

        } finally {
            if (channel != null) channel.disconnect();
            if (session != null) session.disconnect();
        }
    }



}
