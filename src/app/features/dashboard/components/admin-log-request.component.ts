import { AfterViewInit, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLogRequestService } from '../../../core/services/admin-log-request.service';

@Component({
  selector: 'admin-log-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-log-request.component.html'
})
export class AdminLogRequestComponent implements OnInit, AfterViewInit {
  get logs$() {
    return this.adminLogRequestService.logs$;
  }

  isAdmin = false;
  consoleHeight = 280; // default height
  isResizing = false;
  resizeDirection: 'right' | 'bottom' | 'bottom-right' | null = null;
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;

  // dragging state
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  startLeft = 0;
  startTop = 0;

  // position and size
  posX = 24; // px from left
  posY = 24; // px from top
  width = 960; // default width
  minWidth = 300;
  maxWidth = 1400;
  minHeight = 200;
  maxHeight = 800;
  isMaximized = false;
  prevBounds = { left: 24, top: 24, width: 960, height: 280 };
  containerBounds = { width: 0, height: 0 };

  constructor(private adminLogRequestService: AdminLogRequestService, private hostElement: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.adminLogRequestService.setHeight(this.consoleHeight);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateContainerBounds();
      if (this.containerBounds.width > 0 && this.containerBounds.height > 0) {
        this.width = Math.min(this.width, Math.floor(this.containerBounds.width * 0.9));
        this.posX = Math.max(12, this.containerBounds.width - this.width - 24);
        this.posY = Math.max(12, this.containerBounds.height - this.consoleHeight - 24);
        this.prevBounds = {
          left: this.posX,
          top: this.posY,
          width: this.width,
          height: this.consoleHeight
        };
      }
    });
  }

  clearLogs(): void {
    this.adminLogRequestService.clearLogs();
  }

  onResizeStart(direction: 'right' | 'bottom' | 'bottom-right', e: MouseEvent): void {
    this.updateContainerBounds();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.width;
    this.startHeight = this.consoleHeight;
    e.stopPropagation();
  }

  onDragStart(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    this.updateContainerBounds();
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.startLeft = this.posX;
    this.startTop = this.posY;
    e.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.isDragging) {
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      let newLeft = this.startLeft + dx;
      let newTop = this.startTop + dy;

      if (this.containerBounds.width > 0 && this.containerBounds.height > 0) {
        const maxLeft = Math.max(0, this.containerBounds.width - this.width);
        const maxTop = Math.max(0, this.containerBounds.height - this.consoleHeight);
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
      } else if (typeof window !== 'undefined') {
        const maxLeft = Math.max(0, window.innerWidth - this.width);
        const maxTop = Math.max(0, window.innerHeight - this.consoleHeight);
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
      }

      this.posX = newLeft;
      this.posY = newTop;
      return;
    }

    if (!this.isResizing) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    if (this.resizeDirection === 'right' || this.resizeDirection === 'bottom-right') {
      const newWidth = this.startWidth + dx;
      if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
        this.width = newWidth;
      }
    }

    if (this.resizeDirection === 'bottom' || this.resizeDirection === 'bottom-right') {
      const newHeight = this.startHeight + dy;
      if (newHeight >= this.minHeight && newHeight <= this.maxHeight) {
        this.consoleHeight = newHeight;
        this.adminLogRequestService.setHeight(this.consoleHeight);
      }
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateContainerBounds();
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isResizing = false;
    this.resizeDirection = null;
    this.isDragging = false;
    this.adminLogRequestService.setHeight(this.consoleHeight);
  }

  private updateContainerBounds(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const dashboardArea = this.hostElement.nativeElement.closest('.dashboard-area') as HTMLElement | null;
    if (dashboardArea) {
      const rect = dashboardArea.getBoundingClientRect();
      this.containerBounds = {
        width: rect.width,
        height: rect.height
      };
      return;
    }

    if (typeof window !== 'undefined') {
      this.containerBounds = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  }

  toggleMaximize(): void {
    if (this.isMaximized) {
      this.posX = this.prevBounds.left;
      this.posY = this.prevBounds.top;
      this.width = this.prevBounds.width;
      this.consoleHeight = this.prevBounds.height;
    } else {
      this.prevBounds = {
        left: this.posX,
        top: this.posY,
        width: this.width,
        height: this.consoleHeight
      };
      this.updateContainerBounds();

      const maxWidth = this.containerBounds.width > 0 ? this.containerBounds.width - 24 : window.innerWidth - 24;
      const maxHeight = this.containerBounds.height > 0 ? this.containerBounds.height - 24 : window.innerHeight - 24;

      this.posX = 12;
      this.posY = 12;
      this.width = Math.min(maxWidth, this.maxWidth);
      this.consoleHeight = Math.min(maxHeight, this.maxHeight);
    }
    this.isMaximized = !this.isMaximized;
    this.adminLogRequestService.setHeight(this.consoleHeight);
  }

  close(): void {
    this.adminLogRequestService.setVisibility(false);
  }
}
