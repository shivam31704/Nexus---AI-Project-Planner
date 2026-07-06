import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConnectionStatus = 'connected' | 'connecting' | 'offline';

@Component({
  selector: 'nexus-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="nexus-header glass-panel">
      <div class="brand">
        <svg class="brand-mark" viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
          <defs>
            <linearGradient id="nexusMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--color-accent-primary)" />
              <stop offset="100%" stop-color="var(--color-accent-secondary)" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#nexusMarkGradient)" opacity="0.18" />
          <path d="M13 28V12h3.2L24 22.4V12h3v16h-3.2L16 17.6V28h-3z" fill="url(#nexusMarkGradient)" />
          <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="url(#nexusMarkGradient)" stroke-opacity="0.5" />
        </svg>
        <span class="brand-word">NEXUS</span>
        <span class="brand-tagline">AI Project Planner</span>
      </div>

      <div class="status-cluster">
        <div class="status-pill" [class.status-ok]="mongoStatus === 'connected'" [class.status-pending]="mongoStatus === 'connecting'">
          <span class="status-dot"></span>
          MongoDB
        </div>
        <div class="status-pill" [class.status-ok]="aiStatus === 'connected'" [class.status-pending]="aiStatus === 'connecting'">
          <span class="status-dot"></span>
          Gemini
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nexus-header {
      position: fixed;
      top: 16px;
      left: 16px;
      right: 16px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 10001;
      border-radius: var(--radius-panel-md);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-mark {
      filter: drop-shadow(0 0 6px rgba(94, 92, 230, 0.35));
      flex-shrink: 0;
    }

    .brand-word {
      font-weight: var(--font-weight-bold);
      font-size: 15px;
      letter-spacing: 0.12em;
      background: linear-gradient(120deg, #fff 0%, var(--color-accent-secondary) 55%, var(--color-accent-primary) 100%);
      background-size: 220% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: sheen-sweep 3.2s ease-in-out 1;
    }

    .brand-tagline {
      font-size: 12px;
      color: var(--color-text-tertiary);
      font-weight: var(--font-weight-regular);
      padding-left: 10px;
      margin-left: 2px;
      border-left: 1px solid rgba(255, 255, 255, 0.12);
    }

    @keyframes sheen-sweep {
      0% { background-position: 100% 0; }
      100% { background-position: 0 0; }
    }

    .status-cluster {
      display: flex;
      gap: 8px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      padding: 6px 12px;
      border-radius: var(--radius-pill);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-text-tertiary);
    }

    .status-pill.status-ok .status-dot {
      background: var(--color-accent-success);
      box-shadow: 0 0 6px var(--color-accent-success);
    }

    .status-pill.status-pending .status-dot {
      background: var(--color-accent-warning);
      box-shadow: 0 0 6px var(--color-accent-warning);
      animation: pulse-dot 1.2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    @media (max-width: 640px) {
      .brand-tagline { display: none; }
    }
  `]
})
export class AppHeaderComponent {
  @Input() mongoStatus: ConnectionStatus = 'connecting';
  @Input() aiStatus: ConnectionStatus = 'connecting';
}
