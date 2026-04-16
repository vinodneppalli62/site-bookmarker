private positionTooltip(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  // Make tooltip measurable
  this.renderer.setStyle(this.tooltipEl, 'visibility', 'hidden');
  this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

  const rect = anchor.getBoundingClientRect();
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try 4 corners in order

  // 1. bottom-right
  let top = rect.bottom + 4;
  let left = rect.right - tooltipRect.width;
  if (this.fits(top, left, tooltipRect, vw, vh)) return this.place(top, left);

  // 2. bottom-left
  left = rect.left;
  if (this.fits(top, left, tooltipRect, vw, vh)) return this.place(top, left);

  // 3. top-right
  top = rect.top - tooltipRect.height - 4;
  left = rect.right - tooltipRect.width;
  if (this.fits(top, left, tooltipRect, vw, vh)) return this.place(top, left);

  // 4. top-left
  left = rect.left;
  if (this.fits(top, left, tooltipRect, vw, vh)) return this.place(top, left);

  // 5. clamp to screen
  top = Math.max(0, Math.min(top, vh - tooltipRect.height));
  left = Math.max(0, Math.min(left, vw - tooltipRect.width));

  this.place(top, left);
}

private fits(top: number, left: number, tooltipRect: DOMRect, vw: number, vh: number): boolean {
  return (
    top >= 0 &&
    left >= 0 &&
    top + tooltipRect.height <= vh &&
    left + tooltipRect.width <= vw
  );
}

private place(top: number, left: number): void {
  this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
  this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  this.renderer.setStyle(this.tooltipEl, 'visibility', 'visible');
}