package ilseok.function.service;

import ilseok.function.repository.ServerInfoRepository;
import org.apache.catalina.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class CommandWebSocketHandler extends TextWebSocketHandler {
    private final SshService sshService;
    private final ServerInfoRepository serverRepository;

    @Autowired
    public CommandWebSocketHandler(SshService sshService, ServerInfoRepository serverRepository) {
        this.sshService = sshService;
        this.serverRepository = serverRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        session.sendMessage(new TextMessage("Connected to CLI!"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String[] payload = message.getPayload().split(";", 2);  // "서버ID;명령어"
        Long serverId = Long.parseLong(payload[0]);
        String command = payload[1];

        // 서버 정보 조회
        Server server = (Server) serverRepository.findById(serverId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid server ID"));

        // 명령어 실행
        String result = sshService.executeCommand(server, command);

        // 결과를 클라이언트로 전송
        session.sendMessage(new TextMessage(result));
    }
}
