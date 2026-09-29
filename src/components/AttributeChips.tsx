interface AttributeChipsProps {
  availableAttributes: string[];
  selectedAttributes: string[];
  fetchAllAttributes: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleAttribute: (key: string) => void;
}

export const AttributeChips = ({
  availableAttributes,
  selectedAttributes,
  fetchAllAttributes,
  onToggleAll,
  onToggleAttribute,
}: AttributeChipsProps) => {
  if (availableAttributes.length === 0) {
    return null;
  }

  return (
    <div className="filter-bar">
      <div className="control-panel__header">
        <span className="filter-bar__label">Filter Attributes</span>
        <label className="form-label" htmlFor="toggle-all-attrs">
          <input
            id="toggle-all-attrs"
            type="checkbox"
            checked={fetchAllAttributes}
            onChange={(e) => onToggleAll(e.target.checked)}
          />{' '}
          Show All
        </label>
      </div>

      {!fetchAllAttributes && (
        <div className="filter-chips animate-fade-in">
          {availableAttributes.map((attr) => {
            const isSelected = selectedAttributes.includes(attr);
            return (
              <button
                key={attr}
                type="button"
                onClick={() => onToggleAttribute(attr)}
                className={`filter-chip attribute-chip ${isSelected ? 'filter-chip--active' : ''}`}
                aria-pressed={isSelected}
              >
                {attr}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
