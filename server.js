const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

const WORDS = [
  '苹果', '香蕉', '猫', '狗', '房子', '汽车', '太阳', '月亮', '星星', '树',
  '花', '鸟', '鱼', '电脑', '手机', '电视', '书', '笔', '桌子', '椅子',
  '杯子', '碗', '筷子', '刀', '叉', '勺', '眼镜', '手表', '鞋子', '帽子',
  '衣服', '裤子', '裙子', '袜子', '手套', '围巾', '包', '钱包', '钥匙', '锁',
  '门', '窗户', '墙', '地板', '天花板', '楼梯', '电梯', '桥', '路', '山',
  '河', '湖', '海', '雨', '雪', '风', '云', '彩虹', '闪电', '雷',
  '飞机', '火车', '船', '自行车', '摩托车', '公交车', '地铁', '出租车', '救护车', '消防车',
  '警察', '医生', '护士', '老师', '学生', '厨师', '司机', '农民', '工人', '士兵',
  '足球', '篮球', '网球', '乒乓球', '羽毛球', '游泳', '跑步', '跳绳', '滑冰', '滑雪',
  '钢琴', '吉他', '小提琴', '笛子', '鼓', '唱歌', '跳舞', '画画', '写作', '阅读'
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function createRoom(roomId) {
  return {
    id: roomId,
    players: [],
    currentDrawer: null,
    currentWord: null,
    drawingData: [],
    round: 1,
    scores: {},
    nextRoundVotes: {},
    gameState: 'waiting'
  };
}

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  socket.on('joinRoom', ({ roomId, username }) => {
    let room = rooms.get(roomId);

    if (!room) {
      room = createRoom(roomId);
      rooms.set(roomId, room);
    }

    if (room.players.length >= 2) {
      socket.emit('roomFull');
      return;
    }

    const player = {
      id: socket.id,
      username: username,
      isDrawer: room.players.length === 0
    };

    room.players.push(player);
    room.scores[socket.id] = 0;

    socket.join(roomId);
    socket.roomId = roomId;

    if (room.players.length === 2) {
      room.currentDrawer = room.players[0].id;
      room.currentWord = getRandomWord();
      room.gameState = 'playing';

      io.to(roomId).emit('gameStart', {
        drawer: room.players[0],
        guesser: room.players[1],
        currentWord: room.currentWord,
        round: room.round
      });
    }

    io.to(roomId).emit('playerJoined', {
      players: room.players,
      gameState: room.gameState
    });

    if (room.drawingData.length > 0) {
      socket.emit('drawingHistory', room.drawingData);
    }
  });

  socket.on('draw', (data) => {
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.drawingData.push(data);
    socket.to(socket.roomId).emit('draw', data);
  });

  socket.on('clearCanvas', () => {
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.drawingData = [];
    io.to(socket.roomId).emit('clearCanvas');
  });

  socket.on('submitGuess', (guess) => {
    const room = rooms.get(socket.roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isDrawer) return;

    if (guess.trim().toLowerCase() === room.currentWord.toLowerCase()) {
      room.scores[socket.id] += 10;
      room.gameState = 'correct';
      room.nextRoundVotes = {};

      io.to(socket.roomId).emit('correctGuess', {
        guesser: player,
        word: room.currentWord,
        scores: room.scores
      });
    } else {
      io.to(socket.roomId).emit('wrongGuess', {
        guesser: player,
        guess: guess
      });
    }
  });

  socket.on('voteNextRound', () => {
    const room = rooms.get(socket.roomId);
    if (!room || room.gameState !== 'correct') return;

    room.nextRoundVotes[socket.id] = true;

    if (room.nextRoundVotes[socket.roomId] && room.nextRoundVotes[socket.roomId].size === 2) {
      startNextRound(room);
    }
  });

  function startNextRound(room) {
    room.round++;
    room.currentWord = getRandomWord();
    room.drawingData = [];
    room.nextRoundVotes = {};
    room.gameState = 'playing';

    const oldDrawerIndex = room.players.findIndex(p => p.id === room.currentDrawer);
    room.currentDrawer = room.players[(oldDrawerIndex + 1) % 2].id;

    room.players.forEach(p => {
      p.isDrawer = p.id === room.currentDrawer;
    });

    io.to(room.id).emit('nextRound', {
      drawer: room.players.find(p => p.id === room.currentDrawer),
      guesser: room.players.find(p => p.id !== room.currentDrawer),
      currentWord: room.currentWord,
      round: room.round,
      scores: room.scores
    });
  }

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);

    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        delete room.scores[socket.id];

        if (room.players.length === 0) {
          rooms.delete(socket.roomId);
        } else {
          io.to(socket.roomId).emit('playerLeft', {
            players: room.players
          });
        }
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`局域网访问地址: http://192.168.10.6:${PORT}`);
});
