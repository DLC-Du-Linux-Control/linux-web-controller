import CLI from './js/cli.js';
import Explorer from './js/explorer.js';
import Editor from './js/editor.js';
import Container from './js/container.js';
import Compose from './js/compose.js';
import Chat from './js/chat.js';

document.addEventListener('DOMContentLoaded', function() {
    let currentComponent = null;
    let servers = [];

    // API URL 설정
    const API_URL = '/api';

    // 서버 데이터 유효성 검사 함수 추가
    function validateServerData(data) {
        const requiredFields = ['id', 'name', 'host', 'port', 'username'];
        return requiredFields.every(field => field in data);
    }

    /**
     * 서버 목록 조회 API
     * Method: GET
     * URL: /api/servers
     * Response: [
     *   {
     *     id: number,
     *     name: string,
     *     host: string,
     *     port: string,
     *     username: string
     *   }
     * ]
     */
    async function loadServers() {
        try {
            const response = await fetch(`${API_URL}/servers`);
            if (!response.ok) throw new Error('서버 목록 로딩 실패');
            const data = await response.json();
            
            // 받은 데이터가 배열인지 확인
            if (!Array.isArray(data)) {
                throw new Error('서버 목록 데이터 형식이 잘못되었습니다.');
            }
            
            // 각 서버 데이터의 유효성 검사
            servers = data.filter(server => {
                const isValid = validateServerData(server);
                if (!isValid) {
                    console.warn('유효하지 않은 서버 데이터:', server);
                }
                return isValid;
            });
            
            renderServers();
        } catch (error) {
            console.error('Error:', error);
            alert('서버 목록을 불러오는데 실패했습니다.');
        }
    }

    // 사이드바 토글 기능
    const serverToggle = document.querySelector('.server-toggle');
    const toolsToggle = document.querySelector('.tools-toggle');
    const serverSidebar = document.querySelector('.server-sidebar');
    const toolsSidebar = document.querySelector('.tools-sidebar');
    const mainContent = document.querySelector('.main-content');

    serverToggle.addEventListener('click', () => {
        serverSidebar.classList.toggle('collapsed');
        updateCliSize();
        updateExplorerSize();
    });

    toolsToggle.addEventListener('click', () => {
        toolsSidebar.classList.toggle('collapsed');
        updateCliSize();
        updateExplorerSize();
    });

    // CLI 크기 업데이트 함수 추가
    function updateCliSize() {
        const cliContainer = document.querySelector('.cli-container');
        if (!cliContainer) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        // 브라우저 크기에 따른 동적 크기 계산
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        // 더 큰 기본 크기 설정
        let baseWidth = Math.min(browserWidth * 0.8, 1500);  // 최대 너비 증가
        let baseHeight = Math.min(browserHeight * 0.8, 1000);  // 최대 높이 증가

        if (isServerCollapsed && isToolsCollapsed) {
            cliContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            cliContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            cliContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        cliContainer.style.height = `${baseHeight}px`;
    }

    // 서버 관리 기능
    const serverList = document.getElementById('server-list');
    const addServerBtn = document.getElementById('add-server-btn');

    // 서버 목록 표시 함수
    function renderServers() {
        if (!serverList) return;
        
        serverList.innerHTML = '';
        servers.forEach((server) => {
            const serverElement = document.createElement('div');
            serverElement.className = 'server-item';
            serverElement.innerHTML = `
                <span>${server.name}</span>
                <div>
                    <button class="connect-btn">접속</button>
                    <button class="delete-btn">×</button>
                </div>
            `;
            
            const connectBtn = serverElement.querySelector('.connect-btn');
            const deleteBtn = serverElement.querySelector('.delete-btn');
            
            connectBtn.addEventListener('click', () => connectServer(server));
            deleteBtn.addEventListener('click', () => deleteServer(server.id));
            
            serverList.appendChild(serverElement);
        });
    }

    /**
     * 서버 추가 API
     * Method: POST
     * URL: /api/servers
     * Body: {
     *   name: string,      // 서버 이름
     *   host: string,      // 호스트 주소
     *   port: string,      // 포트 번호 (기본값: "22")
     *   username: string,  // SSH 사용자 이름
     *   password: string   // SSH 비밀번호
     * }
     * Response: {
     *   id: number,        // 생성된 서버 ID
     *   name: string,
     *   host: string,
     *   port: string,
     *   username: string
     * }
     * 
     * 기능: 새로운 서버 정보를 DB에 저장하고 서버 목록을 새로고침
     */
    addServerBtn.addEventListener('click', async () => {
        const serverName = prompt('서버 이름을 입력하세요:');
        if (!serverName) return;
        
        const serverHost = prompt('서버 호스트를 입력하세요:');
        if (!serverHost) return;
        
        const serverPort = prompt('서버 포트를 입력하세요 (기본값: 22):', '22');
        const username = prompt('사용자 이름을 입력하세요:');
        if (!username) return;
        
        const password = prompt('비밀번호를 입력하세요:');
        if (!password) return;

        const newServer = {
            name: serverName,
            host: serverHost,
            port: serverPort || '22',
            username,
            password
        };

        try {
            const response = await fetch(`${API_URL}/servers/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newServer)
            });

            if (!response.ok) throw new Error('서버 추가 실패');
            
            const data = await response.json();
            if (!validateServerData(data)) {
                throw new Error('서버 응답 데이터 형식이 잘못되었습니다.');
            }
            
            await loadServers();
        } catch (error) {
            console.error('Error:', error);
            alert('서버 추가에 실패했습니다: ' + error.message);
        }
    });

    /**
     * 서버 삭제 API
     * Method: POST
     * URL: /api/servers/delete
     * Body: {
     *   id: number    // 삭제할 서버 ID
     * }
     * Response: {
     *   message: string  // 성공 메시지
     * }
     * 
     * 기능: DB에서 해당 ID의 서버 정보를 삭제하고 서버 목록을 새로고침
     */
    async function deleteServer(serverId) {
        if (!confirm('이 서버를 삭제하시겠습니까?')) return;
        
        try {
            const response = await fetch(`${API_URL}/servers/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: serverId })
            });

            if (!response.ok) throw new Error('서버 삭제 실패');
            
            const data = await response.json();
            if (!data.message) {
                throw new Error('서버 응답 데이터 형식이 잘못되었습니다.');
            }
            
            await loadServers();
        } catch (error) {
            console.error('Error:', error);
            alert('서버 삭제에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 서버 접속 API (미구현)
     */
    function connectServer(server) {
        if (!currentComponent) {
            alert('먼저 CLI를 열어주세요.');
            return;
        }

        const initialPath = `/home/${server.username}`;
        
        // 서버 이름과 현재 경로를 쿠키에 저장 (1시간 유효)
        document.cookie = `currentServer=${server.name}; path=/; max-age=3600`;
        document.cookie = `currentPath=${initialPath}; path=/; max-age=3600`;
        
        // 현재 서버 표시 업데이트
        updateCurrentServerDisplay(server.name);

        currentComponent.outputScreen.innerHTML += `
            <div>서버 접속 중: ${server.name} (${server.host}:${server.port})</div>
        `;
        
        setTimeout(() => {
            currentComponent.outputScreen.innerHTML += `
                <div>서버에 성공적으로 접속했습니다.</div>
            `;
            currentComponent.updateCurrentPath(initialPath);
        }, 1000);
    }

    // 현재 서버 표시 함수 추가
    function updateCurrentServerDisplay(serverName) {
        let serverDisplay = document.querySelector('.current-server-display');
        if (!serverDisplay) {
            serverDisplay = document.createElement('div');
            serverDisplay.className = 'current-server-display';
            const mainContent = document.querySelector('.main-content');
            // CLI 컨테이너가 있다면 그 앞에 삽입
            const cliContainer = mainContent.querySelector('.cli-container');
            if (cliContainer) {
                mainContent.insertBefore(serverDisplay, cliContainer);
            } else {
                mainContent.insertBefore(serverDisplay, mainContent.firstChild);
            }
        }
        serverDisplay.innerHTML = `현재 접속중인 서버: ${serverName}`;
    }

    /**
     * CLI 컴포넌트 로드 API
     * Method: GET
     * URL: /components/cli.html
     * Response: HTML string (CLI 컴포넌트 템플릿)
     * 
     * 기능: CLI 인터페이스 컴포넌트를 동적으로 로드하고 초기화
     */
    const sidebarButtons = document.querySelectorAll('.sidebar-button');
    
    sidebarButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const type = button.getAttribute('data-type');
            
            if (type === 'cli') {
                try {
                    const response = await fetch('./components/cli.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new CLI();
                    updateCliSize();
                    
                    // 쿠키에서 현재 버 정보 확인
                    const cookies = document.cookie.split(';');
                    const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
                    if (serverCookie) {
                        const serverName = serverCookie.split('=')[1];
                        updateCurrentServerDisplay(serverName);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>CLI 컴포넌트 로드 중 오류 발생</div>`;
                }
            } else if (type === 'explorer') {
                try {
                    const response = await fetch('./components/explorer.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new Explorer();
                    updateExplorerSize();
                    
                    // 쿠키에서 현재 서버 정보 확인
                    const cookies = document.cookie.split(';');
                    const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
                    if (serverCookie) {
                        const serverName = serverCookie.split('=')[1];
                        updateCurrentServerDisplay(serverName);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>File Explorer 컴포넌트 드 중 오류 발생</div>`;
                }
            } else if (type === 'editor') {
                try {
                    const response = await fetch('./components/editor.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new Editor();
                    updateEditorSize();
                    
                    // 쿠키에서 현재 서버 정보 확인
                    const cookies = document.cookie.split(';');
                    const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
                    if (serverCookie) {
                        const serverName = serverCookie.split('=')[1];
                        updateCurrentServerDisplay(serverName);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>Text Editor 컴포넌트 로드 중 오류 발생</div>`;
                }
            } else if (type === 'Contract') {
                mainContent.innerHTML = `<div>Smart Contract는 12월 5일 추가 예정입니다.</div>`;
            } else if (type === 'container') {
                try {
                    const response = await fetch('./components/container.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new Container();
                    updateContainerSize();
                    
                    // 쿠키에서 현재 서버 정보 확인
                    const cookies = document.cookie.split(';');
                    const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
                    if (serverCookie) {
                        const serverName = serverCookie.split('=')[1];
                        updateCurrentServerDisplay(serverName);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>Docker Container 컴포넌트 로드 중 오류 발생</div>`;
                }
            } else if (type === 'compose') {
                try {
                    const response = await fetch('./components/compose.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new Compose();
                    updateComposeSize();
                    
                    const cookies = document.cookie.split(';');
                    const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
                    if (serverCookie) {
                        const serverName = serverCookie.split('=')[1];
                        updateCurrentServerDisplay(serverName);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>Docker Compose 컴포넌트 로드 중 오류 발생</div>`;
                }
            } else if (type === 'chat') {
                try {
                    const response = await fetch('./components/chat.html');
                    const html = await response.text();
                    mainContent.innerHTML = html;
                    currentComponent = new Chat();
                    updateChatSize();
                } catch (error) {
                    console.error('Error:', error);
                    mainContent.innerHTML = `<div>AI Chat 컴포넌트 로드 중 오류 발생</div>`;
                }
            } else {
                mainContent.innerHTML = `<div>${type} 포넌트가 여기에 로드됩니다.</div>`;
            }
        });
    });

    // Explorer 크기 업데이트 함수 추가
    function updateExplorerSize() {
        const explorerContainer = document.querySelector('.explorer-container');
        if (!explorerContainer) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        // CLI와 동일한 크기 계산 방식 적용
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        let baseWidth = Math.min(browserWidth * 0.8, 1200);  // CLI와 동일한 비율
        let baseHeight = Math.min(browserHeight * 0.8, 1000);

        if (isServerCollapsed && isToolsCollapsed) {
            explorerContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            explorerContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            explorerContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        explorerContainer.style.height = `${baseHeight}px`;
    }

    // Editor 크기 업데이트 함수 추가
    function updateEditorSize() {
        const editorContainer = document.querySelector('.editor-container');
        if (!editorContainer) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        let baseWidth = Math.min(browserWidth * 0.8, 1200);
        let baseHeight = Math.min(browserHeight * 0.8, 1000);

        if (isServerCollapsed && isToolsCollapsed) {
            editorContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            editorContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            editorContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        editorContainer.style.height = `${baseHeight}px`;
    }

    // Container 크기 업데이트 함수 추가
    function updateContainerSize() {
        const containerListContainer = document.querySelector('.container-list-container');
        if (!containerListContainer) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        let baseWidth = Math.min(browserWidth * 0.8, 1200);
        let baseHeight = Math.min(browserHeight * 0.8, 1000);

        if (isServerCollapsed && isToolsCollapsed) {
            containerListContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            containerListContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            containerListContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        containerListContainer.style.height = `${baseHeight}px`;
    }

    // Compose 크기 업데이트 함수 추가
    function updateComposeSize() {
        const composeContainer = document.querySelector('.compose-container');
        if (!composeContainer) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        let baseWidth = Math.min(browserWidth * 0.8, 1200);
        let baseHeight = Math.min(browserHeight * 0.8, 1000);

        if (isServerCollapsed && isToolsCollapsed) {
            composeContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            composeContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            composeContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        composeContainer.style.height = `${baseHeight}px`;
    }

    // Chat 크기 업데이트 함수 추가
    function updateChatSize() {
        const chatContainer = document.querySelector('.chat-container');
        const chatScreen = document.querySelector('.chat-screen');
        if (!chatContainer || !chatScreen) return;

        const isServerCollapsed = serverSidebar.classList.contains('collapsed');
        const isToolsCollapsed = toolsSidebar.classList.contains('collapsed');
        
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        
        let baseWidth = Math.min(browserWidth * 0.8, 1200);
        let baseHeight = Math.min(browserHeight * 0.8, 800);

        // 컨테이너 크기 조절
        if (isServerCollapsed && isToolsCollapsed) {
            chatContainer.style.width = `${baseWidth}px`;
        } else if (isServerCollapsed || isToolsCollapsed) {
            chatContainer.style.width = `${baseWidth * 0.85}px`;
        } else {
            chatContainer.style.width = `${baseWidth * 0.7}px`;
        }
        
        chatContainer.style.height = `${baseHeight}px`;

        // 채팅 화면 높이 자동 조절
        const headerHeight = chatContainer.querySelector('.chat-header').offsetHeight;
        const inputHeight = chatContainer.querySelector('.input-container').offsetHeight;
        const padding = 40; // 컨테이너 패딩
        
        const chatScreenHeight = baseHeight - headerHeight - inputHeight - padding;
        chatScreen.style.height = `${chatScreenHeight}px`;
    }

    // 브라우저 크기 변경 시 컴포넌트 크기 업데이트
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
            updateExplorerSize();
            updateCliSize();
            updateEditorSize();
            updateContainerSize();
            updateComposeSize();
            updateChatSize();
        });
    });

    // 초기 서버 목록 로딩
    loadServers();
});