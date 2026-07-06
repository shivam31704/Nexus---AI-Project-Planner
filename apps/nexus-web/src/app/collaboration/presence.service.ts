import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CursorData {
  clientId: string;
  cursorX: number;
  cursorY: number;
  color: string;
  focusedNodeId?: string;
}

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private socket!: Socket;
  
  // Store remote cursors
  private cursorsSubject = new BehaviorSubject<Map<string, CursorData>>(new Map());
  cursors$ = this.cursorsSubject.asObservable();

  // Local state for throttling
  private myCursorX = 0;
  private myCursorY = 0;
  private myColor = '#5e5ce6'; // In real app, user's assigned color
  private animationFrameId?: number;
  private pendingUpdate = false;

  constructor(private ngZone: NgZone) {}

  connect(projectId: string) {
    this.socket = io(`${environment.wsBaseUrl}/project/${projectId}`);

    this.socket.on('presence:move', (data: CursorData) => {
      const current = this.cursorsSubject.value;
      current.set(data.clientId, data);
      this.cursorsSubject.next(new Map(current)); // emit new map reference
    });

    this.socket.on('presence:leave', (data: { clientId: string }) => {
      const current = this.cursorsSubject.value;
      current.delete(data.clientId);
      this.cursorsSubject.next(new Map(current));
    });

    // Start tracking local mouse
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove);
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private onMouseMove = (event: MouseEvent) => {
    this.myCursorX = event.clientX;
    this.myCursorY = event.clientY;
    
    if (!this.pendingUpdate) {
      this.pendingUpdate = true;
      this.animationFrameId = requestAnimationFrame(this.broadcastCursor);
    }
  };

  private broadcastCursor = () => {
    this.pendingUpdate = false;
    if (this.socket && this.socket.connected) {
      this.socket.emit('presence:move', {
        cursorX: this.myCursorX,
        cursorY: this.myCursorY,
        color: this.myColor
      });
    }
  };
}
