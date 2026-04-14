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

  private headerUnlisteners: Array<() => void> = [];
  private elementUnlistener: (() => void) | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  // -----------------------------
  // Lifecycle
  // -----------------------------

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;

    // AG-Grid header / special case
    if (host.hasAttribute('tooltipDir')) {
      const nodes = host.querySelectorAll(
        '.quest-hidden-accessible > .quest-element'
      );

      nodes.forEach((node: Element) => {
        const element = node as HTMLElement;

        const unlisten = this.attachListeners(
          element,
          () => this.setTooltipFromHeader(element),
          () => this.hideTooltip()
        );

        this.headerUnlisteners.push(unlisten);
      });

      return;
    }

    // Generic closest focusable element case
    const focusable = this.findClosestFocusable(host);
    if (focusable) {
      this.elementUnlistener = this.attachListeners(
        focusable,
        () => this.showTooltipFromHost(),
        () => this.hideTooltip()
      );
    }
  }

  ngOnDestroy(): void {
    // Cancel RAF
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove listeners
    this.headerUnlisteners.forEach(fn => fn());
    this.headerUnlisteners = [];

    if (this.elementUnlistener) {
      this.elementUnlistener();
      this.elementUnlistener = null;
    }

    // Remove tooltip element
    if (this.tooltipEl && this.tooltipEl.parentNode) {
      this.renderer.removeChild(
        this.tooltipEl.parentNode,
        this.tooltipEl
      );
    }
    this.tooltipEl = null;
  }

  // -----------------------------
  // Listener wiring
  // -----------------------------

  private attachListeners(
    target: HTMLElement,
    onFocus: () => void,
    onBlur: () => void
  ): () => void {
    const unlisteners: Array<() => void> = [];

    unlisteners.push(
      this.renderer.listen(target, 'focus', () => onFocus())
    );

    unlisteners.push(
      this.renderer.listen(target, 'blur', () => onBlur())
    );

    unlisteners.push(
      this.renderer.listen(target, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onBlur();
        }
      })
    );

    return () => unlisteners.forEach(fn => fn());
  }

  // -----------------------------
  // Tooltip creation / styling
  // -----------------------------

  private ensureTooltipElement(): HTMLElement {
    if (!this.tooltipEl) {
      const doc = this.el.nativeElement.ownerDocument;
      this.tooltipEl = this.renderer.createElement('div');

      this.renderer.addClass(this.tooltipEl, 'quest-tooltip');
      // You can add more classes here if needed
      // this.renderer.addClass(this.tooltipEl, 'quest-tooltip--fixed');

      this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipEl, 'z-index', '1000');
      this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');

      this.renderer.appendChild(doc.body, this.tooltipEl);
    }

    return this.tooltipEl;
  }

  private applyTooltipStyle(anchor: HTMLElement): void {
    if (!this.tooltipEl) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + (rect.width - tooltipRect.width) / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Clamp horizontally
    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    // Clamp vertically (if bottom overflows, show above)
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = rect.top - tooltipRect.height - 8;
      if (top < 8) {
        top = 8;
      }
    }

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipEl, 'opacity', '1');
  }

  private hideTooltip(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.tooltipEl) {
      this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
    }
  }

  // -----------------------------
  // Tooltip content sources
  // -----------------------------

  private setTooltipFromHeader(node: HTMLElement): void {
    const container = node.parentElement?.parentElement as HTMLElement | null;
    if (!container) {
      return;
    }

    const text = node.getAttribute('title');
    if (!text) {
      return;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const tooltip = this.ensureTooltipElement();
      this.renderer.setProperty(tooltip, 'textContent', text);
      this.applyTooltipStyle(container);
    });
  }

  private showTooltipFromHost(): void {
    const host = this.el.nativeElement;
    const text =
      host.getAttribute('title') ||
      host.getAttribute('data-tooltip') ||
      '';

    if (!text) {
      return;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const tooltip = this.ensureTooltipElement();
      this.renderer.setProperty(tooltip, 'textContent', text);
      this.applyTooltipStyle(host);
    });
  }

  // -----------------------------
  // Focusable search
  // -----------------------------

  private findClosestFocusable(start: HTMLElement): HTMLElement | null {
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    let current: HTMLElement | null = start;

    while (current) {
      if (
        current.matches(focusableSelector) ||
        (typeof current.tabIndex === 'number' && current.tabIndex >= 0)
      ) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }
}