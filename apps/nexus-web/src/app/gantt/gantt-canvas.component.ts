import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, NgZone, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GanttTask {
  id: string;
  title: string;
  startDay: number;   // day offset from project start
  durationDays: number;
  dependsOn?: string[];
}

@Component({
  selector: 'nexus-gantt-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container mesh-backdrop">
      <canvas #ganttCanvas></canvas>
      <div class="glass-panel zoom-controls">
        <button class="glass-btn" (click)="zoom(1.2)">Zoom In</button>
        <button class="glass-btn" (click)="zoom(0.8)">Zoom Out</button>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container { width: 100%; height: 100%; position: relative; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
    .zoom-controls { position: absolute; bottom: 24px; right: 24px; display: flex; gap: 8px; padding: 8px; }
  `]
})
export class GanttCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('ganttCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Real data hook: pass generated Task artifacts in here once the
  // generation pipeline produces them. Sample data below so the chart
  // renders something real (not a placeholder grid) out of the box.
  @Input() tasks: GanttTask[] = [
    { id: 't1', title: 'Auth & User Service', startDay: 0, durationDays: 5 },
    { id: 't2', title: 'Video Ingest Pipeline', startDay: 3, durationDays: 8, dependsOn: ['t1'] },
    { id: 't3', title: 'Recommendation Engine', startDay: 8, durationDays: 10, dependsOn: ['t2'] },
    { id: 't4', title: 'Frontend Player UI', startDay: 5, durationDays: 12 },
    { id: 't5', title: 'Billing & Subscriptions', startDay: 2, durationDays: 6 },
  ];

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId?: number;
  private transform = { x: 40, y: 40, scale: 1 };

  private readonly rowHeight = 44;
  private readonly dayWidth = 32;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.initCanvas();
    this.ngZone.runOutsideAngular(() => this.renderLoop());
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  @HostListener('window:resize')
  onResize() {
    this.initCanvas();
  }

  zoom(factor: number) {
    this.transform.scale = Math.min(3, Math.max(0.3, this.transform.scale * factor));
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      this.ctx.scale(dpr, dpr);
    }
  }

  private renderLoop = () => {
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    this.ctx.clearRect(0, 0, cssWidth, cssHeight);
    this.ctx.save();
    this.ctx.translate(this.transform.x, this.transform.y);
    this.ctx.scale(this.transform.scale, this.transform.scale);

    const dayWidth = this.dayWidth;
    const rowHeight = this.rowHeight;
    const maxDay = Math.max(...this.tasks.map((t) => t.startDay + t.durationDays), 20);

    // Day grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.beginPath();
    for (let d = 0; d <= maxDay; d++) {
      const x = d * dayWidth;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.tasks.length * rowHeight);
    }
    this.ctx.stroke();

    // Task bars + labels
    this.tasks.forEach((task, i) => {
      const y = i * rowHeight + 8;
      const x = task.startDay * dayWidth;
      const width = task.durationDays * dayWidth;

      const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
      gradient.addColorStop(0, 'rgba(94, 92, 230, 0.9)');
      gradient.addColorStop(1, 'rgba(94, 92, 230, 0.5)');

      this.ctx.fillStyle = gradient;
      this.roundRect(x, y, width, rowHeight - 16, 8);
      this.ctx.fill();

      this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
      this.ctx.font = '12px -apple-system, Inter, sans-serif';
      this.ctx.fillText(task.title, x + 10, y + (rowHeight - 16) / 2 + 4);
    });

    // Dependency arrows (simple bezier curves)
    this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    this.ctx.lineWidth = 1.5;
    this.tasks.forEach((task, i) => {
      (task.dependsOn || []).forEach((depId) => {
        const depIndex = this.tasks.findIndex((t) => t.id === depId);
        if (depIndex === -1) return;
        const dep = this.tasks[depIndex];

        const fromX = (dep.startDay + dep.durationDays) * dayWidth;
        const fromY = depIndex * rowHeight + 8 + (rowHeight - 16) / 2;
        const toX = task.startDay * dayWidth;
        const toY = i * rowHeight + 8 + (rowHeight - 16) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.bezierCurveTo(fromX + 20, fromY, toX - 20, toY, toX, toY);
        this.ctx.stroke();
      });
    });

    this.ctx.restore();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }
}
