import React, { useState } from 'react';
import './ProductNotFound.css';

// Sample static data — will be replaced with real data later
const SAMPLE_MISSING = [
  { brand: 'Samsung', model: 'A15', category: 'Glass' },
  { category: 'Earphones' },
];

function ProductNotFound({ missingProducts = SAMPLE_MISSING, onSubmit, onSkip }) {
  const [prices, setPrices] = useState(
    missingProducts.reduce((acc, _, i) => ({ ...acc, [i]: '' }), {})
  );

  const handlePriceChange = (index, value) => {
    setPrices((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const result = missingProducts.map((product, i) => ({
      ...product,
      price: parseFloat(prices[i]) || 0,
    }));
    if (onSubmit) onSubmit(result);
  };

  const allFilled = missingProducts.every((_, i) => prices[i] && prices[i] > 0);

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        {/* Header */}
        <div className="modal-header">
          <span className="modal-icon">⚠️</span>
          <h3 className="modal-title">Products Not Found</h3>
        </div>
        <p className="modal-subtitle">
          These products are not in the database. Enter their selling price to create them.
        </p>

        {/* Product rows */}
        <div className="modal-items">
          {missingProducts.map((product, index) => (
            <div className="modal-item" key={index}>
              <div className="modal-item-name">
                {[product.brand, product.model, product.category]
                  .filter(Boolean)
                  .join(' ')}
              </div>
              <div className="modal-item-price">
                <span className="price-prefix">Rs.</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="Enter price"
                  value={prices[index]}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn-skip" onClick={onSkip}>
            Skip
          </button>
          <button
            className="btn-create"
            onClick={handleSubmit}
            disabled={!allFilled}
          >
            Create & Add to Bill
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductNotFound;
