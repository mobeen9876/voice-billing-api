import React, { useState } from 'react';
import './App.css';
import VoiceInput      from './components/VoiceInput';
import InvoiceTable    from './components/InvoiceTable';
import ProductNotFound from './components/ProductNotFound';
import ProductList     from './components/ProductList';
import InvoiceHistory  from './components/InvoiceHistory';

function App() {
  const [activeTab, setActiveTab] = useState('billing');
  const [showModal, setShowModal] = useState(false); // demo only

  const tabs = [
    { id: 'billing',  label: '🎙️ Billing'  },
    { id: 'products', label: '📦 Products' },
    { id: 'history',  label: '📋 History'  },
  ];

  return (
    <div className="app-container">

      {/* Top Nav */}
      <nav className="app-nav">
        <span className="app-brand">Voice Billing AI</span>
        <div className="app-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`app-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">

        {activeTab === 'billing' && (
          <>
            <VoiceInput />
            <InvoiceTable />

            {/* Demo button to preview the modal */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => setShowModal(true)}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Preview: Product Not Found modal
              </button>
            </div>
          </>
        )}

        {activeTab === 'products' && <ProductList />}
        {activeTab === 'history'  && <InvoiceHistory />}

      </main>

      {/* Product Not Found Modal */}
      {showModal && (
        <ProductNotFound
          onSubmit={(data) => { console.log('prices submitted:', data); setShowModal(false); }}
          onSkip={() => setShowModal(false)}
        />
      )}

    </div>
  );
}

export default App;
