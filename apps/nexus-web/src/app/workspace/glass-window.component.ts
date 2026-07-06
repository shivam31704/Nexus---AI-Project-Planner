import { Component, Input, Output, EventEmitter, Type, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'nexus-glass-window',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="glass-panel window-container" cdkDrag cdkDragBoundary=".mesh-backdrop" (mousedown)="onFocus()">
      <!-- Frosted Title Bar for Dragging -->
      <div class="window-header" cdkDragHandle>
        <div class="traffic-lights">
          <div class="light close" (click)="close.emit()"></div>
          <div class="light minimize"></div>
          <div class="light maximize"></div>
        </div>
        <span class="title">{{ title }}</span>
        <div class="spacer"></div>
      </div>
      
      <!-- Dynamic Content Area -->
      <div class="window-content">
        <ng-container #contentContainer></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .window-container {
      display: flex;
      flex-direction: column;
      width: 400px;
      height: 300px;
      overflow: hidden;
    }
    .window-header {
      height: 38px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: grab;
    }
    .window-header:active {
      cursor: grabbing;
    }
    .traffic-lights {
      display: flex;
      gap: 8px;
    }
    .light {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }
    .light.close:hover { background: var(--color-accent-danger); }
    .light.minimize:hover { background: var(--color-accent-warning); }
    .light.maximize:hover { background: var(--color-accent-success); }
    
    .title {
      flex: 1;
      text-align: center;
      font-weight: var(--font-weight-medium);
      font-size: 13px;
      color: var(--color-text-primary);
    }
    .spacer {
      width: 52px; /* balance traffic lights */
    }
    .window-content {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }
  `]
})
export class GlassWindowComponent implements AfterViewInit {
  @Input() title: string = 'Window';
  @Input() innerComponent!: Type<any>;
  
  @Output() close = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainer!: ViewContainerRef;

  ngAfterViewInit() {
    if (this.innerComponent && this.contentContainer) {
      this.contentContainer.createComponent(this.innerComponent);
    }
  }

  onFocus() {
    this.focus.emit();
  }
}
