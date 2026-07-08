import { useState } from 'react'
import VoiceInput from '../components/VoiceInput.jsx'
import InvoiceTable from '../components/InvoiceTable.jsx'
import ProductNotFound from '../components/ProductNotFound.jsx'

function BillingPage() {
  const [invoice, setInvoice] = useState(null)
  const [missingProducts, setMissingProducts] = useState([])

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
