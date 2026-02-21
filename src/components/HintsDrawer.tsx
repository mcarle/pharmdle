import React from 'react';

interface HintsDrawerProps {
  hints: Record<string, string[]> | null;
  open: boolean;
  onToggle: () => void;
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

const HintsDrawer = ({ hints, open, onToggle }: HintsDrawerProps) => {
  if (!hints) return null;

  return (
    <>
      <div className="hints-btn-container">
        <button className="hints-btn" onClick={onToggle}>
          Hints
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
          {HINT_ORDER.map((key) => (
            <div className="hint-row" key={key}>
              <span className="hint-label">{HINT_LABELS[key]}</span>
              <span className="hint-value">
                {hints[key]?.length ? hints[key].join(', ') : '\u2014'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HintsDrawer;
