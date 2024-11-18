/**
 * File Explorer Component
 * 
 * API Endpoints:
 * 1. GET /api/files
 *    Request: {
 *      name: string,    // 서버 이름
 *      path: string     // 현재 경로
 *    }
 *    Response: [
 *      {
 *        name: string,  // 파일/폴더 이름
 *        type: string,  // 'file' 또는 'directory'
 *        path: string   // 전체 경로
 *      }
 *    ]
 * 
 * 2. POST /api/upload
 *    Request: FormData {
 *      name: string,    // 서버 이름
 *      path: string,    // 업로드 경로
 *      files: File[]    // 업로드할 파일들
 *    }
 *    Response: {
 *      success: boolean,
 *      message: string
 *    }
 * 
 * 3. POST /api/download
 *    Request: {
 *      name: string,    // 서버 이름
 *      path: string     // 다운로드할 파일 경로
 *    }
 *    Response: Blob     // 파일 데이터
 * 
 * Cookies Used:
 * - currentServer: string    // 현재 연결된 서버 이름
 * - currentPath: string      // 현재 탐색 중인 경로
 */

export default class Explorer {
    constructor() {
        this.fileList = document.getElementById('file-list');
        this.pathDisplay = document.getElementById('explorer-path');
        this.fileInput = document.getElementById('file-input');
        this.dropZone = document.getElementById('drop-zone');
        this.refreshButton = document.getElementById('refresh-btn');
        
        this.init();
        this.initCurrentPath();
        this.initDragAndDrop();
    }

    // 현재 경로 초기화 및 파일 목록 로드
    async initCurrentPath() {
        // 쿠키에서 현재 경로 가져오기
        const cookies = document.cookie.split(';');
        const pathCookie = cookies.find(cookie => cookie.trim().startsWith('currentPath='));
        const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));

        if (serverCookie && pathCookie) {
            this.currentPath = decodeURIComponent(pathCookie.split('=')[1]);
        } else if (serverCookie) {
            // 서버는 연결되어 있지만 경로가 없는 경우
            const serverName = serverCookie.split('=')[1];
            this.currentPath = `/home/${serverName}`;  // 기본 경로 설정
            this.saveCurrentPathToCookie(this.currentPath);
        } else {
            this.currentPath = '/home/user';  // 기본값
        }

        // 경로 표시 업데이트
        this.pathDisplay.textContent = this.currentPath;
        
        // 파일 목록 로드
        await this.loadFiles();
    }

    // 현재 경로를 쿠키에 저장
    saveCurrentPathToCookie(path) {
        document.cookie = `currentPath=${encodeURIComponent(path)}; path=/; max-age=3600`;
    }

    init() {
        // 파일 업로드 이벤트 리스너
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // 파일 목록 클릭 이벤트 리스너
        this.fileList.addEventListener('click', (e) => {
            const item = e.target.closest('.file-item');
            if (!item) return;
            
            if (item.classList.contains('directory')) {
                this.navigateDirectory(item.dataset.path);
            } else {
                this.downloadFile(item.dataset.path);
            }
        });

        // 새로고침 버튼 이벤트 리스너
        this.refreshButton.addEventListener('click', () => {
            this.loadFiles();
        });
    }

    initDragAndDrop() {
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files: files } });
            }
        });
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) throw new Error('연결된 서버가 없습니다.');
            const serverName = serverCookie.split('=')[1];

            const formData = new FormData();
            formData.append('name', serverName);
            formData.append('path', this.currentPath);
            
            for (let file of files) {
                formData.append('files', file);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('파일 업로드 실패');

            // 업로드 성공 후 파일 목록 새로고침
            await this.loadFiles();
        } catch (error) {
            console.error('Error:', error);
            alert('파일 업로드에 실패했습니다.');
        }
    }

    async loadFiles() {
        try {
            // 현재 서버 이름 가져오기
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) {
                throw new Error('연결된 서버가 없습니다.');
            }
            const serverName = serverCookie.split('=')[1];

            const response = await fetch('/api/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: this.currentPath
                })
            });

            if (!response.ok) throw new Error('파일 목록 로드 실패');
            
            let files = await response.json();

            files = files.files;
            console.log(files);
            this.renderFiles(files);
            this.pathDisplay.textContent = this.currentPath;
        } catch (error) {
            console.error('Error:', error);
            this.fileList.innerHTML = `<div class="error">파일 목록을 불러올 수 없습니다.</div>`;
        }
    }

    renderFiles(files) {
        this.fileList.innerHTML = '';
        
        // 상위 디렉토리로 이동 버튼 (..)
        if (this.currentPath !== '/home/user') {
            const upDir = document.createElement('div');
            upDir.className = 'file-item directory';
            upDir.textContent = '..';
            upDir.dataset.path = this.getParentPath();
            this.fileList.appendChild(upDir);
        }

        files.forEach(file => {
            const item = document.createElement('div');
            item.className = `file-item ${file.fileType}`;
            item.textContent = file.fileName;
            item.dataset.path = file.filePath;
            this.fileList.appendChild(item);
        });
    }

    async navigateDirectory(path) {
        this.currentPath = path;
        this.saveCurrentPathToCookie(path);  // 경로 변경 시 쿠키 업데이트
        await this.loadFiles();
    }

    async downloadFile(path) {
        try {
            const cookies = document.cookie.split(';');
            const serverCookie = cookies.find(cookie => cookie.trim().startsWith('currentServer='));
            if (!serverCookie) throw new Error('연결된 서버가 없습니다.');
            const serverName = serverCookie.split('=')[1];

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: serverName,
                    path: path
                })
            });

            if (!response.ok) throw new Error('파일 다운로드 실패');

            // 파일 다운로드 처리
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop();
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
    }

    // 상위 디렉토리 경로 반환
    getParentPath() {
        const parts = this.currentPath.split('/');
        parts.pop();  // 마지막 경로 부분 제거
        return parts.join('/') || '/';  // 빈 문자열인 경우 루트(/) 반환
    }
}
 