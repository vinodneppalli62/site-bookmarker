private applyTooltipStyle(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  // Force tooltip to be measurable
  this.renderer.setStyle(this.tooltipEl, 'visibility', 'hidden');
  this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

  const rect = anchor.getBoundingClientRect();

  // Now tooltip has content → measure AFTER text applied
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // -----------------------------------------
  // 1. DEFAULT → bottom-right
  // -----------------------------------------
  let top = rect.bottom + 8;
  let left = rect.right - tooltipRect.width;

  if (this.fits(top, left, tooltipRect, vw, vh)) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 2. FALLBACK → bottom-left
  // -----------------------------------------
  left = rect.left;

  if (this.fits(top, left, tooltipRect, vw, vh)) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 3. FALLBACK → top-right
  // -----------------------------------------
  top = rect.top - tooltipRect.height - 8;
  left = rect.right - tooltipRect.width;

  if (this.fits(top, left, tooltipRect, vw, vh)) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 4. FALLBACK → top-left
  // -----------------------------------------
  left = rect.left;

  if (this.fits(top, left, tooltipRect, vw, vh)) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 5. FINAL CLAMP (last resort)
  // -----------------------------------------
  top = Math.max(8, Math.min(top, vh - tooltipRect.height - 8));
  left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));

  this.place(top, left);
}

private fits(
  top: number,
  left: number,
  tooltipRect: DOMRect,
  vw: number,
  vh: number
): boolean {
  return (
    top >= 8 &&
    left >= 8 &&
    top + tooltipRect.height <= vh - 8 &&
    left + tooltipRect.width <= vw - 8
  );
}

private place(top: number, left: number): void {
  this.renderer.setStyle(this.tooltipEl!, 'top', `${top}px`);
  this.renderer.setStyle(this.tooltipEl!, 'left', `${left}px`);
  this.renderer.setStyle(this.tooltipEl!, 'visibility', 'visible');
}