import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import BillingPage from './pages/BillingPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"         element={<BillingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/history"  element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
