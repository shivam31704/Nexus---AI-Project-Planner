import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WindowManagerService } from './window-manager.service';
import { GanttCanvasComponent } from '../gantt/gantt-canvas.component';
import { ArchitectureGraphComponent } from '../architecture-graph/architecture-graph.component';
import { CursorOverlayComponent } from '../collaboration/cursor-overlay.component';
import { PresenceService } from '../collaboration/presence.service';
import { ProjectApiService } from '../services/project-api.service';
import { AppHeaderComponent, ConnectionStatus } from '../shell/app-header.component';
import { AppFooterComponent } from '../shell/app-footer.component';

/**
 * The main shell — now with a proper header/footer brand identity
 * instead of bare floating panels, plus a subtle vignette layer for depth.
 */
@Component({
  selector: 'nexus-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorOverlayComponent, AppHeaderComponent, AppFooterComponent],
  template: `
    <div class="mesh-backdrop workspace-root">
      <div class="vignette-overlay"></div>

      <nexus-header [mongoStatus]="mongoStatus" [aiStatus]="aiStatus"></nexus-header>
      <nexus-cursor-overlay></nexus-cursor-overlay>

      <div class="glass-panel prompt-bar">
        <svg class="prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                fill="var(--color-accent-secondary)" opacity="0.85" />
        </svg>
        <input
          class="glass-input"
          [(ngModel)]="prompt"
          placeholder='Describe what to build — try &quot;Build me Netflix&quot;'
          (keyup.enter)="onGenerate()"
          [disabled]="isGenerating"
        />
        <button class="glass-btn generate-btn" (click)="onGenerate()" [disabled]="isGenerating || !prompt">
          {{ isGenerating ? 'Generating…' : 'Generate Project' }}
        </button>
      </div>

      <div class="glass-panel status-log" *ngIf="log.length">
        <div class="status-log-header">Generation Log</div>
        <div class="status-log-line" *ngFor="let line of log">{{ line }}</div>
      </div>

      <nexus-footer></nexus-footer>
    </div>
  `,
  styles: [`
    .workspace-root {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .vignette-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%);
      z-index: 1;
    }

    .prompt-bar {
      position: absolute;
      top: 92px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px 10px 18px;
      border-radius: 20px;
      width: 520px;
      z-index: 10000;
    }

    .prompt-icon {
      flex-shrink: 0;
    }

    .glass-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--color-text-primary);
      font-size: 14px;
      font-family: var(--font-stack-primary);
    }

    .glass-input::placeholder {
      color: var(--color-text-tertiary);
    }

    .generate-btn {
      padding: 8px 16px;
      font-size: 13px;
      white-space: nowrap;
    }

    .generate-btn:hover {
      background: rgba(217, 43, 43, 0.28);
      box-shadow: 0 0 18px rgba(217, 43, 43, 0.35);
    }

    .status-log {
      position: absolute;
      top: 148px;
      left: 50%;
      transform: translateX(-50%);
      width: 520px;
      max-height: 220px;
      overflow-y: auto;
      padding: 14px 18px;
      border-radius: 16px;
      z-index: 10000;
    }

    .status-log-header {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-tertiary);
      font-weight: var(--font-weight-semibold);
      margin-bottom: 8px;
    }

    .status-log-line {
      font-size: 12px;
      font-family: 'SF Mono', Consolas, monospace;
      color: var(--color-text-secondary);
      padding: 2px 0;
    }
  `]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  prompt = '';
  isGenerating = false;
  log: string[] = [];

  mongoStatus: ConnectionStatus = 'connecting';
  aiStatus: ConnectionStatus = 'connecting';

  private currentProjectId?: string;
  private presenceConnected = false;

  constructor(
    private windowManager: WindowManagerService,
    private presence: PresenceService,
    private projectApi: ProjectApiService
  ) {}

  ngOnInit() {
    this.openDefaultWindows();
  }

  ngOnDestroy() {
    this.presence.disconnect();
  }

  onGenerate() {
    if (!this.prompt || this.isGenerating) return;
    this.isGenerating = true;
    this.aiStatus = 'connecting';
    this.mongoStatus = 'connecting';
    this.log = [`Generating project for: "${this.prompt}"...`];

    this.projectApi.generateProject(this.prompt).subscribe({
      next: (artifact) => {
        this.currentProjectId = artifact.projectId;
        this.aiStatus = 'connected';
        this.mongoStatus = 'connected';
        this.log.push(`✓ Generated ${artifact.nodeType} (${artifact.nodeId?.slice(0, 8)})`);

        if (!this.presenceConnected && this.currentProjectId) {
          this.presence.connect(this.currentProjectId);
          this.presenceConnected = true;
        }
      },
      error: (err) => {
        this.aiStatus = 'offline';
        this.log.push(`✗ Error: ${err?.message || 'generation failed — check your API keys in .env'}`);
        this.isGenerating = false;
      },
      complete: () => {
        this.log.push('✓ All artifacts generated.');
        this.isGenerating = false;
      },
    });
  }

  private openDefaultWindows() {
    this.windowManager.openWindow({
      id: 'gantt',
      title: 'Timeline · Gantt Chart',
      component: GanttCanvasComponent,
    });
    this.windowManager.openWindow({
      id: 'graph',
      title: 'Architecture Map',
      component: ArchitectureGraphComponent,
    });
  }
}
