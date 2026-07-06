import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService, CursorData } from './presence.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nexus-cursor-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cursors-container">
      <div 
        *ngFor="let cursor of cursors | keyvalue"
        class="glass-cursor-pill"
        [style.transform]="'translate(' + cursor.value.cursorX + 'px, ' + cursor.value.cursorY + 'px)'"
        [style.--cursor-color]="cursor.value.color"
      >
        {{ cursor.value.clientId | slice:0:4 }}
      </div>
    </div>
  `,
  styles: [`
    .cursors-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 9999; /* Always above canvas and panels */
      overflow: hidden;
    }
    
    .glass-cursor-pill {
      position: absolute;
      top: 0;
      left: 0;
      /* The base styles for this are in design-tokens.css */
      /* Hardware accelerated translation */
      will-change: transform;
    }
  `]
})
export class CursorOverlayComponent implements OnInit, OnDestroy {
  cursors = new Map<string, CursorData>();
  private sub!: Subscription;

  constructor(private presence: PresenceService) {}

  ngOnInit() {
    this.sub = this.presence.cursors$.subscribe(map => {
      this.cursors = map;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
