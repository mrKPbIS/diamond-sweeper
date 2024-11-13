import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly players: Set<string>;
  private readonly games: Map<string, any>;


  constructor () {
    this.players = new Set();
    this.games = new Map();
  }

  public join() {
    const playerId = v4();
    this.players.add(playerId);
    return { players: Array.from(this.players.keys()), playerId };
  }

  public leave(data) {
    const { playerId } = data;
    this.players.delete(playerId);
    return { players: Array.from(this.players.keys()) };
  }

  // validate player is not in the game already
  public startGame(data) {
    const { height, width, diamonds, player, foe } = data;
    const field = new Array<number[]>(width);
    for (let i = 0; i < width; i++) {
      field[i] = new Array<number>(height);
      field[i].fill(0);
    }
    let cnt = 0;
    while (cnt < diamonds) {
      const x = Math.floor(Math.random()*width);
      const y = Math.floor(Math.random()*height);
      if (field[x][y] !== 1) {
        cnt++;
        field[x][y] = 1;
      }
    }

    const gameId = v4();

    // TODO: make class, move defaults to constructor
    this.games.set(gameId, {
      uuid: gameId,
      // TODO: make class, move defaults to constructor
      players: [
        {
          uuid: player,
          score: 0,
          isMoving: true,
        },
        {
          uuid: foe,
          score: 0,
          isMoving: false,
        }
      ],
      field,
      diamonds,
      width,
      height,
      // TODO: move states to constants
      state: 'playing',
    });

    const game = this.games.get(gameId);
    return {
      uuid: gameId,
      players: game.players,
      diamonds,
      width,
      height,
      state: game.state,
    };
  }

  public makeMove(data) {
    const { gameId, playerId, x, y } = data;
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    const field = game.field;
    const player = game.players.filter(p => p.uuid === playerId)[0];
    if (!player) {
      throw new Error('Player not in the game');
    }

    if (game.state !== 'playing') {
      throw new Error('Incorrect game state');
    }

    if (!player.isMoving || x < 0 || y < 0 || x >= field.length || y >= field[0].length) {
      throw new Error('Invalid move');
    }
    if (field[x][y] === 1) {
      // TODO: do not change state directly
      player.score++;
      game.diamonds--;
      field[x][y] = 0;
      if (game.diamonds === 0) {
        game.state = 'finished';
      }

      this.games.set(gameId, game);
      return {
        uuid: gameId,
        players: game.players,
        found: true,
        state: game.state,
      }
    } else {
      let count = 0;
      for (let p of game.players) {
        p.isMoving = !p.isMoving;
      }
      for (let i = -1; i <= 1; i++) 
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          if (x+i < 0 || x+i >= field.length || y+j < 0 || y+j >= field[0].length) {
            continue;
          }
          count += field[x+i][y+j];
      }
      this.games.set(gameId, game);
      return {
        uuid: gameId,
        players: game.players,
        found: false,
        state: game.state,
        closeCount: count,
      }
    }
  }
}
