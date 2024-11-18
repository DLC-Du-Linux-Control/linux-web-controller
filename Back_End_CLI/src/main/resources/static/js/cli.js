export default class CLI {
    constructor() {
        this.commandInput = document.getElementById('command-input');
        this.sendButton = document.getElementById('send-button');
        this.outputScreen = document.getElementById('output-screen');
        
        if (!this.commandInput || !this.sendButton || !this.outputScreen) {
            console.error('CLI elements not found');
            return;
        }
        
        this.init();
        this.initCurrentPath();
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendCommand());
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCommand();
            }
        });
    }

    initCurrentPath() {
        const cookies = document.cookie.split(';');
        const pathCookie = cookies.find(cookie => cookie.trim().startsWith('currentPath='));
        if (pathCookie) {
            const currentPath = decodeURIComponent(pathCookie.split('=')[1]);
            this.updateCurrentPath(currentPath);
        }
    }

    async sendCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        // 입력된 명령어 표시
        this.outputScreen.innerHTML += `<div>> ${command}</div>`;
        this.commandInput.value = '';

        try {
            // 현재 서버 이름 가져오기
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            // 명령어 전송
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    command: command
                })
            });

            if (!response.ok) {
                throw new Error('명령어 전송 실패');
            }

            const data = await response.json();
            
            // 반환값이 있는 경우에만 출력
            if (data.returnCommand) {
                try {
                    // returnCommand가 문자열인 경우
                    if (typeof data.returnCommand === 'string') {
                        let splitData = data.returnCommand.split("\n");
                        for(let idx of splitData) {
                            this.outputScreen.innerHTML += `<div>${idx}</div>`;
                        }
                    }
                    // returnCommand가 배열인 경우
                    else if (Array.isArray(data.returnCommand) && 
                        data.returnCommand[0] && 
                        typeof data.returnCommand[0] === 'string') {
                        
                        let splitData = data.returnCommand[0].split("\n");
                        for(let idx of splitData) {
                            this.outputScreen.innerHTML += `<div>${idx}</div>`;
                        }
                    }
                    // 그 외의 경우
                    else {
                        this.outputScreen.innerHTML += `<div>${data.returnCommand}</div>`;
                    }
                } catch (error) {
                    console.error('Error processing returnCommand:', error);
                    this.outputScreen.innerHTML += `<div>${data.returnCommand}</div>`;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            //this.outputScreen.innerHTML += `<div style="color: red;">Error: ${error.message}</div>`;
        }

        // 스크롤을 항상 아래로 유지
        this.outputScreen.scrollTop = this.outputScreen.scrollHeight;
    }

    updateCurrentPath(path) {
        document.cookie = `currentPath=${encodeURIComponent(path)}; path=/; max-age=3600`;
        document.getElementById('current-path').textContent = path;
    }
} 