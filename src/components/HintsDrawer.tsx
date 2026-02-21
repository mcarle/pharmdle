import React, { useState, useMemo } from 'react';

interface HintsDrawerProps {
  hints: Record<string, string[]> | null;
  open: boolean;
  onToggle: () => void;
  onReveal: (count: number) => void;
}

const HINT_LABELS: Record<string, string> = {
  product_type: 'Product Type',
  route: 'Route',
  dosage_form: 'Dosage Form',
  marketing_status: 'Marketing Status',
  pharm_class_epc: 'Pharm Class (EPC)',
  pharm_class_moa: 'Pharm Class (MOA)',
};

const HINT_ORDER = [
  'route',
  'dosage_form',
  'product_type',
  'marketing_status',
  'pharm_class_epc',
  'pharm_class_moa',
];

const HintsDrawer = ({ hints, open, onToggle, onReveal }: HintsDrawerProps) => {
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  const availableHints = useMemo(() => {
    if (!hints) return [];
    return HINT_ORDER.filter((key) => hints[key]?.length > 0);
  }, [hints]);

  if (!hints) return null;

  const handleReveal = (key: string) => {
    const updated = new Set(revealedHints);
    updated.add(key);
    setRevealedHints(updated);
    onReveal(updated.size);
  };

  const revealedCount = revealedHints.size;
  const totalCount = availableHints.length;

  return (
    <>
      <div className="hints-btn-container">
        <button className="hints-btn" onClick={onToggle}>
          Hints{totalCount > 0 ? ` (${revealedCount}/${totalCount})` : ''}
        </button>
      </div>

      {open && <div className="hints-drawer-overlay" onClick={onToggle} />}

      <div className={`hints-drawer ${open ? 'open' : ''}`}>
        <div className="hints-drawer-header">
          <span>Hints</span>
          <button className="hints-drawer-close" onClick={onToggle}>
            &times;
          </button>
        </div>
        <div className="hints-drawer-body">
          {availableHints.map((key) => (
            <div className="hint-row" key={key}>
              <span className="hint-label">{HINT_LABELS[key]}</span>
              {revealedHints.has(key) ? (
                <span className="hint-value">{hints[key].join(', ')}</span>
              ) : (
                <button
                  className="hint-reveal-btn"
                  onClick={() => handleReveal(key)}
                >
                  Reveal
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HintsDrawer;
