/**
 * Docker Container List Component
 * 
 * API Endpoints:
 * 1. POST /api/containers/list
 *    Description: 도커 컨테이너 목록 조회
 *    Request: {
 *      name: string    // 서버 이름
 *    }
 *    Response: {
 *      containers: [{
 *        id: string,           // 컨테이너 ID
 *        image: string,        // 이미지 이름
 *        command: string,      // 실행 명령어
 *        status: string,       // 상태
 *        ports: string,        // 포트 매핑
 *        names: string         // 컨테이너 이름
 *      }],
 *      success: boolean,
 *      message?: string
 *    }
 * 
 * 2. POST /api/containers/action
 *    Description: 컨테이너 제어 (시작/정지/재시작)
 *    Request: {
 *      name: string,     // 서버 이름
 *      containerId: string,  // 컨테이너 ID
 *      action: 'start' | 'stop' | 'restart'  // 수행할 작업
 *    }
 *    Response: {
 *      success: boolean,
 *      message: string
 *    }
 */

export default class Container {
    constructor() {
        this.containerList = document.getElementById('container-list');
        this.refreshButton = document.getElementById('refresh-containers');
        
        if (!this.containerList || !this.refreshButton) {
            console.error('Container elements not found');
            return;
        }
        
        this.init();
        this.loadContainers();
    }

    init() {
        this.refreshButton.addEventListener('click', () => this.loadContainers());
    }

    async loadContainers() {
        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            const response = await fetch('/api/containers/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: serverName
                })
            });

            if (!response.ok) {
                throw new Error('컨테이너 목록을 불러올 수 없습니다.');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || '컨테이너 목록 조회 실패');
            }

            this.renderContainers(data.containers);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async containerAction(containerId, action) {
        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            const response = await fetch('/api/containers/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: serverName,
                    containerId,
                    action
                })
            });

            if (!response.ok) {
                throw new Error('컨테이너 작업을 수행할 수 없습니다.');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || '컨테이너 작업 실패');
            }

            // 작업 성공 후 목록 새로고침
            await this.loadContainers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    renderContainers(containers) {
        if (!Array.isArray(containers)) {
            console.error('Invalid containers data:', containers);
            return;
        }

        this.containerList.innerHTML = containers.map(container => `
            <tr>
                <td>${container.id}</td>
                <td>${container.image}</td>
                <td>${container.command}</td>
                <td>${container.status}</td>
                <td>${container.ports}</td>
                <td>${container.names}</td>
                <td class="container-actions">
                    <button class="action-button start-button" 
                            onclick="currentComponent.containerAction('${container.id}', 'start')">
                        시작
                    </button>
                    <button class="action-button stop-button"
                            onclick="currentComponent.containerAction('${container.id}', 'stop')">
                        정지
                    </button>
                    <button class="action-button restart-button"
                            onclick="currentComponent.containerAction('${container.id}', 'restart')">
                        재시작
                    </button>
                </td>
            </tr>
        `).join('');
    }
} 