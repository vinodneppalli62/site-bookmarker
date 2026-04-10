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

  private tooltipEl!: HTMLElement;

  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    this.createTooltip();
  }

  ngOnDestroy() {
    if (this.tooltipEl) this.tooltipEl.remove();
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
    this.positionTooltip();
  }

  @HostListener('blur')
  onBlur() {
    this.tooltipEl.classList.remove('show');
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onLayoutChange() {
    if (this.tooltipEl.classList.contains('show')) {
      this.positionTooltip();
    }
  }

  private positionTooltip() {
    const trigger = this.host.nativeElement;
    const tRect = trigger.getBoundingClientRect();
    const pRect = this.tooltipEl.getBoundingClientRect();

    const space = {
      top: tRect.top,
      bottom: window.innerHeight - tRect.bottom,
      left: tRect.left,
      right: window.innerWidth - tRect.right
    };

    const fits = {
      top: space.top >= pRect.height + 10,
      bottom: space.bottom >= pRect.height + 10,
      left: space.left >= pRect.width + 10,
      right: space.right >= pRect.width + 10
    };

    let direction = 'bottom';
    if (fits.top) direction = 'top';
    else if (fits.bottom) direction = 'bottom';
    else if (fits.left) direction = 'left';
    else if (fits.right) direction = 'right';
    else {
      direction = Object.entries(space).sort((a, b) => b[1] - a[1])[0][0];
    }

    this.tooltipEl.classList.remove('top', 'bottom', 'left', 'right');
    this.tooltipEl.classList.add(direction);

    let top = 0, left = 0;

    switch (direction) {
      case 'top':
        top = tRect.top - pRect.height - 8;
        left = tRect.left + tRect.width / 2 - pRect.width / 2;
        break;
      case 'bottom':
        top = tRect.bottom + 8;
        left = tRect.left + tRect.width / 2 - pRect.width / 2;
        break;
      case 'left':
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
        left = tRect.left - pRect.width - 8;
        break;
      case 'right':
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
        left = tRect.right + 8;
        break;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }
}

.smart-tooltip {
  position: absolute;
  z-index: 99999;
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 240px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .15s ease;
}

.smart-tooltip.show {
  opacity: 1;
}

.smart-tooltip.top { transform-origin: bottom center; }
.smart-tooltip.bottom { transform-origin: top center; }
.smart-tooltip.left { transform-origin: center right; }
.smart-tooltip.right { transform-origin: center left; }