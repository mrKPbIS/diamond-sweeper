## Repo description
It's an implementation of test assignment of multiplayer game for 2 players. Because of strict time constraints there are a lot of unfinished places marked in code with TODO comments

## How to run

### backend
```bash
# install node modules
$ npm ci

# development
$ npm run start
```
Backend will start on 3000 port for HTTP and 3010 for WS

### frontend

```bash
# install node modules
$ npm ci

$ npm run build

$ npm run dev
```
Frontend will start on 5173 port

## How to play

1. Connect to frontend
2. Select an opponent from the list of connected players
3. Enter amount of diamonds in input field
4. Press `Start game` button
5. Copy `gameId` from console message and input into `game id crutch` field
6. Make a move on the field with the game host then make the move if you can read "time to act" on the second line
7. In field DEBUG displayed result of clicked field cell. It's 999 if cell contains diamond or number of diamonds in adjacent cells
8. When game is finished you will see uuid of the winner on the second line 