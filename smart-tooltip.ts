import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[tooltipDir], [title]'   // ← activates on title OR tooltipDir
})
export class TooltipDirective implements AfterViewInit, OnDestroy {

  private tooltipEl: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private listeners: Array<() => void> = [];

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Debug: confirm directive is running
    // console.log('TooltipDirective attached to:', this.el.nativeElement);
  }

  ngAfterViewInit() {
    const native = this.el.nativeElement;

    // ----------------------------------------------------
    // 1. SKIP INTERNAL / HIDDEN ELEMENTS
    // ----------------------------------------------------
    if (
      native.hasAttribute('aria-hidden') ||
      native.offsetParent === null // invisible
    ) {
      return;
    }

    // ----------------------------------------------------
    // 2. MAKE ELEMENT FOCUSABLE IF IT ISN'T
    // ----------------------------------------------------
    const tag = native.tagName.toLowerCase();
    const isNaturallyFocusable =
      ['button', 'a', 'input', 'select', 'textarea'].includes(tag);

    if (!isNaturallyFocusable && !native.hasAttribute('tabindex')) {
      this.renderer.setAttribute(native, 'tabindex', '0');
    }

    // ----------------------------------------------------
    // 3. ATTACH LISTENERS TO THIS ELEMENT
    // ----------------------------------------------------
    this.attachListeners(native, () => this.extractTooltipText(native));

    // ----------------------------------------------------
    // 4. SPECIAL CASE: Quest/PrimeNG dropdown trigger
    // ----------------------------------------------------
    const trigger = native.querySelector('.quest-dropdown-trigger');
    if (trigger) {
      this.attachListeners(trigger as HTMLElement, () =>
        this.extractTooltipText(native)
      );
    }
  }

  // ----------------------------------------------------
  // Extract tooltip text from host or deep children
  // ----------------------------------------------------
  private extractTooltipText(root: HTMLElement): string | null {
    // 1. Direct attributes
    let text =
      root.getAttribute('title') ||
      root.getAttribute('aria-label');
    if (text) return text;

    // 2. Any child with title
    const withTitle = root.querySelector('[title]');
    if (withTitle) return withTitle.getAttribute('title');

    // 3. Any child with aria-label
    const withAria = root.querySelector('[aria-label]');
    if (withAria) return withAria.getAttribute('aria-label');

    // 4. Screen-reader label
    const sr = root.querySelector('.sr-only');
    if (sr && sr.textContent?.trim()) return sr.textContent.trim();

    // 5. Fallback: visible text
    const visible = root.querySelector('*:not([aria-hidden="true"])');
    if (visible && visible.textContent?.trim()) {
      return visible.textContent.trim();
    }

    return null;
  }

  // ----------------------------------------------------
  // Attach focus / blur / keydown / click listeners
  // ----------------------------------------------------
  private attachListeners(target: HTMLElement, getText: () => string | null) {

    // Focus → show tooltip
    this.listeners.push(
      this.renderer.listen(target, 'focus', () => {
        const text = getText();
        if (text) this.showTooltip(target, text);
      })
    );

    // Blur → hide tooltip
    this.listeners.push(
      this.renderer.listen(target, 'blur', () => this.hideTooltip())
    );

    // ESC / ENTER → hide tooltip
    this.listeners.push(
      this.renderer.listen(target, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          this.hideTooltip();
        }
      })
    );

    // Click → hide tooltip
    this.listeners.push(
      this.renderer.listen(target, 'click', () => this.hideTooltip())
    );
  }

  // ----------------------------------------------------
  // Create + show tooltip
  // ----------------------------------------------------
  private showTooltip(target: HTMLElement, text: string) {
    this.hideTooltip(); // remove old tooltip

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'dynamic-tooltip');

    // Tooltip styles
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
  // Hide tooltip
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
  // Frame-synced tracking
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
  // Position tooltip (fixed + clamped + auto-flip)
  // ----------------------------------------------------
  private positionTooltip(target: HTMLElement, tooltip: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    // Auto-flip if no space below
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

  ngOnDestroy() {
    this.hideTooltip();
    this.listeners.forEach(fn => fn());
  }
}