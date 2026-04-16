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
  // ALWAYS TRY BOTTOM-RIGHT FIRST
  // -----------------------------------------
  let top = rect.bottom + 4;
  let left = rect.right - tooltipRect.width;

  // If bottom-right fits anywhere on screen → ALWAYS USE IT
  if (left + tooltipRect.width <= vw) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // ONLY IF RIGHT IS IMPOSSIBLE → SHIFT LEFT JUST ENOUGH
  // -----------------------------------------
  left = vw - tooltipRect.width - 4; // align to screen right
  if (left >= 0) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // LAST RESORT → CLAMP
  // -----------------------------------------
  top = Math.max(0, Math.min(top, vh - tooltipRect.height));
  left = Math.max(0, Math.min(left, vw - tooltipRect.width));

  this.place(top, left);
}