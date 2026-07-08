import { useState, useEffect } from 'react'
import VoiceInput from '../components/VoiceInput.jsx'
import InvoiceTable from '../components/InvoiceTable.jsx'
import ProductNotFound from '../components/ProductNotFound.jsx'

function BillingPage() {
  const [invoice, setInvoice] = useState(null)
  const [missingProducts, setMissingProducts] = useState([])

  // On mount (page load, tab switch back, or refresh), fetch the most
  // recently saved invoice so it keeps showing instead of disappearing.
  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoices.length > 0) {
          setInvoice(data.invoices[0])
        }
      })
      .catch(() => {
        // Silently ignore — the billing form still works without this.
      })
  }, [])

  const handleInvoiceGenerated = (data) => {
    setInvoice(data)
    if (data.warnings?.not_found?.length > 0) {
      setMissingProducts(data.warnings.not_found)
    }
  }

  const handleMissingSubmit = async (productsWithPrices) => {
    for (const product of productsWithPrices) {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
    }
    setMissingProducts([])
  }

  return (
    <>
      <VoiceInput onInvoiceGenerated={handleInvoiceGenerated} />
      {invoice && <InvoiceTable invoice={invoice} />}
      {missingProducts.length > 0 && (
        <ProductNotFound
          missingProducts={missingProducts}
          onSubmit={handleMissingSubmit}
          onSkip={() => setMissingProducts([])}
        />
      )}
    </>
  )
}

export default BillingPage