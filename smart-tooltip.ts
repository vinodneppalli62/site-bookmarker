import {
  Directive,
  ElementRef,
  Input,
  HostListener,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[smartTooltip]'
})
export class SmartTooltipDirective implements AfterViewInit, OnDestroy {

  @Input('smartTooltip') tooltipText = '';

  private tooltipEl!: HTMLDivElement;
  private scrollParents: HTMLElement[] = [];
  private scrollHandlers: Array<() => void> = [];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.createTooltip();
    this.findScrollParents(this.host.nativeElement);
    this.attachScrollListeners();
  }

  ngOnDestroy() {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
    }
    this.detachScrollListeners();
  }

  private createTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'smart-tooltip';
    this.tooltipEl.innerText = this.tooltipText;
    document.body.appendChild(this.tooltipEl);
  }

  private findScrollParents(el: HTMLElement) {
    let parent = el.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;

      if (/(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflowX)) {
        this.scrollParents.push(parent);
      }
      parent = parent.parentElement;
    }
  }

  private attachScrollListeners() {
    this.scrollParents.forEach(parent => {
      const handler = () => {
        if (this.tooltipEl.classList.contains('show')) {
          this.positionTooltip();
        }
      };
      parent.addEventListener('scroll', handler);
      this.scrollHandlers.push(() => parent.removeEventListener('scroll', handler));
    });
  }

  private detachScrollListeners() {
    this.scrollHandlers.forEach(fn => fn());
    this.scrollHandlers = [];
  }

  @HostListener('focus')
  onFocus() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.add('show');
    this.positionTooltip();
  }

  @HostListener('blur')
  onBlur() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove('show');
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onLayoutChange() {
    if (this.tooltipEl && this.tooltipEl.classList.contains('show')) {
      this.positionTooltip();
    }
  }

  private positionTooltip() {
    const trigger = this.host.nativeElement;
    const tRect = trigger.getBoundingClientRect();

    // Make tooltip visible to measure correctly
    this.tooltipEl.style.visibility = 'hidden';
    this.tooltipEl.style.display = 'block';

    const pRect = this.tooltipEl.getBoundingClientRect();

    const spaceTop = tRect.top;
    const spaceBottom = window.innerHeight - tRect.bottom;

    let direction: 'top' | 'bottom' = 'bottom';
    if (spaceTop >= pRect.height + 8) {
      direction = 'top';
    } else if (spaceBottom >= pRect.height + 8) {
      direction = 'bottom';
    } else {
      direction = spaceTop > spaceBottom ? 'top' : 'bottom';
    }

    this.tooltipEl.classList.remove('top', 'bottom');
    this.tooltipEl.classList.add(direction);

    let top = 0;
    let left = tRect.left + tRect.width / 2 - pRect.width / 2;

    if (direction === 'top') {
      top = tRect.top - pRect.height - 8;
    } else {
      top = tRect.bottom + 8;
    }

    // Viewport boundaries
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal clamp
    if (left < 4) {
      left = 4;
    }
    if (left + pRect.width > vw - 4) {
      left = vw - pRect.width - 4;
    }

    // Vertical clamp
    if (top < 4) {
      top = 4;
    }
    if (top + pRect.height > vh - 4) {
      top = vh - pRect.height - 4;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;

    this.tooltipEl.style.visibility = 'visible';
  }
}