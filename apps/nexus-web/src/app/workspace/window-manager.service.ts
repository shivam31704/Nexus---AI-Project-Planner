import { Injectable, ComponentRef, Injector, ApplicationRef } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { GlassWindowComponent } from './glass-window.component';

export interface WindowConfig {
  id: string;
  title: string;
  component: any;
  width?: string;
  height?: string;
}

@Injectable({ providedIn: 'root' })
export class WindowManagerService {
  private windows = new Map<string, OverlayRef>();
  private activeZIndex = 1000;

  constructor(private overlay: Overlay, private injector: Injector) {}

  openWindow(config: WindowConfig) {
    if (this.windows.has(config.id)) {
      this.bringToFront(config.id);
      return;
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      panelClass: 'window-overlay-panel',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });

    const overlayRef = this.overlay.create(overlayConfig);
    
    // Create the wrapper portal
    const windowPortal = new ComponentPortal(GlassWindowComponent, null, this.injector);
    const windowRef: ComponentRef<GlassWindowComponent> = overlayRef.attach(windowPortal);
    
    windowRef.instance.title = config.title;
    windowRef.instance.innerComponent = config.component;
    windowRef.instance.close.subscribe(() => this.closeWindow(config.id));
    windowRef.instance.focus.subscribe(() => this.bringToFront(config.id));

    this.windows.set(config.id, overlayRef);
    this.bringToFront(config.id);
  }

  bringToFront(id: string) {
    const overlayRef = this.windows.get(id);
    if (overlayRef) {
      this.activeZIndex++;
      overlayRef.hostElement.style.zIndex = this.activeZIndex.toString();
    }
  }

  closeWindow(id: string) {
    const overlayRef = this.windows.get(id);
    if (overlayRef) {
      overlayRef.dispose();
      this.windows.delete(id);
    }
  }
}
