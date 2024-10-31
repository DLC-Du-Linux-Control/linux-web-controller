package ilseok.function.service;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;
import org.apache.catalina.Server;

import java.io.InputStream;

public class SshService {

    public String executeCommand(Server Serverinfo, String command) throws Exception {
        JSch jsch = new JSch();
        Session session = jsch.getSession("username", ilseok.function.repository.Serverinfo.getServerIp(), Integer.parseInt(String.valueOf(ilseok.function.repository.Serverinfo.getServerPort())));
        session.setPassword("password");  // 이 부분은 보안 필요

        java.util.Properties config = new java.util.Properties();
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);

        session.connect();

        Channel channel = session.openChannel("exec");
        ((ChannelExec) channel).setCommand(command);

        InputStream in = channel.getInputStream();
        channel.connect();

        StringBuilder outputBuffer = new StringBuilder();
        byte[] tmp = new byte[1024];
        while (true) {
            while (in.available() > 0) {
                int i = in.read(tmp, 0, 1024);
                if (i < 0) break;
                outputBuffer.append(new String(tmp, 0, i));
            }
            if (channel.isClosed()) {
                if (in.available() > 0) continue;
                break;
            }
            Thread.sleep(1000);
        }

        channel.disconnect();
        session.disconnect();

        return outputBuffer.toString();
    }
}
