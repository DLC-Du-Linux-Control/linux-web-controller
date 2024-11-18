/**
 * Docker Compose Editor Component
 * 
 * API Endpoints:
 * 1. POST /api/readFile
 *    Description: compose 파일 내용을 읽어옴
 *    Request: {
 *      name: string,    // 서버 이름
 *      path: string     // 파일 경로
 *    }
 *    Response: {
 *      content: string[],  // 파일 내용 (줄 단위 배열)
 *      success: boolean,   // 성공 여부
 *      message?: string    // 오류 메시지 (실패 시)
 *    }
 * 
 * 2. POST /api/writeFile
 *    Description: compose 파일 저장
 *    Request: {
 *      name: string,     // 서버 이름
 *      path: string,     // 파일 경로
 *      content: string[] // 저장할 내용 (줄 단위 배열)
 *    }
 *    Response: {
 *      success: boolean,  // 성공 여부
 *      message?: string   // 성공/실패 메시지
 *    }
 * 
 * 3. POST /api/compose/up
 *    Description: docker-compose up 실행
 *    Request: {
 *      name: string,     // 서버 이름
 *      path: string      // compose 파일 경로
 *    }
 *    Response: {
 *      success: boolean,
 *      message: string,
 *      output?: string   // 실행 결과
 *    }
 * 
 * 4. POST /api/compose/down
 *    Description: docker-compose down 실행
 *    Request: {
 *      name: string,     // 서버 이름
 *      path: string      // compose 파일 경로
 *    }
 *    Response: {
 *      success: boolean,
 *      message: string,
 *      output?: string   // 실행 결과
 *    }
 * 
 * Cookies Used:
 * - currentServer: string     // 현재 연결된 서버 이름 (읽기 전용)
 * - composeFilePath: string   // 현재 선택된 compose 파일 경로
 */

export default class Compose {
    constructor() {
        this.composePath = document.getElementById('compose-path');
        this.selectButton = document.getElementById('select-compose');
        this.runButton = document.getElementById('run-compose');
        this.stopButton = document.getElementById('stop-compose');
        this.composeContent = document.getElementById('compose-content');
        this.composeOutput = document.getElementById('compose-output');
        this.saveButton = document.getElementById('save-compose');
        
        if (!this.composePath || !this.selectButton || !this.runButton || 
            !this.stopButton || !this.composeContent || !this.composeOutput || !this.saveButton) {
            console.error('Compose elements not found');
            return;
        }
        
        this.init();
        this.initComposePath();
    }

    init() {
        this.selectButton.addEventListener('click', () => this.selectFile());
        this.runButton.addEventListener('click', () => this.runCompose());
        this.stopButton.addEventListener('click', () => this.stopCompose());
        this.saveButton.addEventListener('click', () => this.saveFile());
        
        this.composePath.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.selectFile();
            }
        });
    }

    initComposePath() {
        const cookies = document.cookie.split(';');
        const pathCookie = cookies.find(cookie => cookie.trim().startsWith('composeFilePath='));
        if (pathCookie) {
            const composePath = decodeURIComponent(pathCookie.split('=')[1]);
            this.composePath.value = composePath;
        }
    }

    appendOutput(text, isError = false) {
        const div = document.createElement('div');
        div.textContent = text;
        if (isError) div.style.color = '#ff6b6b';
        this.composeOutput.appendChild(div);
        this.composeOutput.scrollTop = this.composeOutput.scrollHeight;
    }

    async selectFile() {
        const filePath = this.composePath.value.trim();
        if (!filePath) return;

        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            const response = await fetch('/api/readFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: filePath
                })
            });

            if (!response.ok) {
                throw new Error('파일을 읽을 수 없습니다.');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || '파일 읽기 실패');
            }

            if (Array.isArray(data.content)) {
                this.composeContent.value = data.content.join('\n');
            } else if (typeof data.content === 'string') {
                this.composeContent.value = data.content;
            } else {
                throw new Error('잘못된 데이터 형식입니다.');
            }

            document.cookie = `composeFilePath=${encodeURIComponent(filePath)}; path=/; max-age=3600`;
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async saveFile() {
        const filePath = this.composePath.value.trim();
        const content = this.composeContent.value;
        if (!filePath) return;

        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            const contentLines = content.split('\n');

            const response = await fetch('/api/writeFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: filePath,
                    content: contentLines
                })
            });

            if (!response.ok) {
                throw new Error('파일을 저장할 수 없습니다.');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || '파일 저장 실패');
            }

            document.cookie = `composeFilePath=${encodeURIComponent(filePath)}; path=/; max-age=3600`;
            this.appendOutput('파일이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Error:', error);
            this.appendOutput(error.message, true);
        }
    }

    async runCompose() {
        const filePath = this.composePath.value.trim();
        if (!filePath) return;
        console.log(filePath);

        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            this.appendOutput('docker-compose up 실행 중...');

            const response = await fetch('/api/compose/up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: filePath
                })
            });

            if (!response.ok) {
                throw new Error('compose up 실행 실패');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'compose up 실행 실패');
            }

            if (data.output) {
                this.appendOutput(data.output);
            }
            this.appendOutput('docker-compose up 실행 완료');
        } catch (error) {
            console.error('Error:', error);
            this.appendOutput(error.message, true);
        }
    }

    async stopCompose() {
        const filePath = this.composePath.value.trim();
        if (!filePath) return;

        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            this.appendOutput('docker-compose down 실행 중...');

            const response = await fetch('/api/compose/down', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: filePath
                })
            });

            if (!response.ok) {
                throw new Error('compose down 실행 실패');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'compose down 실행 실패');
            }

            if (data.output) {
                this.appendOutput(data.output);
            }
            this.appendOutput('docker-compose down 실행 완료');
        } catch (error) {
            console.error('Error:', error);
            this.appendOutput(error.message, true);
        }
    }
} 