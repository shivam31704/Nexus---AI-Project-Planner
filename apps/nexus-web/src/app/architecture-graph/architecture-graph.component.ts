import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3-force';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

@Component({
  selector: 'nexus-architecture-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container mesh-backdrop">
      <canvas #graphCanvas (mousedown)="onMouseDown($event)" (mousemove)="onMouseMove($event)" (mouseup)="onMouseUp()"></canvas>
    </div>
  `,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ArchitectureGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private simulation!: d3.Simulation<GraphNode, GraphLink>;
  
  private nodes: GraphNode[] = [
    { id: '1', label: 'UsersCollection', type: 'DbSchema' },
    { id: '2', label: 'AuthModule', type: 'FolderStructure' },
    { id: '3', label: 'AppGateway', type: 'ApiDoc' }
  ];
  private links: GraphLink[] = [
    { source: '2', target: '1' },
    { source: '3', target: '2' }
  ];

  private dpr = 1;
  private transform = { x: 0, y: 0, k: 1 };
  private draggedNode: GraphNode | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.initCanvas();
    this.initSimulation();
  }

  ngOnDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.initCanvas();
    this.simulation.alpha(0.3).restart();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    this.dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    canvas.width = rect.width * this.dpr;
    canvas.height = rect.height * this.dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      this.ctx.scale(this.dpr, this.dpr);
    }
    
    // Center initially
    this.transform.x = rect.width / 2;
    this.transform.y = rect.height / 2;
  }

  private initSimulation() {
    this.simulation = d3.forceSimulation<GraphNode>(this.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(this.links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('collide', d3.forceCollide().radius(60))
      .on('tick', () => {
        this.ngZone.runOutsideAngular(() => {
          this.draw();
        });
      });
  }

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.translate(this.transform.x, this.transform.y);
    this.ctx.scale(this.transform.k, this.transform.k);

    // Draw links
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.links.forEach(link => {
      const source = link.source as GraphNode;
      const target = link.target as GraphNode;
      this.ctx.moveTo(source.x || 0, source.y || 0);
      this.ctx.lineTo(target.x || 0, target.y || 0);
    });
    this.ctx.stroke();

    // Draw nodes
    this.nodes.forEach(node => {
      // Liquid Glass style node
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      
      this.ctx.beginPath();
      // Round rect
      const width = 120;
      const height = 40;
      const radius = 14;
      const x = (node.x || 0) - width/2;
      const y = (node.y || 0) - height/2;
      
      this.ctx.roundRect(x, y, width, height, radius);
      this.ctx.fill();
      this.ctx.stroke();

      // Text
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.label, node.x || 0, node.y || 0);
    });

    this.ctx.restore();
  }

  // --- Interaction Handlers ---
  onMouseDown(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mx = (event.clientX - rect.left - this.transform.x) / this.transform.k;
    const my = (event.clientY - rect.top - this.transform.y) / this.transform.k;

    // Find node
    const node = this.nodes.find(n => {
      const dx = (n.x || 0) - mx;
      const dy = (n.y || 0) - my;
      return Math.sqrt(dx*dx + dy*dy) < 60; // rough hit radius
    });

    if (node) {
      this.draggedNode = node;
      this.simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggedNode) {
      const canvas = this.canvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      this.draggedNode.fx = (event.clientX - rect.left - this.transform.x) / this.transform.k;
      this.draggedNode.fy = (event.clientY - rect.top - this.transform.y) / this.transform.k;
    }
  }

  onMouseUp() {
    if (this.draggedNode) {
      this.draggedNode.fx = null;
      this.draggedNode.fy = null;
      this.draggedNode = null;
      this.simulation.alphaTarget(0);
    }
  }
}
