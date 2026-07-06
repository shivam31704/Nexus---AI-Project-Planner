import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectApiService, PatchNodeResponse } from '../services/project-api.service';

@Component({
  selector: 'nexus-node-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel chat-island" [class.animating-patch]="isPatching" [class.patch-success]="patchSuccess">
      <div class="island-content">
        <div class="node-context">
          <span class="type-badge">{{ nodeType }}</span>
          <span class="node-id">{{ nodeId | slice:0:8 }}</span>
        </div>
        
        <input 
          type="text" 
          class="glass-input" 
          [(ngModel)]="instruction" 
          placeholder="e.g., Rewrite just this part using a Repository pattern"
          (keyup.enter)="onSubmit()"
          [disabled]="isPatching"
        />
        
        <button class="glass-btn chat-submit" (click)="onSubmit()" [disabled]="isPatching || !instruction">
          <svg *ngIf="!isPatching" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          <div *ngIf="isPatching" class="spinner"></div>
        </button>
      </div>
      
      <!-- Ripple effect layer -->
      <div class="ripple-overlay" *ngIf="patchSuccess"></div>
    </div>
  `,
  styles: [`
    .chat-island {
      position: absolute;
      /* Dynamic positioning near the selected node would be applied via inline styles by the parent */
      width: 400px;
      border-radius: 24px;
      padding: 8px 12px;
      overflow: hidden;
      animation: slideUp 0.3s var(--spring-easing) forwards;
      transform-origin: bottom center;
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .island-content {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 2;
    }

    .node-context {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .type-badge {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-accent-primary);
    }
    .node-id {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    .glass-input {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--color-text-primary);
      font-family: var(--font-stack-primary);
      font-size: 13px;
      outline: none;
    }
    
    .glass-input::placeholder {
      color: var(--color-text-tertiary);
    }

    .chat-submit {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    /* Ripple / Glow Pulse Animation for Patch Success */
    .ripple-overlay {
      position: absolute;
      inset: 0;
      background: var(--color-accent-success);
      opacity: 0;
      z-index: 1;
      animation: pulseRipple 1s var(--spring-easing) forwards;
    }

    @keyframes pulseRipple {
      0% { opacity: 0.4; filter: blur(10px); transform: scale(1); }
      100% { opacity: 0; filter: blur(20px); transform: scale(1.1); }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class NodeChatComponent {
  @Input() nodeId!: string;
  @Input() nodeType!: string;
  @Input() nodeContent: any = {};

  @Output() patchRequest = new EventEmitter<string>();
  @Output() patched = new EventEmitter<PatchNodeResponse>();
  @Output() patchFailed = new EventEmitter<string>();

  instruction: string = '';
  isPatching = false;
  patchSuccess = false;

  constructor(private projectApi: ProjectApiService) {}

  onSubmit() {
    if (!this.instruction || this.isPatching) return;

    const instructionText = this.instruction;
    this.isPatching = true;
    this.patchRequest.emit(instructionText);

    // Real call to PATCH /api/nodes/:nodeId — previously this was a fake
    // setTimeout() that never touched the backend at all.
    this.projectApi
      .patchNode(this.nodeId, {
        nodeType: this.nodeType,
        currentNodeContent: this.nodeContent,
        instruction: instructionText,
      })
      .subscribe({
        next: (response) => {
          this.isPatching = false;
          this.patchSuccess = true;
          this.instruction = '';
          this.patched.emit(response);
          setTimeout(() => (this.patchSuccess = false), 1000);
        },
        error: (err) => {
          this.isPatching = false;
          this.patchFailed.emit(err?.error?.message || err?.message || 'Patch failed');
        },
      });
  }
}
