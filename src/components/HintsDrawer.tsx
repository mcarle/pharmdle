import React, { useMemo } from 'react';

interface HintsDrawerProps {
  hints: Record<string, string[]> | null;
  open: boolean;
  onToggle: () => void;
  revealedHints: Set<string>;
  onReveal: (hintKey: string) => void;
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

const HintsDrawer = ({ hints, open, onToggle, revealedHints, onReveal }: HintsDrawerProps) => {
  const availableHints = useMemo(() => {
    if (!hints) return [];
    return HINT_ORDER.filter((key) => hints[key]?.length > 0);
  }, [hints]);

  if (!hints) return null;

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
          {HINT_ORDER.map((key) => {
            const hasData = hints[key]?.length > 0;
            return (
              <div className="hint-row" key={key}>
                <span className="hint-label">{HINT_LABELS[key]}</span>
                {revealedHints.has(key) ? (
                  <span className="hint-value">{hints[key].join(', ')}</span>
                ) : (
                  <button
                    className="hint-reveal-btn"
                    onClick={() => onReveal(key)}
                    disabled={!hasData}
                  >
                    {hasData ? 'Reveal' : 'Unavailable'}
                  </button>
                )}
              </div>
            );
          })}
          <p className="hints-note">
            Not all hints are available for every drug.
          </p>
        </div>
      </div>
    </>
  );
};

export default HintsDrawer;
