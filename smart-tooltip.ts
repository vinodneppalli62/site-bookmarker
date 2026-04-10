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

  private headerFocusListener: (() => void)[] = [];
  private headerBlurListener: (() => void)[] = [];
  private headerKeyListener: (() => void)[] = [];

  private elementFocusListener: () => void;
  private elementBlurListener: () => void;
  private elementKeyListener: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {

    // -----------------------------
    // AG-GRID HEADER TOOLTIP SUPPORT
    // -----------------------------
    if (this.el.nativeElement.hasAttribute('tooltipDir')) {
      const headers = this.el.nativeElement.querySelectorAll('.ag-header-cell');

      headers.forEach((header: HTMLElement) => {

        this.headerFocusListener.push(
          this.renderer.listen(header, 'focus', () => {
            this.showTooltip(header, header.getAttribute('aria-label'));
          })
        );

        this.headerBlurListener.push(
          this.renderer.listen(header, 'blur', () => {
            this.hideTooltip();
          })
        );

        this.headerKeyListener.push(
          this.renderer.listen(header, 'keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Enter') {
              this.hideTooltip();
            }
          })
        );
      });
    }

    // -----------------------------
    // NORMAL ELEMENT TOOLTIP SUPPORT
    // -----------------------------
    const focusable = this.findClosestFocusable(this.el.nativeElement);

    if (focusable) {
      this.elementFocusListener = this.renderer.listen(focusable, 'focus', () => {
        const title = this.el.nativeElement.getAttribute('title');
        this.showTooltip(focusable, title);
      });

      this.elementBlurListener = this.renderer.listen(focusable, 'blur', () => {
        this.hideTooltip();
      });

      this.elementKeyListener = this.renderer.listen(focusable, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          this.hideTooltip();
        }
      });
    }
  }

  // ----------------------------------------------------
  // CREATE + SHOW TOOLTIP
  // ----------------------------------------------------
  private showTooltip(target: HTMLElement, text: string | null) {
    if (!text) return;

    this.hideTooltip(); // remove old tooltip

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'dynamic-tooltip');
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '999999');
    this.renderer.setStyle(this.tooltipEl, 'background', '#222');
    this.renderer.setStyle(this.tooltipEl, 'color', '#fff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '6px 10px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
    this.renderer.setStyle(this.tooltipEl, 'transition', 'opacity .15s ease');

    const textNode = this.renderer.createText(text);
    this.renderer.appendChild(this.tooltipEl, textNode);
    this.renderer.appendChild(document.body, this.tooltipEl);

    this.startTracking(target);
    setTimeout(() => this.renderer.setStyle(this.tooltipEl, 'opacity', '1'), 10);
  }

  // ----------------------------------------------------
  // HIDE TOOLTIP
  // ----------------------------------------------------
  private hideTooltip() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;

    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  // ----------------------------------------------------
  // FRAME-SYNCED POSITION TRACKING
  // ----------------------------------------------------
  private startTracking(target: HTMLElement) {
    const update = () => {
      if (!this.tooltipEl) return;

      this.positionTooltip(target, this.tooltipEl);
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  // ----------------------------------------------------
  // POSITION TOOLTIP (FIXED + CLAMPED + AUTO-FLIP)
  // ----------------------------------------------------
  private positionTooltip(target: HTMLElement, tooltip: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    // Auto-flip top if no space below
    if (rect.top >= tipRect.height + 8) {
      top = rect.top - tipRect.height - 8;
    }

    // Clamp horizontally
    if (left < 4) left = 4;
    if (left + tipRect.width > window.innerWidth - 4) {
      left = window.innerWidth - tipRect.width - 4;
    }

    // Clamp vertically
    if (top < 4) top = 4;
    if (top + tipRect.height > window.innerHeight - 4) {
      top = window.innerHeight - tipRect.height - 4;
    }

    this.renderer.setStyle(tooltip, 'top', `${top}px`);
    this.renderer.setStyle(tooltip, 'left', `${left}px`);
  }

  // ----------------------------------------------------
  // FIND FOCUSABLE ELEMENT
  // ----------------------------------------------------
  private findClosestFocusable(el: HTMLElement): HTMLElement | null {
    const tags = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'];

    if (tags.includes(el.tagName)) return el;
    if (el.parentElement && tags.includes(el.parentElement.tagName)) return el.parentElement;

    return el;
  }

  // ----------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------
  ngOnDestroy() {
    this.hideTooltip();

    this.headerFocusListener.forEach(fn => fn());
    this.headerBlurListener.forEach(fn => fn());
    this.headerKeyListener.forEach(fn => fn());

    if (this.elementFocusListener) this.elementFocusListener();
    if (this.elementBlurListener) this.elementBlurListener();
    if (this.elementKeyListener) this.elementKeyListener();
  }
}