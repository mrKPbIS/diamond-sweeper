import { SubscribeMessage, MessageBody, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { AppService } from "./app.service";
import { from, map } from "rxjs";
import { Server } from "socket.io";

@WebSocketGateway(3010, {cors: ['*'],transports: ['websocket']})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;
  // TODO: do not store it here
  private readonly clientsToPlayer: Map<string, string>;
  constructor(private readonly appService: AppService) {
    this.clientsToPlayer = new Map();
  }

  handleConnection(client) {
    const data = this.appService.join();
    // TODO: move event names to constants 
    const event = 'players-list';
    console.log(data.playerId+' connected');
    // TODO: emit playerId only to connected one
    this.clientsToPlayer.set(client.id, data.playerId);

    this.server.emit(event, data);
  } 

  handleDisconnect(client: any) {
    const playerId = this.clientsToPlayer.get(client.id);
    console.log(playerId+' disconnected');
    const data = this.appService.leave({ playerId });
    const event = 'players-list';
    this.server.emit(event, data);
  }

  // TODO emit responses only to specified clients
  @SubscribeMessage('make-move')
  handleEvent(@MessageBody() body: any) {
    // TODO: validate params
    const data = this.appService.makeMove(body);
    const event = 'game-state';
    this.server.emit(event, data);
  }
}