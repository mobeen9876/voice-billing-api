import { useState } from 'react'
import styles from './ProductNotFound.module.css'

function ProductNotFound({ missingProducts = [], onSubmit, onSkip }) {
  const [prices, setPrices] = useState(
    missingProducts.reduce((acc, _, i) => ({ ...acc, [i]: '' }), {})
  )

  const handleChange = (index, value) =>
    setPrices((prev) => ({ ...prev, [index]: value }))

  const handleSubmit = () => {
    const result = missingProducts.map((product, i) => ({
      ...product,
      price: parseFloat(prices[i]) || 0,
    }))
    if (onSubmit) onSubmit(result)
  }

  const allFilled = missingProducts.every((_, i) => prices[i] && prices[i] > 0)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>⚠️</span>
          <h3 className={styles.title}>Products Not Found</h3>
        </div>
        <p className={styles.subtitle}>
          These products are not in the database. Enter their selling price to create them.
        </p>

        <div className={styles.items}>
          {missingProducts.map((product, index) => (
            <div className={styles.item} key={index}>
              <span className={styles.itemName}>
                {[product.brand, product.model, product.category].filter(Boolean).join(' ')}
              </span>
              <div className={styles.itemPrice}>
                <span className={styles.prefix}>Rs.</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Enter price"
                  value={prices[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={onSkip}>Skip</button>
          <button className={styles.createBtn} onClick={handleSubmit} disabled={!allFilled}>
            Create & Add to Bill
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductNotFound
