<script setup lang="ts">
import { io } from 'socket.io-client';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const BACKEND_URL_WS = 'ws://localhost:3010';
const BACKEND_URL = 'http://localhost:3000';
const playerId = ref('');
const score = ref(0);
const players = ref([]);
const gameId = ref('');
const opponentPlayer = ref('');
const diamonds = ref(0);
const state = ref('');
const closeCount = ref(0);

// TODO: add dynamic field dimensions
const FIELD_WIDTH = 5;
const FIELD_HEIGHT = 5;

let socket;


// TODO: move game to separate component
function requestStart() {
  const res = axios.post(`${BACKEND_URL}/start`, {
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      diamonds: diamonds.value,
      player: playerId.value,
      foe: opponentPlayer.value,
  }).then((resp) => {
    console.log(resp.data);
  })
}

function makeMove(x, y) {
  socket.emit('make-move', {
    gameId: gameId.value,
    playerId: playerId.value, 
    x: x-1,
    y: y-1,
  });
}

onMounted(() => {
  console.log("Starting connection to WebSocket Server")

  socket = io(BACKEND_URL_WS, { transports: ['websocket']});

  socket.on("connect", () => {
    console.log('connected to server');
  });

  socket.on('players-list', (message) => {
    if (playerId.value === '') {
      playerId.value = message.playerId;
    }
    players.value = message.players.filter(p => p !== playerId.value);
  })

  socket.on('game-state', (message) => {
    // TODO: process response and update game field
    console.log(message);
    const { players } = message
    const playerInGame = players.filter(p => p.uuid === playerId.value);
    if (!playerInGame) {
      return;
    }
    score.value = playerInGame[0].score;
    state.value = playerInGame[0].isMoving ? 'time to act': 'waiting for other player';

    closeCount.value = !message.found? message.closeCount: 999;
    if (message.state === 'finished') {
      const winner = players[0].score > players[1].score? players[0].uuid: players[1].uuid;
      state.value = winner;
    }
  });
})

</script>

<template>
  <div class="info">
    Me {{ playerId }} <br>
    score: {{ score }}
    {{  state }}
    DEBUG: {{  closeCount }}
  </div>
  <div class="players">
    Players
    <li v-for="player in players">
      <input type="radio" :id=player :value=player v-model="opponentPlayer"/>
      <label :for=player>{{  player  }}</label>
    </li>
  </div>
  <div class="controls">
    <label for="diamonds">diamonds</label>
    <input id="diamonds" v-model="diamonds" />
    <label for="game-id">game id crutch</label>
    <input id="game-id" v-model="gameId" />
    <button @click="requestStart">Start game</button>
  </div>
  <div class="field">
    <ul v-for="i in FIELD_HEIGHT" >
      <ul v-for="j in FIELD_WIDTH" style="display: inline;">
        <button :id="`field-${i}-${j}`" @click="makeMove(i, j)">?</button>
      </ul>
    </ul>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
