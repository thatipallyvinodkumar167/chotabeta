import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Grid2X2, 
  Info, 
  ShieldCheck, 
  Layers, 
  Image as ImageIcon, 
  FileText, 
  CircleDollarSign,
  Search,
  ChevronRight,
  FolderOpen,
  Undo,
  Redo,
  RotateCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('category');
  const [editId, setEditId] = useState(null);

  // Metadata lists
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [taxRates, setTaxRates] = useState([]);

  // Form Fields State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState('');
  const [madeIn, setMadeIn] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [indicator, setIndicator] = useState('veg');
  const [prepTime, setPrepTime] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [qtyStepSize, setQtyStepSize] = useState('1');
  const [maxAllowedQty, setMaxAllowedQty] = useState('100');
  const [isReturnable, setIsReturnable] = useState('0');
  const [isCancelable, setIsCancelable] = useState('0');
  const [featured, setFeatured] = useState('0');
  const [productType, setProductType] = useState('simple'); // simple or variable
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Pricing/Stock for Simple Product
  const [price, setPrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');

  // Variants list for Variable Product
  const [variantsList, setVariantsList] = useState([]);

  const steps = [
    { id: 'category', label: 'Select Category', icon: <Grid2X2 size={18} /> },
    { id: 'info', label: 'Product Info', icon: <Info size={18} /> },
    { id: 'policies', label: 'Policies and Features', icon: <ShieldCheck size={18} /> },
    { id: 'variations', label: 'Variations', icon: <Layers size={18} /> },
    { id: 'images', label: 'Images', icon: <ImageIcon size={18} /> },
    { id: 'description', label: 'Description', icon: <FileText size={18} /> },
    { id: 'pricing', label: 'Pricing & Taxes', icon: <CircleDollarSign size={18} /> },
  ];

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes, taxRes] = await Promise.all([
          fetch(`${API_BASE_URL}/meta/categories`),
          fetch(`${API_BASE_URL}/meta/brands`),
          fetch(`${API_BASE_URL}/meta/tax-rates`)
        ]);

        const [catData, brandData, taxData] = await Promise.all([
          catRes.json(),
          brandRes.json(),
          taxRes.json()
        ]);

        if (catData.success) setCategories(catData.data);
        if (brandData.success) setBrands(brandData.data);
        if (taxData.success) setTaxRates(taxData.data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    fetchMetadata();

    // Check for editId in URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('editId');
    if (id) {
      setEditId(id);
      fetchProductDetails(id);
    }
  }, []);

  const fetchProductDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setSelectedCategoryId(p.category_id || '');
        setTitle(p.title || '');
        setBrandId(p.brand_id || '');
        setHsnCode(p.hsn_code || '');
        setIndicator(p.indicator || 'veg');
        setMinOrderQty(p.minimum_order_quantity || '1');
        setIsReturnable(String(p.is_returnable || '0'));
        setIsCancelable(String(p.is_cancelable || '0'));
        setProductType(p.type || 'simple');
        setShortDescription(p.short_description || '');
        setDescription(p.description || '');
        setImageUrl(p.image || '');
        
        if (p.variants && p.variants.length > 0) {
          if (p.type === 'simple') {
            const mainVar = p.variants[0];
            setPrice(mainVar.price || '');
            setSpecialPrice(mainVar.special_price || '');
            setStock(mainVar.stock || '');
            setSku(mainVar.sku || '');
          } else {
            setVariantsList(p.variants);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (activeStep === 'pricing') {
      handleSubmit();
    } else if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title) {
        alert('Please fill out Product Title on the Product Info step.');
        setActiveStep('info');
        return;
      }
      if (!selectedCategoryId) {
        alert('Please select a Category on the Category step.');
        setActiveStep('category');
        return;
      }

      const payload = {
        title,
        category_id: selectedCategoryId,
        brand_id: brandId || null,
        type: productType,
        short_description: shortDescription,
        description,
        indicator,
        minimum_order_quantity: parseInt(minOrderQty) || 1,
        is_returnable: isReturnable,
        is_cancelable: isCancelable,
        hsn_code: hsnCode,
        price: parseFloat(price) || 0,
        special_price: parseFloat(specialPrice) || parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        sku: sku || ('sku-' + Date.now()),
        variants: productType === 'variable' ? variantsList : []
      };

      const url = editId ? `${API_BASE_URL}/products/${editId}` : `${API_BASE_URL}/products`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(editId ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/products');
      } else {
        alert(data.message || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'category':
        return (
          <>
            <div className="form-group">
              <label>Search Category</label>
              <div className="search-box">
                <Search size={16} className="search-icon" style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search Category" 
                  style={{ paddingLeft: '35px' }}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="browse-section">
              <h3>Browse Categories</h3>
              <div className="category-tree">
                {categories
                  .filter(cat => cat.title.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map(cat => (
                    <div 
                      key={cat.id}
                      className={`tree-item ${String(selectedCategoryId) === String(cat.id) ? 'active' : ''}`}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      style={{ cursor: 'pointer', padding: '10px', borderRadius: '6px', marginBottom: '5px' }}
                    >
                      <div className="tree-item-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FolderOpen size={16} className="folder-icon" />
                        <span>{cat.title}</span>
                      </div>
                    </div>
                  ))}
                {categories.length === 0 && <p style={{ color: '#64748b' }}>Loading categories...</p>}
              </div>
            </div>
          </>
        );
      case 'info':
        return (
          <div className="info-step-form">
            <div className="form-group">
              <label>Product Title <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="Product Title" 
                className="form-input" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <div className="select-box">
                <select 
                  className="form-select" 
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Made In</label>
              <input 
                type="text" 
                placeholder="Country of origin" 
                className="form-input" 
                value={madeIn}
                onChange={(e) => setMadeIn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>HSN Code</label>
              <input 
                type="text" 
                placeholder="HSN Code" 
                className="form-input" 
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Indicator</label>
              <div className="select-box">
                <select 
                  className="form-select" 
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                >
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non-Veg</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Base Preparation Time</label>
              <div className="input-with-suffix">
                <input 
                  type="text" 
                  placeholder="Base Preparation Time" 
                  className="form-input" 
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
                <div className="suffix">Minutes</div>
              </div>
            </div>
          </div>
        );
      case 'policies':
        return (
          <div className="policies-step-form">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Minimum Order Quantity</label>
                <input 
                  type="text" 
                  placeholder="Enter Minimum Quantity" 
                  className="form-input" 
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value)}
                />
                <p className="field-hint">By Default Minimum Quantity is 1</p>
              </div>
              <div className="form-group">
                <label>Quantity Step Size</label>
                <input 
                  type="text" 
                  placeholder="Enter Quantity Step Size" 
                  className="form-input" 
                  value={qtyStepSize}
                  onChange={(e) => setQtyStepSize(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Total Allowed Quantity</label>
                <input 
                  type="text" 
                  placeholder="Enter Total Allowed Quantity" 
                  className="form-input" 
                  value={maxAllowedQty}
                  onChange={(e) => setMaxAllowedQty(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-4">
              <div className="form-group">
                <label>Is Returnable</label>
                <select 
                  className="form-select"
                  value={isReturnable}
                  onChange={(e) => setIsReturnable(e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Is Cancelable</label>
                <select 
                  className="form-select"
                  value={isCancelable}
                  onChange={(e) => setIsCancelable(e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Featured Product</label>
                <select 
                  className="form-select"
                  value={featured}
                  onChange={(e) => setFeatured(e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'variations':
        return (
          <div className="variations-step-form">
            <div className="form-group">
              <label>Product Type <span className="required">*</span></label>
              <div className="select-box">
                <select 
                  className="form-select"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                >
                  <option value="simple">Simple Product</option>
                  <option value="variable">Variable Product</option>
                </select>
              </div>
            </div>

            {productType === 'variable' && (
              <div className="variants-list-editor" style={{ marginTop: '20px' }}>
                <h4>Configure Variants</h4>
                {variantsList.map((v, idx) => (
                  <div key={idx} className="variant-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Variant Title (e.g. Red, Medium)" 
                      value={v.title || ''} 
                      onChange={(e) => {
                        const newList = [...variantsList];
                        newList[idx].title = e.target.value;
                        setVariantsList(newList);
                      }}
                      className="form-input"
                      style={{ flex: '1 1 150px' }}
                    />
                    <input 
                      type="text" 
                      placeholder="SKU" 
                      value={v.sku || ''} 
                      onChange={(e) => {
                        const newList = [...variantsList];
                        newList[idx].sku = e.target.value;
                        setVariantsList(newList);
                      }}
                      className="form-input"
                      style={{ flex: '1 1 120px' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={v.price || ''} 
                      onChange={(e) => {
                        const newList = [...variantsList];
                        newList[idx].price = e.target.value;
                        setVariantsList(newList);
                      }}
                      className="form-input"
                      style={{ flex: '1 1 90px' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Stock" 
                      value={v.stock || ''} 
                      onChange={(e) => {
                        const newList = [...variantsList];
                        newList[idx].stock = e.target.value;
                        setVariantsList(newList);
                      }}
                      className="form-input"
                      style={{ flex: '1 1 90px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
                      style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-add-field"
                  onClick={() => setVariantsList([...variantsList, { title: '', sku: '', price: '', stock: '' }])}
                >
                  + Add Variant Row
                </button>
              </div>
            )}
          </div>
        );
      case 'images':
        return (
          <div className="images-step-form">
            <div className="form-group">
              <label>Main Image</label>
              <div className="upload-box" style={{ textAlign: 'center', padding: '20px' }}>
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Product Main" 
                    style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} 
                  />
                ) : (
                  <p>No image available.</p>
                )}
                <p style={{ marginTop: '15px', color: '#64748b', fontSize: '14px' }}>
                  Images are uploaded via admin. Main image is set by category fallback automatically or you can customize details in database.
                </p>
              </div>
            </div>
          </div>
        );
      case 'description':
        return (
          <div className="description-step-form">
            <div className="form-group">
              <label>Short Description</label>
              <textarea 
                placeholder="Short Description" 
                className="form-textarea" 
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Full Product Description" 
                className="form-textarea" 
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="pricing-step-form">
            <div className="form-group">
              <label>Tax Rates</label>
              <div className="select-box">
                <select className="form-select">
                  <option value="">Select Tax Rate</option>
                  {taxRates.map(rate => (
                    <option key={rate.id} value={rate.id}>{rate.title} ({rate.percentage}%)</option>
                  ))}
                </select>
              </div>
            </div>

            {productType === 'simple' && (
              <div className="store-pricing-section">
                <div className="section-header">
                  <h3>Price & Stock Configuration</h3>
                  <span>Set core sales details for the default product variant</span>
                </div>
                <div className="store-pricing-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label>SKU</label>
                    <input 
                      type="text" 
                      placeholder="SKU" 
                      className="form-input" 
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input 
                      type="number" 
                      placeholder="MRP / Original Price" 
                      className="form-input" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Special Price</label>
                    <input 
                      type="number" 
                      placeholder="Discounted selling price" 
                      className="form-input" 
                      value={specialPrice}
                      onChange={(e) => setSpecialPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input 
                      type="number" 
                      placeholder="Available inventory quantity" 
                      className="form-input" 
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {productType === 'variable' && (
              <div className="store-pricing-section">
                <p>Pricing and stock have been configured for individual variants in the Variations step.</p>
              </div>
            )}
          </div>
        );
      default:
        return <div className="step-placeholder">Content for {activeStep} step coming soon...</div>;
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-card">
        {/* Header */}
        <div className="card-header-row">
          <h1 className="page-title">{editId ? 'Edit Product' : 'Add Product'}</h1>
          <button className="btn-back" onClick={() => navigate('/products')}>
            <ArrowLeft size={16} /> Back to Products
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="stepper-wrapper">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`stepper-item ${activeStep === step.id ? 'active' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              {step.icon}
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="stepper-content">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="card-footer-actions">
          <button 
            className={`btn-previous ${activeStep === 'category' ? 'disabled' : ''}`}
            onClick={handlePrevious}
            disabled={activeStep === 'category'}
          >
            Previous
          </button>
          <button className="btn-next" onClick={handleNext}>
            {activeStep === 'pricing' ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
