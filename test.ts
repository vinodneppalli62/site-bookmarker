app.directive('tooltipDir', [
  '$document',
  '$window',
  '$timeout',
  function($document, $window, $timeout) {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        var tooltipEl = null;
        var animationFrameId = null;

        // ----------------------------------------------------
        // Skip hidden or aria-hidden internal elements
        // ----------------------------------------------------
        if (element.attr('aria-hidden') === 'true' || element[0].offsetParent === null) {
          return;
        }

        // ----------------------------------------------------
        // Make non-focusable elements focusable
        // ----------------------------------------------------
        var tag = element[0].tagName.toLowerCase();
        var isNaturallyFocusable =
          tag === 'button' ||
          tag === 'a' ||
          tag === 'input' ||
          tag === 'select' ||
          tag === 'textarea';

        if (!isNaturallyFocusable && !element.attr('tabindex')) {
          element.attr('tabindex', '0');
        }

        // ----------------------------------------------------
        // Attach listeners to this element
        // ----------------------------------------------------
        attachListeners(element, function() {
          return extractTooltipText(element);
        });

        // ----------------------------------------------------
        // Special case: Quest/PrimeNG dropdown trigger
        // ----------------------------------------------------
        var trigger = element[0].querySelector('.quest-dropdown-trigger');
        if (trigger) {
          attachListeners(angular.element(trigger), function() {
            return extractTooltipText(element);
          });
        }

        // ----------------------------------------------------
        // Extract tooltip text from deep DOM
        // ----------------------------------------------------
        function extractTooltipText(root) {
          var direct = root.attr('title') || root.attr('aria-label');
          if (direct) return direct;

          var withTitle = root[0].querySelector('[title]');
          if (withTitle) return withTitle.getAttribute('title');

          var withAria = root[0].querySelector('[aria-label]');
          if (withAria) return withAria.getAttribute('aria-label');

          var sr = root[0].querySelector('.sr-only');
          if (sr && sr.textContent && sr.textContent.trim()) {
            return sr.textContent.trim();
          }

          var visible = root[0].querySelector('*:not([aria-hidden="true"])');
          if (visible && visible.textContent && visible.textContent.trim()) {
            return visible.textContent.trim();
          }

          return null;
        }

        // ----------------------------------------------------
        // Attach focus / blur / click / keydown listeners
        // ----------------------------------------------------
        function attachListeners(target, getTextFn) {

          target.on('focus', function() {
            var text = getTextFn();
            if (text) showTooltip(target, text);
          });

          target.on('blur', function() {
            hideTooltip();
          });

          target.on('keydown', function(evt) {
            if (evt.key === 'Escape' || evt.key === 'Enter') {
              hideTooltip();
            }
          });

          target.on('click', function() {
            hideTooltip();
          });
        }

        // ----------------------------------------------------
        // Show tooltip
        // ----------------------------------------------------
        function showTooltip(target, text) {
          hideTooltip();

          tooltipEl = angular.element('<div class="dynamic-tooltip"></div>');
          tooltipEl.css({
            position: 'fixed',
            'z-index': 999999,
            background: '#222',
            color: '#fff',
            padding: '6px 10px',
            'border-radius': '4px',
            'white-space': 'nowrap',
            opacity: 0,
            transition: 'opacity .15s ease'
          });

          tooltipEl.text(text);
          $document.find('body').append(tooltipEl);

          startTracking(target);

          $timeout(function() {
            tooltipEl.css('opacity', 1);
          }, 10);
        }

        // ----------------------------------------------------
        // Hide tooltip
        // ----------------------------------------------------
        function hideTooltip() {
          if (animationFrameId) {
            $window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }

          if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
          }
        }

        // ----------------------------------------------------
        // Frame-synced tracking
        // ----------------------------------------------------
        function startTracking(target) {
          function update() {
            if (!tooltipEl) return;
            positionTooltip(target, tooltipEl);
            animationFrameId = $window.requestAnimationFrame(update);
          }
          update();
        }

        // ----------------------------------------------------
        // Position tooltip (auto-flip + clamping)
        // ----------------------------------------------------
        function positionTooltip(target, tooltip) {
          var rect = target[0].getBoundingClientRect();
          var tipRect = tooltip[0].getBoundingClientRect();

          var top = rect.bottom + 8;
          var left = rect.left + rect.width / 2 - tipRect.width / 2;

          if (rect.top >= tipRect.height + 8) {
            top = rect.top - tipRect.height - 8;
          }

          if (left < 4) left = 4;
          if (left + tipRect.width > $window.innerWidth - 4) {
            left = $window.innerWidth - tipRect.width - 4;
          }

          if (top < 4) top = 4;
          if (top + tipRect.height > $window.innerHeight - 4) {
            top = $window.innerHeight - tipRect.height - 4;
          }

          tooltip.css({
            top: top + 'px',
            left: left + 'px'
          });
        }

      }
    };
  }
]);