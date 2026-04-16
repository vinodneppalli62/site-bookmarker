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
  let top = rect.bottom + 4; // below the element
  let left = rect.right - tooltipRect.width; // right-aligned

  // If bottom-right fits → ALWAYS USE IT
  if (left >= 0 && left + tooltipRect.width <= vw && top + tooltipRect.height <= vh) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // FALLBACK → BOTTOM-LEFT (only if right fails)
  // -----------------------------------------
  left = rect.left;
  if (left >= 0 && left + tooltipRect.width <= vw && top + tooltipRect.height <= vh) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // FALLBACK → TOP-RIGHT
  // -----------------------------------------
  top = rect.top - tooltipRect.height - 4;
  left = rect.right - tooltipRect.width;
  if (left >= 0 && left + tooltipRect.width <= vw && top >= 0) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // FALLBACK → TOP-LEFT
  // -----------------------------------------
  left = rect.left;
  if (left >= 0 && left + tooltipRect.width <= vw && top >= 0) {
    return this.place(top, left);
  }

  // -----------------------------------------
  // FINAL CLAMP (never off-screen)
  // -----------------------------------------
  top = Math.max(0, Math.min(top, vh - tooltipRect.height));
  left = Math.max(0, Math.min(left, vw - tooltipRect.width));

  this.place(top, left);
}