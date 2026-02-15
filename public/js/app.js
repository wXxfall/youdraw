const socket = io();

let isDrawer = false;
let currentWord = '';
let myPlayerId = null;
let roomId = null;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';
let currentSize = 5;
let currentTool = 'pencil';

function initCanvas() {
  const container = canvas.parentElement;
  const maxWidth = container.clientWidth - 40;
  const maxHeight = 500;

  canvas.width = maxWidth;
  canvas.height = maxHeight;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
}

window.addEventListener('resize', () => {
  initCanvas();
});

document.getElementById('joinBtn').addEventListener('click', joinGame);
document.getElementById('username').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinGame();
});
document.getElementById('roomId').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinGame();
});

function joinGame() {
  const username = document.getElementById('username').value.trim();
  roomId = document.getElementById('roomId').value.trim();

  if (!username) {
    alert('请输入昵称');
    return;
  }

  if (!roomId) {
    alert('请输入房间号');
    return;
  }

  document.getElementById('joinBtn').disabled = true;
  document.getElementById('joinBtn').textContent = '连接中...';

  socket.emit('joinRoom', { roomId, username });
}

socket.on('connect', () => {
  myPlayerId = socket.id;
  console.log('已连接到服务器');
});

socket.on('roomFull', () => {
  alert('房间已满，请选择其他房间');
  document.getElementById('joinBtn').disabled = false;
  document.getElementById('joinBtn').textContent = '加入游戏';
});

socket.on('playerJoined', (data) => {
  if (data.players.length === 1) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('waitingModal').classList.remove('hidden');
    document.getElementById('waitingRoomId').textContent = roomId;
  } else {
    document.getElementById('waitingModal').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
  }

  updatePlayerInfo(data.players);
});

socket.on('gameStart', (data) => {
  document.getElementById('waitingModal').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  isDrawer = data.drawer.id === myPlayerId;
  currentWord = data.currentWord;

  updateGameUI(data);
  initCanvas();
});

socket.on('drawingHistory', (data) => {
  data.forEach(drawData => {
    drawOnCanvas(drawData);
  });
});

socket.on('draw', (data) => {
  drawOnCanvas(data);
});

socket.on('clearCanvas', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('correctGuess', (data) => {
  showCorrectModal(data);
});

socket.on('wrongGuess', (data) => {
  showWrongGuess(data);
});

socket.on('nextRound', (data) => {
  isDrawer = data.drawer.id === myPlayerId;
  currentWord = data.currentWord;

  document.getElementById('modal').classList.add('hidden');
  updateGameUI(data);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('playerLeft', (data) => {
  alert('对方已离开游戏');
  location.reload();
});

function updatePlayerInfo(players) {
  players.forEach((player, index) => {
    const nameElement = document.getElementById(`player${index + 1}Name`);
    const scoreElement = document.getElementById(`player${index + 1}Score`);
    if (nameElement) nameElement.textContent = player.username;
    if (scoreElement) scoreElement.textContent = '0';
  });
}

function updateGameUI(data) {
  document.getElementById('displayRoomId').textContent = roomId;
  document.getElementById('round').textContent = data.round;

  const roleDisplay = document.getElementById('roleDisplay');
  const wordDisplay = document.getElementById('wordDisplay');
  const wordText = document.getElementById('wordText');
  const guessSection = document.getElementById('guessSection');
  const toolbar = document.querySelector('.toolbar');

  if (isDrawer) {
    roleDisplay.innerHTML = '身份: <strong>画画者</strong>';
    wordText.textContent = currentWord;
    guessSection.style.display = 'none';
    toolbar.style.display = 'flex';
  } else {
    roleDisplay.innerHTML = '身份: <strong>猜题者</strong>';
    wordText.textContent = '???';
    guessSection.style.display = 'block';
    toolbar.style.display = 'none';
  }

  data.drawer.id === myPlayerId 
    ? document.getElementById('player1Name').textContent = data.drawer.username + '(我)'
    : document.getElementById('player2Name').textContent = data.drawer.username + '(我)';

  data.guesser.id === myPlayerId 
    ? document.getElementById('player1Name').textContent = data.guesser.username + '(我)'
    : document.getElementById('player2Name').textContent = data.guesser.username + '(我)';

  if (data.scores) {
    Object.keys(data.scores).forEach(playerId => {
      const player = data.drawer.id === playerId ? data.drawer : data.guesser;
      const index = data.drawer.id === playerId ? 1 : 2;
      document.getElementById(`player${index}Score`).textContent = data.scores[playerId];
    });
  }
}

function drawOnCanvas(data) {
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.size;
  ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';
  
  ctx.beginPath();
  ctx.moveTo(data.x1, data.y1);
  ctx.lineTo(data.x2, data.y2);
  ctx.stroke();
  
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.globalCompositeOperation = 'source-over';
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
  if (!isDrawer) return;
  
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
}

function draw(e) {
  if (!isDrawing || !isDrawer) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const drawData = {
    x1: lastX,
    y1: lastY,
    x2: x,
    y2: y,
    color: currentColor,
    size: currentSize,
    tool: currentTool
  };

  drawOnCanvas(drawData);
  socket.emit('draw', drawData);

  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
    currentTool = 'pencil';
    updateToolButtons();
  });
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSize = parseInt(btn.dataset.size);
  });
});

document.getElementById('pencilBtn').addEventListener('click', () => {
  currentTool = 'pencil';
  updateToolButtons();
});

document.getElementById('eraserBtn').addEventListener('click', () => {
  currentTool = 'eraser';
  updateToolButtons();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('确定要清空画板吗？')) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas');
  }
});

function updateToolButtons() {
  document.getElementById('pencilBtn').classList.toggle('active', currentTool === 'pencil');
  document.getElementById('eraserBtn').classList.toggle('active', currentTool === 'eraser');
}

document.getElementById('submitGuessBtn').addEventListener('click', submitGuess);
document.getElementById('guessInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitGuess();
});

function submitGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = guessInput.value.trim();

  if (!guess) {
    alert('请输入答案');
    return;
  }

  socket.emit('submitGuess', guess);
  guessInput.value = '';
}

function showCorrectModal(data) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const nextRoundSection = document.getElementById('nextRoundSection');

  modalTitle.textContent = '回答正确！';
  modalMessage.textContent = `${data.guesser.username} 猜对了答案：${data.word}`;
  nextRoundSection.style.display = 'block';

  modal.classList.remove('hidden');

  document.getElementById('vote1').textContent = '等待投票...';
  document.getElementById('vote2').textContent = '等待投票...';
}

function showWrongGuess(data) {
  const guessResult = document.getElementById('guessResult');
  guessResult.textContent = `${data.guesser.username} 的答案 "${data.guess}" 不对，再试试！`;
  guessResult.className = 'guess-result wrong';

  setTimeout(() => {
    guessResult.className = 'guess-result';
    guessResult.textContent = '';
  }, 2000);
}

document.getElementById('agreeBtn').addEventListener('click', () => {
  socket.emit('voteNextRound');
  document.getElementById('agreeBtn').disabled = true;
  document.getElementById('agreeBtn').textContent = '已同意';

  const playerIndex = isDrawer ? 1 : 2;
  document.getElementById(`vote${playerIndex}`).textContent = '✓ 已同意';
});

socket.on('voteUpdate', (data) => {
  const playerIndex = data.playerId === myPlayerId ? 1 : 2;
  document.getElementById(`vote${playerIndex}`).textContent = '✓ 已同意';
});
