private positionTooltip(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  this.renderer.setStyle(this.tooltipEl, 'visibility', 'hidden');
  this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

  const rect = anchor.getBoundingClientRect();
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // -----------------------------------------
  // 1. ALWAYS TRY BOTTOM-RIGHT FIRST
  // -----------------------------------------
  let top = rect.bottom + 4;
  let left = rect.right;

  // If tooltip fits on screen when placed to the right
  if (left + tooltipRect.width <= vw) {
    left = rect.right - tooltipRect.width; // align to right edge
    return this.place(top, left);
  }

  // -----------------------------------------
  // 2. FALLBACK → BOTTOM-LEFT
  // -----------------------------------------
  left = rect.left;
  if (left >= 0 && left + tooltipRect.width <= vw) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 3. FALLBACK → TOP-RIGHT
  // -----------------------------------------
  top = rect.top - tooltipRect.height - 4;
  left = rect.right;
  if (left + tooltipRect.width <= vw && top >= 0) {
    left = rect.right - tooltipRect.width;
    return this.place(top, left);
  }

  // -----------------------------------------
  // 4. FALLBACK → TOP-LEFT
  // -----------------------------------------
  left = rect.left;
  if (left >= 0 && left + tooltipRect.width <= vw && top >= 0) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // 5. FINAL CLAMP
  // -----------------------------------------
  top = Math.max(0, Math.min(top, vh - tooltipRect.height));
  left = Math.max(0, Math.min(left, vw - tooltipRect.width));

  this.place(top, left);
}