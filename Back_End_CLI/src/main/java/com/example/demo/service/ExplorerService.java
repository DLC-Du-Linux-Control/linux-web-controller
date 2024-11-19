package com.example.demo.service;

import com.example.demo.domain.File;
import com.example.demo.domain.Server;
import com.example.demo.repository.server.ServerRepository;
import com.jcraft.jsch.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Service
public class ExplorerService {
    private final ServerRepository serverRepository;

    public ExplorerService(ServerRepository serverRepository) {
        this.serverRepository = serverRepository;
    }

    public List<File> getFileList(String name, String path) throws JSchException, IOException {
        List<File> files = new ArrayList<>();

        Server server = serverRepository.findByName(name).get();
        String command = "ls -p "+ path;

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
        byte[] tmp = new byte[1024];
        while (true) {
            while (in.available() > 0) {
                int i = in.read(tmp, 0, 1024);
                if (i < 0) break;

                String[] splitString = (new String(tmp, 0, i).split("\n"));
                for (int j = 0; j < splitString.length; j++) {
                    File file = new File();
                    file.setFileName(splitString[j]);
                    // 파일과 디렉토리 분석 및 구분
                    if(file.getFileName().charAt(file.getFileName().length() - 1) == '/')
                        file.setFileType("directory");
                    else
                        file.setFileType("file");
                    file.setFilePath(path + "/" + file.getFileName());

                    files.add(file);
                }
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

        //return output;

        return files;
    }
}
