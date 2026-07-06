import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as Y from 'yjs';

// If using Redis adapter in the future:
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// The setup for Redis is usually done in the main.ts or IoAdapter, 
// so this gateway code remains identical and is Redis-ready natively.

@WebSocketGateway({ namespace: /^\/project\/.+$/, cors: true })
export class ProjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ProjectGateway.name);
  
  // In a real app, Yjs docs would be stored/cached with persistence (e.g., y-mongodb-provider)
  private yjsDocs = new Map<string, Y.Doc>();

  handleConnection(client: Socket) {
    const projectId = client.nsp.name.split('/')[2];
    this.logger.log(`Client connected: ${client.id} to project ${projectId}`);
    
    // Join the room specifically for this project (useful for presence)
    client.join(`project_room_${projectId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Cleanup cursor presence if needed
    client.nsp.emit('presence:leave', { clientId: client.id });
  }

  // --- 1. Yjs Document Synchronization ---
  
  @SubscribeMessage('yjs:update')
  handleYjsUpdate(
    @MessageBody() update: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const projectId = client.nsp.name.split('/')[2];
    
    let doc = this.yjsDocs.get(projectId);
    if (!doc) {
      doc = new Y.Doc();
      this.yjsDocs.set(projectId, doc);
    }

    // Apply update to server-side doc
    Y.applyUpdate(doc, update);
    
    // Broadcast to others (Redis adapter automatically handles broadcasting to other nodes)
    client.broadcast.emit('yjs:update', update);
  }

  // --- 2. Cursor Presence ---

  @SubscribeMessage('presence:move')
  handleCursorMove(
    @MessageBody() data: { cursorX: number; cursorY: number; color: string; focusedNodeId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast presence data at high frequency (throttled by client)
    client.broadcast.emit('presence:move', {
      clientId: client.id,
      ...data
    });
  }

  // --- 3. Surgical Patch Events ---
  
  /**
   * Called by the PatchService when a node is self-healed by AI.
   */
  broadcastNodePatch(projectId: string, patchResponse: any) {
    this.server.of(`/project/${projectId}`).emit('node:patched', patchResponse);
  }
}
