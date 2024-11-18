/**
 * Text Editor Component
 * 
 * API Endpoints:
 * 1. POST /api/readFile
 *    Description: 파일의 내용을 읽어옴
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
 *    Description: 파일에 내용을 저장
 *    Request: {
 *      name: string,     // 서버 이름
 *      path: string,     // 파일 경로
 *      content: string[] // 저장할 내용 (줄 단위 배열)
 *    }
 *    Response: {
 *      success: boolean  // 성공 여부
 *      message?: string  // 성공/실패 메시지
 *    }
 * 
 * Cookies Used:
 * - currentServer: string    // 현재 연결된 서버 이름 (읽기 전용)
 * - editorFilePath: string  // 에디터에서 현재 선택된 파일 경로
 */

export default class Editor {
    constructor() {
        this.currentPath = document.getElementById('current-path');
        this.selectButton = document.getElementById('select-file');
        this.textContent = document.getElementById('text-content');
        this.saveButton = document.getElementById('save-button');
        
        if (!this.currentPath || !this.selectButton || !this.textContent || !this.saveButton) {
            console.error('Editor elements not found');
            return;
        }
        
        this.init();
        this.initCurrentPath();
    }

    init() {
        this.selectButton.addEventListener('click', () => this.selectFile());
        this.saveButton.addEventListener('click', () => this.saveFile());
        
        // 파일 경로 직접 입력 시 엔터키로 파일 선택
        this.currentPath.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.selectFile();
            }
        });
    }

    initCurrentPath() {
        const cookies = document.cookie.split(';');
        const pathCookie = cookies.find(cookie => cookie.trim().startsWith('editorFilePath='));
        if (pathCookie) {
            const currentPath = decodeURIComponent(pathCookie.split('=')[1]);
            this.currentPath.value = currentPath;
        }
    }

    async selectFile() {
        const filePath = this.currentPath.value.trim();
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

            // 배열로 받은 content를 줄바꿈으로 구분하여 표시
            if (Array.isArray(data.content)) {
                this.textContent.value = data.content.join('\n');
            } else if (typeof data.content === 'string') {
                this.textContent.value = data.content;
            } else {
                throw new Error('잘못된 데이터 형식입니다.');
            }

            // 에디터 전용 쿠키 사용
            document.cookie = `editorFilePath=${encodeURIComponent(filePath)}; path=/; max-age=3600`;
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async saveFile() {
        const filePath = this.currentPath.value.trim();
        const content = this.textContent.value;
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

            // 에디터 전용 쿠키 업데이트
            document.cookie = `editorFilePath=${encodeURIComponent(filePath)}; path=/; max-age=3600`;
            alert('파일이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }
} 