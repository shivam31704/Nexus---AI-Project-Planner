import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexus-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="nexus-footer glass-panel">
      <span class="footer-text">Nexus — AI Project Planner</span>
      <span class="footer-divider">·</span>
      <span class="footer-text footer-muted">v0.1.0</span>
      <span class="footer-divider">·</span>
      <span class="footer-text footer-muted">Angular · NestJS · MongoDB</span>
    </footer>
  `,
  styles: [`
    .nexus-footer {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: var(--radius-pill);
      z-index: 10001;
    }

    .footer-text {
      font-size: 11px;
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      letter-spacing: 0.01em;
    }

    .footer-muted {
      color: var(--color-text-tertiary);
      font-weight: var(--font-weight-regular);
    }

    .footer-divider {
      color: var(--color-text-tertiary);
      opacity: 0.4;
      font-size: 11px;
    }

    @media (max-width: 640px) {
      .nexus-footer span:nth-child(n+4) { display: none; }
    }
  `]
})
export class AppFooterComponent {}
