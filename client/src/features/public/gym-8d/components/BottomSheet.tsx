import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SvgIcon } from './Icons';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

interface DragSample {
  y: number;
  t: number;
}

const SHEET_CURVE = 'cubic-bezier(0.32, 0.72, 0, 1)';

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
}) => {
  const [rendered, setRendered] = useState<boolean>(open);
  const [entered, setEntered] = useState<boolean>(false);

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startY: number;
    currentY: number;
    panelHeight: number;
    samples: DragSample[];
  } | null>(null);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setEntered(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else if (rendered) {
      setEntered(false);
      const timer = window.setTimeout(() => {
        setRendered(false);
      }, 280);
      return () => window.clearTimeout(timer);
    }
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rendered, onClose]);

  if (!rendered) return null;

  const resetInlineStyles = () => {
    if (panelRef.current) {
      panelRef.current.style.transition = '';
      panelRef.current.style.transform = '';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = '';
      backdropRef.current.style.opacity = '';
    }
  };

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, input, textarea, select, a, [data-no-sheet-drag]')) {
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const now = performance.now();
    dragStateRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      currentY: 0,
      panelHeight: Math.max(240, panel.getBoundingClientRect().height),
      samples: [{ y: e.clientY, t: now }],
    };

    panel.style.transition = 'none';
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
    }
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragStateRef.current;
    if (!st || st.pointerId !== e.pointerId || !panelRef.current) return;

    const rawDy = e.clientY - st.startY;
    const dampedDy = rawDy < 0 ? rawDy * 0.18 : rawDy;
    st.currentY = rawDy;

    const now = performance.now();
    st.samples.push({ y: e.clientY, t: now });
    while (st.samples.length > 6 && now - st.samples[0].t > 100) {
      st.samples.shift();
    }

    panelRef.current.style.transform = `translate3d(0, ${dampedDy}px, 0)`;
    if (backdropRef.current) {
      const progress = Math.max(0, Math.min(1, Math.max(0, rawDy) / st.panelHeight));
      backdropRef.current.style.opacity = String(1 - progress * 0.92);
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const st = dragStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    dragStateRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const first = st.samples[0];
    const last = st.samples[st.samples.length - 1];
    const dtMs = last && first ? Math.max(1, last.t - first.t) : 16;
    const velocityPxPerSec = last && first ? ((last.y - first.y) / dtMs) * 1000 : 0;

    const distanceThreshold = Math.min(130, st.panelHeight * 0.32);
    const shouldDismiss =
      !cancelled && (st.currentY > distanceThreshold || (st.currentY > 24 && velocityPxPerSec > 520));

    if (shouldDismiss) {
      if (panelRef.current) {
        panelRef.current.style.transition = `transform 250ms ${SHEET_CURVE}`;
        panelRef.current.style.transform = 'translate3d(0, 104%, 0)';
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = `opacity 250ms ${SHEET_CURVE}`;
        backdropRef.current.style.opacity = '0';
      }
      window.setTimeout(() => {
        resetInlineStyles();
        onClose();
      }, 220);
    } else {
      if (panelRef.current) {
        panelRef.current.style.transition = `transform 320ms ${SHEET_CURVE}`;
        panelRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = `opacity 320ms ${SHEET_CURVE}`;
        backdropRef.current.style.opacity = '1';
      }
      window.setTimeout(resetInlineStyles, 330);
    }
  };

  const portalTarget =
    typeof document !== 'undefined'
      ? document.querySelector('.g8d-shell') || document.body
      : null;

  const sheetContent = (
    <div
      ref={backdropRef}
      className={`g8d-sheet-backdrop ${entered ? 'is-open' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={`g8d-sheet-panel ${entered ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bảng tuỳ chọn'}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="g8d-sheet-dragzone"
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={(e) => finishDrag(e, false)}
          onPointerCancel={(e) => finishDrag(e, true)}
        >
          <div className="g8d-sheet-handle" aria-hidden="true" />
          {(title || subtitle) && (
            <div className="g8d-sheet-header">
              <div style={{ minWidth: 0 }}>
                {title && <h3 className="g8d-sheet-title">{title}</h3>}
                {subtitle && <div className="g8d-sheet-sub">{subtitle}</div>}
              </div>
              <button
                type="button"
                className="g8d-icon-close"
                onClick={onClose}
                aria-label="Đóng bảng"
              >
                <SvgIcon name="x" size={17} strokeWidth={2.3} />
              </button>
            </div>
          )}
        </div>
        <div className="g8d-sheet-body">{children}</div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(sheetContent, portalTarget) : sheetContent;
};
