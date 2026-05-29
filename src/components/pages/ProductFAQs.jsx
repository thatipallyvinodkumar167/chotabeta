import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  Download,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import './ProductFAQs.css';

const sampleFAQs = [
  { id: 2, product: 'Maggie 2-Minute Noodles 280g', question: 'Is this pack vegetarian?', answer: 'Yes, this product carries the green vegetarian dot.', status: 'Active', createdAt: '2026-05-17' },
  { id: 1, product: 'Surf Excel Easy Wash Liquid 1L', question: 'What is the shelf life of this product?', answer: 'The shelf life is 24 months from the date of packaging.', status: 'Active', createdAt: '2026-04-07' }
];

const ProductFAQs = () => {
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [faqs, setFaqs] = useState(sampleFAQs);

  // Add FAQ Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('Active');

  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showStatusDropdownModal, setShowStatusDropdownModal] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    product: true,
    question: true,
    answer: true,
    status: true,
    createdAt: true,
    action: true
  });

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleAddFAQSubmit = () => {
    if (!selectedProduct || !question.trim() || !answer.trim()) {
      alert("Please fill in all required fields (*).");
      return;
    }
    const newFAQ = {
      id: faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1,
      product: selectedProduct,
      question: question.trim(),
      answer: answer.trim(),
      status,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFaqs(prev => [newFAQ, ...prev]);
    // Reset state
    setSelectedProduct('');
    setQuestion('');
    setAnswer('');
    setStatus('Active');
    setShowAddModal(false);
  };

  const handleDeleteFAQ = (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(prev => prev.filter(faq => faq.id !== id));
    }
  };

  return (
    <div className="faqs-page">
      <div className="faqs-card">
        {/* Header Row */}
        <div className="card-header-row">
          <div className="header-left">
            <h1 className="page-title">Product Faqs</h1>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Products</span>
              <span className="separator">/</span>
              <span className="current active">Product Faqs</span>
            </div>
          </div>

          <div className="header-right">
            <div className="dropdown-container">
              <div className="status-selector" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                <span>Status</span>
                <ChevronDown size={14} />
              </div>
              {showStatusDropdown && (
                <div className="status-dropdown-menu">
                  <div className="status-dropdown-item">Active</div>
                  <div className="status-dropdown-item">Inactive</div>
                </div>
              )}
            </div>
            <button className="btn-add-faq" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Product FAQ
            </button>
            <button className="btn-refresh" onClick={() => setFaqs(sampleFAQs)}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="table-controls-row">
          <div className="controls-left">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="entries-selector">
              <select className="entries-box" value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} style={{ cursor: 'pointer', outline: 'none' }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>
          </div>

          <div className="controls-right">
            <div className="dropdown-container">
              <button className="btn-columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                Columns <ChevronDown size={14} />
              </button>
              {showColumnsDropdown && (
                <div className="columns-dropdown-menu">
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('product')}>
                    <span>1: Product</span>
                    {visibleColumns.product && <Check size={14} />}
                  </div>
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('question')}>
                    <span>2: Question</span>
                    {visibleColumns.question && <Check size={14} />}
                  </div>
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('answer')}>
                    <span>3: Answer</span>
                    {visibleColumns.answer && <Check size={14} />}
                  </div>
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('status')}>
                    <span>4: Status</span>
                    {visibleColumns.status && <Check size={14} />}
                  </div>
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('createdAt')}>
                    <span>5: Created At</span>
                    {visibleColumns.createdAt && <Check size={14} />}
                  </div>
                  <div className="columns-dropdown-item" onClick={() => toggleColumn('action')}>
                    <span>6: Action</span>
                    {visibleColumns.action && <Check size={14} />}
                  </div>
                </div>
              )}
            </div>

            <div className="dropdown-container">
              <button className="btn-export" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                <Download size={14} /> Export <ChevronDown size={14} />
              </button>
              {showExportDropdown && (
                <div className="export-dropdown-menu">
                  <div className="export-dropdown-item">Columns</div>
                  <div className="export-dropdown-item">Excel</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="table-container">
          <table className="faqs-table">
            <thead>
              <tr>
                {visibleColumns.id && <th>ID</th>}
                {visibleColumns.product && <th>PRODUCT</th>}
                {visibleColumns.question && <th>QUESTION</th>}
                {visibleColumns.answer && <th>ANSWER</th>}
                {visibleColumns.status && <th>STATUS</th>}
                {visibleColumns.createdAt && <th>CREATED AT</th>}
                {visibleColumns.action && <th>ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {faqs.length > 0 ? (
                faqs.map(faq => (
                  <tr key={faq.id}>
                    {visibleColumns.id && <td className="cell-id">{faq.id}</td>}
                    {visibleColumns.product && <td className="cell-product">{faq.product}</td>}
                    {visibleColumns.question && <td className="cell-question">{faq.question}</td>}
                    {visibleColumns.answer && <td className="cell-answer">{faq.answer}</td>}
                    {visibleColumns.status && (
                      <td className="cell-status">
                        <span className={`status-badge ${faq.status.toLowerCase()}`}>
                          {faq.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.createdAt && <td className="cell-date">{faq.createdAt}</td>}
                    {visibleColumns.action && (
                      <td className="cell-action">
                        <div className="action-buttons">
                          <button className="btn-icon red" onClick={() => handleDeleteFAQ(faq.id)} title="Delete FAQ">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Database size={40} className="empty-icon" />
                      <p>No data available.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Row */}
        <div className="table-footer">
          <div className="footer-left">
            Showing 1 to {faqs.length} of {faqs.length} entries
          </div>
          <div className="pagination">
            <button className="pagination-btn disabled"><ChevronsLeft size={16} /></button>
            <button className="pagination-btn disabled"><ChevronLeft size={16} /></button>
            <button className="pagination-btn disabled"><ChevronRight size={16} /></button>
            <button className="pagination-btn disabled"><ChevronsRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Modal Overlay: Add Product FAQ */}
      {showAddModal && (
        <div className="faq-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="faq-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="faq-modal-header">
              <h3>Add Product Faq</h3>
              <button className="faq-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="faq-modal-body">
              {/* Product Select Field */}
              <div className="faq-form-group">
                <label>Product <span className="required">*</span></label>
                <div className="faq-dropdown-container">
                  <button 
                    type="button"
                    className="faq-dropdown-btn" 
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                  >
                    <span className={selectedProduct ? 'selected-text' : 'placeholder-text'}>
                      {selectedProduct || 'Search Product'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {showProductDropdown && (
                    <div className="faq-dropdown-menu">
                      {[
                        'Surf Excel Easy Wash Liquid 1L',
                        'Maggie 2-Minute Noodles 280g',
                        'Cadbury Dairy Milk Silk 150g',
                        'Fortune Soyabean Oil 1L',
                        'Tata Salt Lite 1kg'
                      ].map(prod => (
                        <div 
                          key={prod} 
                          className={`faq-dropdown-item ${selectedProduct === prod ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedProduct(prod);
                            setShowProductDropdown(false);
                          }}
                        >
                          {prod}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Question Field */}
              <div className="faq-form-group">
                <label>Question <span className="required">*</span></label>
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter question"
                  rows={3}
                />
              </div>

              {/* Answer Field */}
              <div className="faq-form-group">
                <label>Answer <span className="required">*</span></label>
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter answer"
                  rows={3}
                />
              </div>

              {/* Status Select Field */}
              <div className="faq-form-group">
                <label>Status</label>
                <div className="faq-dropdown-container">
                  <button 
                    type="button"
                    className="faq-dropdown-btn" 
                    onClick={() => setShowStatusDropdownModal(!showStatusDropdownModal)}
                  >
                    <span>{status}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showStatusDropdownModal && (
                    <div className="faq-dropdown-menu">
                      {['Active', 'Inactive'].slice(0, entriesPerPage).map(st => (
                        <div 
                          key={st} 
                          className={`faq-dropdown-item ${status === st ? 'active' : ''}`}
                          onClick={() => {
                            setStatus(st);
                            setShowStatusDropdownModal(false);
                          }}
                        >
                          {st}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="faq-modal-footer">
              <button className="faq-btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="faq-btn-submit" onClick={handleAddFAQSubmit}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFAQs;
