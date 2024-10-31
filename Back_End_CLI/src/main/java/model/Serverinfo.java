package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Serverinfo {  // 클래스 이름은 일반적으로 PascalCase로 작성합니다.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idxServer;

    private String serverName;
    private static String serverIp;  // 변수 이름을 camelCase로 수정했습니다.
    private static int serverPort;

    // Getters and Setters
    public Long getIdxServer() {
        return idxServer;
    }

    public void setIdxServer(Long idxServer) {
        this.idxServer = idxServer;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public static String getServerIp() {  // getter 메서드 이름도 일관성 있게 수정했습니다.
        return serverIp;
    }

    public void setServerIp(String serverIp) {
        this.serverIp = serverIp;  // setter 메서드에서도 변수 이름을 일관성 있게 수정했습니다.
    }

    public static int getServerPort() {
        return serverPort;
    }

    public void setServerPort(int serverPort) {
        this.serverPort = serverPort;
    }
}
