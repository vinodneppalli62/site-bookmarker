private positionTooltip(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  // Make tooltip measurable
  this.renderer.setStyle(this.tooltipEl, 'visibility', 'hidden');
  this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

  const rect = anchor.getBoundingClientRect();
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // -----------------------------------------
  // ALWAYS POSITION TOOLTIP TO THE RIGHT SIDE
  // -----------------------------------------

  // Position tooltip to the right of the element
  let left = rect.right + 8; // 8px gap
  let top = rect.top;        // align to top of element

  // If tooltip goes off the right edge → shift left just enough
  if (left + tooltipRect.width > vw) {
    left = vw - tooltipRect.width - 8;
  }

  // If tooltip goes off the bottom → clamp
  if (top + tooltipRect.height > vh) {
    top = vh - tooltipRect.height - 8;
  }

  // If tooltip goes above screen → clamp
  if (top < 0) {
    top = 8;
  }

  this.place(top, left);
}