let servers = [];

function createServer() {
    const name = document.getElementById('serverName').value;
    const type = document.getElementById('serverType').value;
    const port = document.getElementById('serverPort').value;
    const ip = document.getElementById('serverIp').value;
    if (name && port && ip) {
        servers.push({ name, type, port, ip, status: '중지됨' });
        updateServerList();
        document.getElementById('serverName').value = '';
        document.getElementById('serverPort').value = '';
        document.getElementById('serverIp').value = '';
        closeCreateServerModal();
    } else {
        alert('모든 필드를 입력해주세요.');
    }
}

function updateServerList() {
    const serverList = document.getElementById('serverList');
    serverList.innerHTML = '';
    servers.forEach((server, index) => {
        serverList.innerHTML += `
            <tr>
                <td>${server.name}</td>
                <td>${server.type}</td>
                <td>${server.port}</td>
                <td>${server.ip}</td>
                <td>${server.status}</td>
                <td>
                    <button onclick="startServer(${index})">시작</button>
                    <button onclick="stopServer(${index})">중지</button>
                    <button onclick="restartServer(${index})">재시작</button>
                    <button onclick="deleteServer(${index})">삭제</button>
                    <button onclick="editServer(${index})">설정</button>
                </td>
            </tr>
        `;
    });
}

function startServer(index) {
    updateServerStatus(index, '실행 중');
}

function stopServer(index) {
    updateServerStatus(index, '중지됨');
}

function restartServer(index) {
    updateServerStatus(index, '재시작 중');
    setTimeout(() => updateServerStatus(index, '실행 중'), 2000);
}

function deleteServer(index) {
    servers.splice(index, 1);
    updateServerList();
}

let currentEditIndex = -1;

function editServer(index) {
    currentEditIndex = index;
    const server = servers[index];
    
    document.getElementById('editServerName').value = server.name;
    document.getElementById('editServerType').value = server.type;
    document.getElementById('editServerPort').value = server.port;
    document.getElementById('editServerIp').value = server.ip;
    
    document.getElementById('editServerModal').style.display = 'block';
}

function saveServerEdit() {
    const newName = document.getElementById('editServerName').value;
    const newType = document.getElementById('editServerType').value;
    const newPort = document.getElementById('editServerPort').value;
    const newIp = document.getElementById('editServerIp').value;
    
    if (newName && newPort && newIp) {
        servers[currentEditIndex].name = newName;
        servers[currentEditIndex].type = newType;
        servers[currentEditIndex].port = newPort;
        servers[currentEditIndex].ip = newIp;
        updateServerList();
        closeEditServerModal();
    } else {
        alert('모든 필드를 입력해주세요.');
    }
}

function closeEditServerModal() {
    document.getElementById('editServerModal').style.display = 'none';
    currentEditIndex = -1;
}

function updateServerStatus(index, status) {
    servers[index].status = status;
    updateServerList();
}

// 모달 관련 함수 추가
function openCreateServerModal() {
    document.getElementById('createServerModal').style.display = 'block';
}

function closeCreateServerModal() {
    document.getElementById('createServerModal').style.display = 'none';
}

// 로그인 관련 함수들
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 여기에 실제 로그인 로직 구현
    if (username && password) {
        document.getElementById('loginButtons').style.display = 'none';
        document.getElementById('userButtons').style.display = 'flex';
        closeLoginModal();
        // 로그인 성공 시 사용자 정보 저장
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
    } else {
        alert('아이디와 비밀번호를 입력해주세요.');
    }
}

function logout() {
    document.getElementById('loginButtons').style.display = 'flex';
    document.getElementById('userButtons').style.display = 'none';
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
}

function openUserInfoModal() {
    const username = localStorage.getItem('username');
    document.getElementById('editUsername').value = username;
    document.getElementById('userInfoModal').style.display = 'block';
}

function closeUserInfoModal() {
    document.getElementById('userInfoModal').style.display = 'none';
}

function updateUserInfo() {
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editPasswordConfirm').value;
    
    if (newPassword !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 여기에 실제 회원정보 수정 로직 구현
    alert('회원정보가 수정되었습니다.');
    closeUserInfoModal();
}

// 페이지 로드 시 로그인 상태 체크
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginButtons').style.display = 'none';
        document.getElementById('userButtons').style.display = 'flex';
    }
}

// 모달 외부 클릭 시 닫기 함수 수정
window.onclick = function(event) {
    if (event.target == document.getElementById('createServerModal')) {
        closeCreateServerModal();
    }
    if (event.target == document.getElementById('editServerModal')) {
        closeEditServerModal();
    }
    if (event.target == document.getElementById('loginModal')) {
        closeLoginModal();
    }
    if (event.target == document.getElementById('userInfoModal')) {
        closeUserInfoModal();
    }
}