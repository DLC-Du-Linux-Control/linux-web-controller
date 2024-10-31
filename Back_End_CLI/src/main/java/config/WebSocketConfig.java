package config;


import handler.CommandWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;

@Configuration
@EnableWebSocketSecurity
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final CommandWebSocketHandler commandWebSocketHandler;

    public WebSocketConfig(CommandWebSocketHandler commandWebSocketHandler) {
        this.commandWebSocketHandler = commandWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(commandWebSocketHandler, "/ws/command").setAllowedOrigins("*");
    }
}
