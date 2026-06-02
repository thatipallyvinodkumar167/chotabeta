import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  Download,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);

  // Live state
  const [productsData, setProductsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productType, setProductType] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    details: true,
    approval: true,
    createdAt: true,
    action: true
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'details', label: 'PRODUCT DETAILS' },
    { key: 'approval', label: 'ADMIN APPROVAL STATUS' },
    { key: 'createdAt', label: 'CREATED AT' },
    { key: 'action', label: 'ACTION' }
  ];

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/meta/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Building query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('page', currentPage);
      params.append('limit', limit);

      const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        // Filter locally for type, status, verification if needed, or backend handles it.
        // Currently backend handles search and category. Let's apply other filters client-side or we can just filter client-side.
        let list = [];
        if (data.data) {
          if (Array.isArray(data.data.products)) {
            list = data.data.products;
          } else if (Array.isArray(data.data)) {
            list = data.data;
          }
        }

        if (productType) {
          list = list.filter(p => (p.type || '').toLowerCase() === productType.toLowerCase());
        }
        if (productStatus) {
          list = list.filter(p => (p.status || '').toLowerCase() === productStatus.toLowerCase());
        }
        if (verificationStatus) {
          list = list.filter(p => (p.verification_status || '').toLowerCase() === verificationStatus.toLowerCase());
        }

        setProductsData(list);
        setPagination((data.data && data.data.pagination) || { total: list.length, page: currentPage, limit, pages: 1 });
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, currentPage, limit, productType, productStatus, verificationStatus]);

  // Handle status toggle
  const handleToggleStatus = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProductsData(prev => 
          prev.map(p => p.id === productId ? { ...p, status: nextStatus } : p)
        );
        if (viewingProduct && viewingProduct.id === productId) {
          setViewingProduct(prev => ({ ...prev, status: nextStatus }));
        }
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Handle delete
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  // Handle single product detail view fetch
  const handleViewProduct = async (product) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${product.id}`);
      const data = await res.json();
      if (data.success) {
        setViewingProduct(data.data);
      } else {
        setViewingProduct(product); // Fallback to list product details
      }
    } catch (err) {
      console.error('Error fetching single product:', err);
      setViewingProduct(product);
    }
  };

  if (viewingProduct) {
    return (
      <div className="product-details-page">
        <div className="detail-header">
          <h1 className="page-title">Product Details</h1>
          <div className="header-actions">
            <button className="btn-back" onClick={() => setViewingProduct(null)}>
              <ArrowLeft size={16} /> Back to Products
            </button>
            <button className="btn-edit-product" onClick={() => navigate(`/add-product?editId=${viewingProduct.id}`)}>
              <Edit size={16} /> Edit Product
            </button>
          </div>
        </div>

        <div className="details-grid">
          {/* Summary Card */}
          <div className="detail-card summary-card">
            <div className="card-header">Product Summary</div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">PRODUCT NAME</span>
                  <span className="value">{viewingProduct.title}</span>
                </div>
                <div className="info-item">
                  <span className="label">PRODUCT TYPE</span>
                  <span className="value">{viewingProduct.type}</span>
                </div>
                <div className="info-item">
                  <span className="label">STATUS</span>
                  <span className={`status-badge ${viewingProduct.status === 'active' ? 'active' : ''}`} style={{
                    backgroundColor: viewingProduct.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: viewingProduct.status === 'active' ? '#22c55e' : '#64748b'
                  }}>
                    {viewingProduct.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">VERIFICATION STATUS</span>
                  <span className="status-badge verified">{viewingProduct.verification_status || viewingProduct.verificationStatus}</span>
                </div>
                <div className="info-item">
                  <span className="label">CATEGORY</span>
                  <span className="value">{viewingProduct.category_title || viewingProduct.category || 'Uncategorized'}</span>
                </div>
                <div className="info-item">
                  <span className="label">BRAND</span>
                  <span className="value">{viewingProduct.brand_title || viewingProduct.brand || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">CREATED AT</span>
                  <span className="value">{viewingProduct.created_at || viewingProduct.createdAt}</span>
                </div>
                <div className="info-item">
                  <span className="label">UPDATED AT</span>
                  <span className="value">{viewingProduct.updated_at || viewingProduct.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Card */}
          <div className="detail-card image-card">
            <div className="card-header">Product Image</div>
            <div className="card-body">
              <div className="image-display">
                <img src={viewingProduct.image} alt={viewingProduct.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="detail-card description-card">
          <div className="card-header">Product Description</div>
          <div className="card-body">
            <div className="description-text">
              {(viewingProduct.description || '').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="detail-card pricing-card">
          <div className="card-header">Store-wise Pricing</div>
          <div className="card-body">
            <div className="variant-name">
              Variant Name : {viewingProduct.title}
            </div>
            <div className="table-wrapper scrollable-x">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>STORE</th>
                    <th>SKU</th>
                    <th>PRICE</th>
                    <th>SPECIAL PRICE</th>
                    <th>COST</th>
                    <th>STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingProduct.variants && viewingProduct.variants.map((p, i) => (
                    <tr key={i}>
                      <td>YVG General Stores</td>
                      <td>{p.sku}</td>
                      <td>₹{p.price}</td>
                      <td>₹{p.special_price || p.specialPrice}</td>
                      <td>₹{p.cost || '0.00'}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                  {(!viewingProduct.variants || viewingProduct.variants.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No variants or pricing configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-card">
        {/* Header Row */}
        <div className="card-header-row">
          <div className="header-left">
            <h1 className="page-title">Products</h1>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Products</span>
            </div>
          </div>

          <div className="header-right">
            <button className="btn-outline-blue" onClick={() => navigate('/bulk-upload')}>
              <Plus size={16} /> Bulk Upload
            </button>
            <button className="btn-create" onClick={() => navigate('/add-product')}>
              <Plus size={16} /> Add New Product
            </button>
            <button className="btn-outline-blue" onClick={fetchProducts}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="filters-row">
          <div className="dropdown-container">
            <div className="filter-dropdown" onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}>
              <span>Product Type: {productType || 'All'}</span>
              <ChevronDown size={14} />
            </div>
            {activeFilter === 'type' && (
              <div className="filter-dropdown-menu">
                <div className="filter-header">Product Type</div>
                <div className="filter-item" onClick={() => { setProductType(''); setActiveFilter(null); }}>All Types</div>
                <div className="filter-item" onClick={() => { setProductType('simple'); setActiveFilter(null); }}>Simple</div>
                <div className="filter-item" onClick={() => { setProductType('variant'); setActiveFilter(null); }}>Variant</div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <div className="filter-dropdown" onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}>
              <span>Product Status: {productStatus || 'All'}</span>
              <ChevronDown size={14} />
            </div>
            {activeFilter === 'status' && (
              <div className="filter-dropdown-menu">
                <div className="filter-header">Product Status</div>
                <div className="filter-item" onClick={() => { setProductStatus(''); setActiveFilter(null); }}>All Statuses</div>
                <div className="filter-item" onClick={() => { setProductStatus('active'); setActiveFilter(null); }}>Active</div>
                <div className="filter-item" onClick={() => { setProductStatus('draft'); setActiveFilter(null); }}>Draft</div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <div className="filter-dropdown" onClick={() => setActiveFilter(activeFilter === 'verification' ? null : 'verification')}>
              <span>Verification: {verificationStatus || 'All'}</span>
              <ChevronDown size={14} />
            </div>
            {activeFilter === 'verification' && (
              <div className="filter-dropdown-menu">
                <div className="filter-header">Verification Status</div>
                <div className="filter-item" onClick={() => { setVerificationStatus(''); setActiveFilter(null); }}>All</div>
                <div className="filter-item" onClick={() => { setVerificationStatus('pending'); setActiveFilter(null); }}>Pending</div>
                <div className="filter-item" onClick={() => { setVerificationStatus('rejected'); setActiveFilter(null); }}>Rejected</div>
                <div className="filter-item" onClick={() => { setVerificationStatus('approved'); setActiveFilter(null); }}>Approved</div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <div className="filter-dropdown category-filter" onClick={() => setActiveFilter(activeFilter === 'category' ? null : 'category')}>
              <span>Category: {categories.find(c => String(c.id) === String(selectedCategory))?.title || 'All'}</span>
              <ChevronDown size={14} />
            </div>
            {activeFilter === 'category' && (
              <div className="filter-dropdown-menu searchable">
                <div className="filter-search-wrapper">
                  <input 
                    type="text" 
                    placeholder="Search category..." 
                    autoFocus
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="filter-items-scroll">
                  <div 
                    className="filter-item"
                    onClick={() => {
                      setSelectedCategory('');
                      setActiveFilter(null);
                    }}
                  >
                    All Categories
                  </div>
                  {categories
                    .filter(cat => cat.title.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map(cat => (
                      <div 
                        key={cat.id} 
                        className="filter-item"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveFilter(null);
                        }}
                      >
                        {cat.title}
                      </div>
                    ))}
                  {categories.filter(cat => cat.title.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                    <div className="filter-no-results">No categories found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="table-controls-row">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="entries-selector">
            <select 
              className="entries-box" 
              value={limit} 
              onChange={(e) => {
                setLimit(Number(e.target.value));
                if (typeof setCurrentPage === 'function') setCurrentPage(1);
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="actions-right">
            <div className="dropdown-container">
              <button className="btn-columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                Columns <ChevronDown size={14} />
              </button>
              {showColumnsDropdown && (
                <div className="columns-dropdown-menu">
                  {columns.slice(0, entriesPerPage).map((col, idx) => (
                    <div key={col.key} className="dropdown-item" onClick={() => toggleColumn(col.key)}>
                      <span>{idx + 1}: {col.label}</span>
                      {visibleColumns[col.key] && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-container">
              <button className="btn-outline-blue" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                <Download size={14} /> Export <ChevronDown size={14} />
              </button>
              {showExportDropdown && (
                <div className="export-dropdown-menu">
                  <div className="export-dropdown-item" onClick={() => setShowExportDropdown(false)}>Columns</div>
                  <div className="export-dropdown-item" onClick={() => setShowExportDropdown(false)}>Excel</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Row */}
        <div className="table-wrapper scrollable-x">
          <table className="products-table">
            <thead>
              <tr>
                {columns.map(col => (
                  visibleColumns[col.key] && (
                    <th key={col.key} className={`col-${col.key}`}>
                      <div className="th-content">
                        {col.label}
                        <div className="sort-icons">
                          <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.filter(c => visibleColumns[c.key]).length} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.filter(c => visibleColumns[c.key]).length} style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}>
                    {error}
                  </td>
                </tr>
              ) : productsData.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter(c => visibleColumns[c.key]).length} style={{ textAlign: 'center', padding: '30px' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                productsData.map(product => (
                  <tr key={product.id}>
                    {visibleColumns.id && (
                      <td className="cell-id">#{product.id}</td>
                    )}
                    {visibleColumns.details && (
                      <td className="cell-details">
                        <div className="product-info-wrapper">
                          <div className="product-image-box">
                            <img src={product.image} alt={product.title} />
                          </div>
                          <div className="product-text-details">
                            <div className="detail-line">
                              <span className="label">Title:</span>
                              <span className="value title">{product.title}</span>
                            </div>
                            <div className="detail-line">
                              <span className="label">Category:</span>
                              <span className="value">{product.category_title || 'Uncategorized'}</span>
                            </div>
                            <div className="detail-line">
                              <span className="label">Brand:</span>
                              <span className="value">{product.brand_title || 'N/A'}</span>
                            </div>
                            <div className="badges-row">
                              <span className="badge-type">{product.type}</span>
                              <span className={`badge-status ${product.status === 'active' ? 'active' : ''}`} style={{
                                backgroundColor: product.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                color: product.status === 'active' ? '#166534' : '#475569'
                              }}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.approval && (
                      <td className="cell-approval">
                        <span className={`status-badge ${(product.verification_status || 'pending').toLowerCase()}`} style={{
                          backgroundColor: (product.verification_status || 'pending').toLowerCase() === 'approved' ? '#dcfce7' : 'rgba(245, 158, 11, 0.1)',
                          color: (product.verification_status || 'pending').toLowerCase() === 'approved' ? '#166534' : '#f59e0b'
                        }}>
                          {product.verification_status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="cell-date">{product.created_at || 'N/A'}</td>
                    )}
                    {visibleColumns.action && (
                      <td className="cell-action">
                        <div className="action-buttons">
                          <button 
                            className="btn-icon toggle-btn"
                            style={{
                              borderColor: product.status === 'active' ? '#22c55e' : '#64748b'
                            }}
                            onClick={() => handleToggleStatus(product.id, product.status)}
                          >
                            <div 
                              className="toggle-inner"
                              style={{
                                backgroundColor: product.status === 'active' ? '#22c55e' : '#64748b',
                                right: product.status === 'active' ? '4px' : 'auto',
                                left: product.status === 'active' ? 'auto' : '4px'
                              }}
                            ></div>
                          </button>
                          <button className="btn-icon edit" onClick={() => navigate(`/add-product?editId=${product.id}`)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 size={16} />
                          </button>
                          <button className="btn-icon view" onClick={() => handleViewProduct(product)}>
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Row */}
        <div className="table-footer">
          <div className="footer-left">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="pagination">
            <button 
              className={`pagination-btn ${pagination.page <= 1 ? 'disabled' : ''}`}
              onClick={() => pagination.page > 1 && setCurrentPage(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className={`pagination-btn ${pagination.page >= pagination.pages ? 'disabled' : ''}`}
              onClick={() => pagination.page < pagination.pages && setCurrentPage(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

