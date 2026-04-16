private applyTooltipStyle(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  const rect = anchor.getBoundingClientRect();
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // -----------------------------------------
  // 1. DEFAULT POSITION → bottom-right
  // -----------------------------------------
  let top = rect.bottom + 8;
  let left = rect.right - tooltipRect.width;

  // Check if bottom-right fits
  if (top + tooltipRect.height <= vh - 8 && left >= 8 && left + tooltipRect.width <= vw - 8) {
    this.setTooltipPosition(top, left);
    return;
  }

  // -----------------------------------------
  // 2. FALLBACK → bottom-left
  // -----------------------------------------
  left = rect.left;

  if (top + tooltipRect.height <= vh - 8 && left >= 8 && left + tooltipRect.width <= vw - 8) {
    this.setTooltipPosition(top, left);
    return;
  }

  // -----------------------------------------
  // 3. FALLBACK → top-right
  // -----------------------------------------
  top = rect.top - tooltipRect.height - 8;
  left = rect.right - tooltipRect.width;

  if (top >= 8 && left >= 8 && left + tooltipRect.width <= vw - 8) {
    this.setTooltipPosition(top, left);
    return;
  }

  // -----------------------------------------
  // 4. FALLBACK → top-left
  // -----------------------------------------
  left = rect.left;

  if (top >= 8 && left >= 8 && left + tooltipRect.width <= vw - 8) {
    this.setTooltipPosition(top, left);
    return;
  }

  // -----------------------------------------
  // 5. FINAL CLAMP (if all else fails)
  // -----------------------------------------
  top = Math.max(8, Math.min(top, vh - tooltipRect.height - 8));
  left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));

  this.setTooltipPosition(top, left);
}
private setTooltipPosition(top: number, left: number): void {
  this.renderer.setStyle(this.tooltipEl!, 'top', `${top}px`);
  this.renderer.setStyle(this.tooltipEl!, 'left', `${left}px`);
}