private positionTooltip(anchor: HTMLElement): void {
  if (!this.tooltipEl) return;

  // Make tooltip measurable
  this.renderer.setStyle(this.tooltipEl, 'visibility', 'hidden');
  this.renderer.setStyle(this.tooltipEl, 'opacity', '1');

  const rect = anchor.getBoundingClientRect();
  const tooltipRect = this.tooltipEl.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // ----------------------------------------------------
  // 1. ALWAYS TRY TRUE BOTTOM-RIGHT (entire tooltip right)
  // ----------------------------------------------------
  let top = rect.bottom + 4; // below element
  let left = rect.right;     // tooltip starts exactly at right edge

  // If tooltip fits fully on screen → ALWAYS USE THIS
  if (left + tooltipRect.width <= vw && top + tooltipRect.height <= vh) {
    return this.place(top, left);
  }

  // ----------------------------------------------------
  // 2. If it overflows right, shift left JUST ENOUGH
  //    (still bottom-right relative to screen)
  // ----------------------------------------------------
  left = vw - tooltipRect.width - 4;
  if (left >= rect.right) {
    return this.place(top, left);
  }

  // ----------------------------------------------------
  // 3. If bottom doesn't fit, try TOP-RIGHT
  // ----------------------------------------------------
  top = rect.top - tooltipRect.height - 4;
  left = rect.right;
  if (top >= 0 && left + tooltipRect.width <= vw) {
    return this.place(top, left);
  }

  // ----------------------------------------------------
  // 4. If top-right overflows, shift left just enough
  // ----------------------------------------------------
  left = vw - tooltipRect.width - 4;
  if (top >= 0) {
    return this.place(top, left);
  }

  // ----------------------------------------------------
  // 5. FINAL CLAMP (never off-screen)
  // ----------------------------------------------------
  top = Math.max(0, Math.min(top, vh - tooltipRect.height));
  left = Math.max(0, Math.min(left, vw - tooltipRect.width));

  this.place(top, left);
}