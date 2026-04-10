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
  private animationFrameId: number | null = null;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.createTooltip();
  }

  ngOnDestroy() {
    if (this.tooltipEl) this.tooltipEl.remove();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private createTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'smart-tooltip';
    this.tooltipEl.innerText = this.tooltipText;
    document.body.appendChild(this.tooltipEl);
  }

  @HostListener('focus')
  onFocus() {
    this.tooltipEl.classList.add('show');
    this.startTracking();
  }

  @HostListener('blur')
  onBlur() {
    this.tooltipEl.classList.remove('show');
    this.stopTracking();
  }

  private startTracking() {
    const update = () => {
      if (this.tooltipEl.classList.contains('show')) {
        this.positionTooltip();
        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    update();
  }

  private stopTracking() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private positionTooltip() {
    const trigger = this.host.nativeElement;
    const tRect = trigger.getBoundingClientRect();

    this.tooltipEl.style.visibility = 'hidden';
    this.tooltipEl.style.display = 'block';

    const pRect = this.tooltipEl.getBoundingClientRect();

    const spaceTop = tRect.top;
    const spaceBottom = window.innerHeight - tRect.bottom;

    let direction: 'top' | 'bottom' = 'bottom';
    if (spaceTop >= pRect.height + 8) direction = 'top';
    else if (spaceBottom >= pRect.height + 8) direction = 'bottom';
    else direction = spaceTop > spaceBottom ? 'top' : 'bottom';

    this.tooltipEl.classList.remove('top', 'bottom');
    this.tooltipEl.classList.add(direction);

    let top = 0;
    let left = tRect.left + tRect.width / 2 - pRect.width / 2;

    if (direction === 'top') {
      top = tRect.top - pRect.height - 8;
    } else {
      top = tRect.bottom + 8;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left < 4) left = 4;
    if (left + pRect.width > vw - 4) left = vw - pRect.width - 4;

    if (top < 4) top = 4;
    if (top + pRect.height > vh - 4) top = vh - pRect.height - 4;

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;

    this.tooltipEl.style.visibility = 'visible';
  }
}