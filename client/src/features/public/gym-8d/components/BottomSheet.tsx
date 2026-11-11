import React from 'react';
import { SvgIcon } from './Icons';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="g8d-sheet-backdrop" onClick={onClose}>
      <div className="g8d-sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="g8d-sheet-handle" />
        {(title || subtitle) && (
          <div className="g8d-sheet-header">
            <div>
              {title && <h3 className="g8d-sheet-title">{title}</h3>}
              {subtitle && <div className="g8d-sheet-sub">{subtitle}</div>}
            </div>
            <button type="button" className="g8d-icon-close" onClick={onClose} aria-label="Đóng">
              <SvgIcon name="x" size={16} />
            </button>
          </div>
        )}
        <div className="g8d-sheet-body">{children}</div>
      </div>
    </div>
  );
};
