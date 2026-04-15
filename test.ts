import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[tooltipDir]'
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  private tooltipEl: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private unlisteners: Array<() => void> = [];

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  // ---------------------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------------------

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;

    // CASE 1: AG-GRID / DROPDOWN ACCESSIBLE WRAPPER
    const gridNodes = host.querySelectorAll('.quest-hidden-accessible > .quest-element');
    if (gridNodes.length > 0) {
      gridNodes.forEach(node => this.attachGridListeners(node as HTMLElement));
      return;
    }

    // CASE 2: HOST ELEMENT
    const focusable = this.findClosestFocusable(host);
    if (focusable) {
      this.attachHostListeners(focusable);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.unlisteners.forEach(fn => fn());
    this.unlisteners = [];

    if (this.tooltipEl && this.tooltipEl.parentNode) {
      this.renderer.removeChild(this.tooltipEl.parentNode, this.tooltipEl);
    }
    this.tooltipEl = null;
  }

  // ---------------------------------------------------------
  // LISTENERS — AG GRID
  // ---------------------------------------------------------

  private attachGridListeners(node: HTMLElement): void {
    // FOCUS
    this.unlisteners.push(
      this.renderer.listen(node, 'focus', (event: Event) => {
        const target = event.target as HTMLElement;
        this.setTooltipForGrid(target);
      })
    );

    // BLUR
    this.unlisteners.push(
      this.renderer.listen(node, 'blur', () => {
        this.hideTooltip();
      })
    );

    // ESC
    this.unlisteners.push(
      this.renderer.listen(node, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.hideTooltip();
        }
      })
    );
  }

  // ---------------------------------------------------------
  // LISTENERS — HOST ELEMENT
  // ---------------------------------------------------------

  private attachHostListeners(target: HTMLElement): void {
    // FOCUS
    this.unlisteners.push(
      this.renderer.listen(target, 'focus', () => {
        this.showTooltipFromHost();
      })
    );

    // BLUR
    this.unlisteners.push(
      this.renderer.listen(target, 'blur', () => {
        this.hideTooltip();
      })
    );

    // ESC
    this.unlisteners.push(
      this.renderer.listen(target, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.hideTooltip();
        }
      })
    );
  }

  // ---------------------------------------------------------
  // AG-GRID TOOLTIP LOGIC (SEPARATE)
  // ---------------------------------------------------------

  private setTooltipForGrid(node: HTMLElement): void {
    let text: string | null = null;
    let anchor: HTMLElement = node;

    // CASE 1: Hidden accessible wrapper
    if (node.parentElement?.classList.contains('quest-hidden-accessible')) {
      const parent = node.parentElement;
      const titleElement = parent.querySelector('[title]') as HTMLElement | null;
      text = titleElement?.getAttribute('title') || null;
    }

    // CASE 2: AG-Grid header cell
    if (!text) {
      const headerText = node.querySelector('.ag-header-cell-text') as HTMLElement | null;
      if (headerText) {
        text = headerText.getAttribute('aria-label') || null;
        anchor = headerText;
      }
    }

    if (!text) return;

    this.renderTooltip(anchor, text);
  }

  // ---------------------------------------------------------
  // HOST TOOLTIP LOGIC (SEPARATE)
  // ---------------------------------------------------------

  private showTooltipFromHost(): void {
    const host = this.el.nativeElement;

    // Always read fresh title
    let text = host.getAttribute('title');

    // EMP Dropdown special case
    if (host.tagName === 'SELECT' && host.role === 'listbox') {
      const dynamic = host.querySelector('.dynamic-tooltip') as HTMLElement | null;
      if (dynamic && text) {
        this.renderTooltip(host, text);
        return;
      }
    }

    if (text) {
      this.renderTooltip(host, text);
    }
  }

  // ---------------------------------------------------------
  // RENDER TOOLTIP
  // ---------------------------------------------------------

  private renderTooltip(anchor: HTMLElement, text: string): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const tooltip = this.ensureTooltipElement();
      this.renderer.setProperty(tooltip, 'textContent', text);
      this.applyTooltipStyle(anchor);
    });
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
    }
  }

  // ---------------------------------------------------------
  // TOOLTIP ELEMENT + POSITIONING
  // ---------------------------------------------------------

  private ensureTooltipElement(): HTMLElement {
    if (!this.tooltipEl) {
      const doc = this.el.nativeElement.ownerDocument;
      this.tooltipEl = this.renderer.createElement('div');

      this.renderer.addClass(this.tooltipEl, 'quest-tooltip');
      this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipEl, 'z-index', '1000');
      this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
      this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

      this.renderer.appendChild(doc.body, this.tooltipEl);
    }
    return this.tooltipEl;
  }

  private applyTooltipStyle(anchor: HTMLElement): void {
    if (!this.tooltipEl) return;

    const rect = anchor.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + (rect.width - tooltipRect.width) / 2;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > vw - 8) {
      left = vw - tooltipRect.width - 8;
    }

    if (top + tooltipRect.height > vh - 8) {
      top = rect.top - tooltipRect.height - 8;
      if (top < 8) top = 8;
    }

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  // ---------------------------------------------------------
  // FIND CLOSEST FOCUSABLE
  // ---------------------------------------------------------

  private findClosestFocusable(start: HTMLElement): HTMLElement | null {
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    let current: HTMLElement | null = start;

    while (current) {
      if (current.matches(selector) || current.tabIndex >= 0) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }
}