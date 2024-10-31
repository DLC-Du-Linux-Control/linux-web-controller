package repository;

import org.apache.catalina.util.ServerInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServerInfoRepository extends JpaRepository<ServerInfo, Long> {
}
