'use client';

import { useEffect } from 'react';
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import 'mobile-drag-drop/default.css';

export default function DnDPolyfill() {
  useEffect(() => {
    // Force the polyfill on touch devices
    polyfill({
      dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
    });
    
    // Prevent default touch behaviors like scrolling when trying to drag
    window.addEventListener('touchmove', function() {}, {passive: false});
  }, []);

  return null;
}
