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
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
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
  const [uploading, setUploading] = useState(false);
  const [imageFit, setImageFit] = useState('cover');
  const [videoType, setVideoType] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [mainFileName, setMainFileName] = useState('');
  const [mainFileSize, setMainFileSize] = useState('');
  
  // Pricing/Stock for Simple Product
  const [price, setPrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');

  // Variants list for Variable Product
  const [variantsList, setVariantsList] = useState([]);

  // New Fields
  const [customFields, setCustomFields] = useState([]); // [{ key: '', value: '' }]
  const [customSections, setCustomSections] = useState([]); // [{ title: '', fields: [{ label: '', value: '', image: '' }] }]
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [stores, setStores] = useState([]);
  const [storePricing, setStorePricing] = useState({}); // { [storeId]: { price, specialPrice, cost, stock, sku } }
  
  const [cancelableTill, setCancelableTill] = useState('pending');
  const [isAttachmentRequired, setIsAttachmentRequired] = useState('0');
  const [requiresOtp, setRequiresOtp] = useState('0');
  const [returnableDays, setReturnableDays] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [guaranteePeriod, setGuaranteePeriod] = useState('');

  const [barcode, setBarcode] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  
  const [isInclusiveTax, setIsInclusiveTax] = useState(false);
  const [selectedTaxGroups, setSelectedTaxGroups] = useState([]);


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
        const [catRes, brandRes, taxRes, storeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/meta/categories`),
          fetch(`${API_BASE_URL}/meta/brands`),
          fetch(`${API_BASE_URL}/meta/tax-rates`),
          fetch(`${API_BASE_URL}/stores`)
        ]);

        const [catData, brandData, taxData, storeData] = await Promise.all([
          catRes.json(),
          brandRes.json(),
          taxRes.json(),
          storeRes.json()
        ]);

        if (catData.success) setCategories(catData.data);
        if (brandData.success) setBrands(brandData.data);
        if (taxData.success) setTaxRates(taxData.data);
        if (storeData.success) setStores(storeData.data);
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

  useEffect(() => {
    if (brandId && brands.length > 0) {
      const b = brands.find(brand => String(brand.id) === String(brandId));
      if (b) setBrandSearch(b.title);
    }
  }, [brandId, brands]);

  const fetchProductDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setSelectedCategoryId(p.category_id || '');
        setTitle(p.title || '');
        setBrandId(p.brand_id || '');
        setMadeIn(p.made_in || '');
        setHsnCode(p.hsn_code || '');
        setIndicator(p.indicator || 'veg');
        setPrepTime(p.base_prep_time || '');
        setMinOrderQty(p.minimum_order_quantity || '1');
        setQtyStepSize(p.quantity_step_size || '1');
        setMaxAllowedQty(p.total_allowed_quantity || '100');
        setIsReturnable(String(p.is_returnable || '0'));
        setIsCancelable(String(p.is_cancelable || '0'));
        setCancelableTill(p.cancelable_till || 'pending');
        setIsAttachmentRequired(String(p.is_attachment_required || '0'));
        setFeatured(String(p.featured || '0'));
        setRequiresOtp(String(p.requires_otp || '0'));
        setReturnableDays(p.returnable_days !== null ? String(p.returnable_days) : '');
        setWarrantyPeriod(p.warranty_period || '');
        setGuaranteePeriod(p.guarantee_period || '');
        setProductType(p.type || 'simple');
        setShortDescription(p.short_description || '');
        setDescription(p.description || '');
        setImageUrl(p.image || '');
        setImageFit(p.image_fit || 'cover');
        setVideoType(p.video_type || '');
        setVideoLink(p.video_link || '');

        if (p.image) {
          const parts = p.image.split('/');
          setMainFileName(parts[parts.length - 1] || 'product_image.jpg');
          setMainFileSize('8 KB');
        }

        // Parse custom fields and sections
        let cFields = [];
        try {
          if (p.custom_fields) {
            cFields = typeof p.custom_fields === 'string' ? JSON.parse(p.custom_fields) : p.custom_fields;
          }
        } catch (e) {
          console.error('Error parsing custom fields:', e);
        }

        if (cFields && !Array.isArray(cFields) && cFields.fields) {
          setCustomFields(cFields.fields || []);
          setCustomSections(cFields.sections || []);
        } else if (Array.isArray(cFields)) {
          setCustomFields(cFields);
        }

        // Tags
        if (p.tags) {
          const tagArray = p.tags.split(',').map(t => t.trim()).filter(Boolean);
          setSelectedTags(tagArray);
        }

        // Additional Images
        setAdditionalImages(p.additional_images || []);

        // Tax
        setIsInclusiveTax(p.is_inclusive_tax === '1' || p.is_inclusive_tax === 1);

        if (p.variants && p.variants.length > 0) {
          if (p.type === 'simple') {
            const mainVar = p.variants[0];
            setBarcode(mainVar.barcode || '');
            setWeight(mainVar.weight || '');
            setHeight(mainVar.height || '');
            setLength(mainVar.length || '');
            setBreadth(mainVar.breadth || '');

            const pricingMap = {};
            p.variants.forEach(v => {
              if (v.store_id) {
                pricingMap[v.store_id] = {
                  price: v.price || '',
                  specialPrice: v.special_price || '',
                  cost: v.cost || '',
                  stock: v.stock || '',
                  sku: v.sku || ''
                };
              }
            });
            setStorePricing(pricingMap);

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

  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  const handleAdditionalFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingAdditional(true);
    const uploadedUrls = [...additionalImages];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE_URL}/products/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        } else {
          console.error('Failed to upload additional image:', data.message);
        }
      }
      setAdditionalImages(uploadedUrls);
    } catch (err) {
      alert('Error uploading additional images: ' + err.message);
    } finally {
      setUploadingAdditional(false);
      e.target.value = '';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instantly show local preview
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    setMainFileName(file.name);
    setMainFileSize(`${Math.round(file.size / 1024)} KB`);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/products/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addSection = () => {
    setCustomSections([...customSections, { title: '', fields: [{ label: '', value: '', image: '' }] }]);
  };

  const updateSectionTitle = (secIdx, titleVal) => {
    const updated = [...customSections];
    updated[secIdx].title = titleVal;
    setCustomSections(updated);
  };

  const addFieldToSection = (secIdx) => {
    const updated = [...customSections];
    updated[secIdx].fields.push({ label: '', value: '', image: '' });
    setCustomSections(updated);
  };

  const updateSectionField = (secIdx, fieldIdx, key, val) => {
    const updated = [...customSections];
    updated[secIdx].fields[fieldIdx][key] = val;
    setCustomSections(updated);
  };

  const removeSection = (secIdx) => {
    setCustomSections(customSections.filter((_, i) => i !== secIdx));
  };

  const removeSectionField = (secIdx, fieldIdx) => {
    const updated = [...customSections];
    updated[secIdx].fields = updated[secIdx].fields.filter((_, i) => i !== fieldIdx);
    setCustomSections(updated);
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

      let finalStorePricing = { ...storePricing };
      // Fallback/sync simple inputs into store 12 if storePricing has no entry for it
      if (productType === 'simple' && Object.keys(finalStorePricing).length === 0) {
        finalStorePricing[12] = {
          price: price,
          specialPrice: specialPrice,
          cost: 0,
          stock: stock,
          sku: sku
        };
      }

      const payloadStorePricing = {};
      Object.entries(finalStorePricing).forEach(([storeId, pricing]) => {
        payloadStorePricing[storeId] = {
          sku: pricing.sku || ('sku-' + Date.now() + '-' + storeId),
          price: parseFloat(pricing.price) || 0,
          special_price: parseFloat(pricing.specialPrice !== undefined ? pricing.specialPrice : (pricing.special_price || pricing.price)) || parseFloat(pricing.price) || 0,
          cost: parseFloat(pricing.cost) || 0,
          stock: parseInt(pricing.stock) || 0
        };
      });

      const payload = {
        title,
        category_id: selectedCategoryId,
        brand_id: brandId || null,
        made_in: madeIn || '',
        hsn_code: hsnCode || '',
        indicator,
        base_prep_time: parseInt(prepTime) || 0,
        minimum_order_quantity: parseInt(minOrderQty) || 1,
        quantity_step_size: parseInt(qtyStepSize) || 1,
        total_allowed_quantity: parseInt(maxAllowedQty) || 100,
        is_returnable: isReturnable,
        is_cancelable: isCancelable,
        cancelable_till: isCancelable === '1' ? cancelableTill : null,
        is_attachment_required: isAttachmentRequired,
        featured: featured,
        requires_otp: requiresOtp,
        returnable_days: isReturnable === '1' ? (parseInt(returnableDays) || 0) : 0,
        warranty_period: warrantyPeriod || null,
        guarantee_period: guaranteePeriod || null,
        type: productType,
        short_description: shortDescription,
        description,
        image: imageUrl,
        image_fit: imageFit,
        video_type: videoType || null,
        video_link: videoLink || null,
        barcode: barcode || '',
        weight: parseFloat(weight) || null,
        height: parseFloat(height) || null,
        length: parseFloat(length) || null,
        breadth: parseFloat(breadth) || null,
        custom_fields: { fields: customFields, sections: customSections },
        tags: selectedTags.join(','),
        is_inclusive_tax: isInclusiveTax ? '1' : '0',
        store_pricing: payloadStorePricing,
        additional_images: additionalImages,
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

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Brand</label>
              <div className="search-select-container">
                <input 
                  type="text" 
                  placeholder="Search Brand" 
                  className="form-input" 
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setShowBrandDropdown(true);
                  }}
                  onFocus={() => setShowBrandDropdown(true)}
                />
                <span className="dropdown-arrow" style={{ position: 'absolute', right: '15px', top: '42px', color: '#64748b', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
                {showBrandDropdown && (
                  <div className="search-dropdown-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', marginTop: '5px' }}>
                    <div 
                      className="dropdown-item" 
                      onClick={() => {
                        setBrandId('');
                        setBrandSearch('');
                        setShowBrandDropdown(false);
                      }}
                      style={{ padding: '10px', cursor: 'pointer', color: '#cbd5e1', borderBottom: '1px solid #1e293b' }}
                    >
                      None
                    </div>
                    {brands
                      .filter(b => b.title.toLowerCase().includes(brandSearch.toLowerCase()))
                      .map(b => (
                        <div 
                          key={b.id} 
                          className="dropdown-item" 
                          onClick={() => {
                            setBrandId(b.id);
                            setBrandSearch(b.title);
                            setShowBrandDropdown(false);
                          }}
                          style={{ padding: '10px', cursor: 'pointer', color: '#fff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {b.title}
                        </div>
                      ))
                    }
                  </div>
                )}
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

            {/* Custom Fields Block */}
            <div className="custom-fields-container" style={{ gridColumn: 'span 2', marginTop: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Custom Fields</label>
              {customFields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Key (e.g. Material)" 
                    value={field.key} 
                    onChange={(e) => {
                      const updated = [...customFields];
                      updated[index].key = e.target.value;
                      setCustomFields(updated);
                    }}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="text" 
                    placeholder="Value (e.g. Cotton)" 
                    value={field.value} 
                    onChange={(e) => {
                      const updated = [...customFields];
                      updated[index].value = e.target.value;
                      setCustomFields(updated);
                    }}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                    style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="btn-add-field" 
                onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', border: '1px solid #3b82f6', backgroundColor: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', marginTop: '8px' }}
              >
                + Add Field
              </button>
              <p className="field-hint" style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>Add any additional product information as key/value pairs.</p>
            </div>
          </div>
        );
      case 'policies':
        return (
          <div className="policies-step-form">
            {/* Row 1: MOQ, Qty Step Size, Total Allowed Qty */}
            <div className="form-grid-3" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Minimum Order Quantity</label>
                <input 
                  type="number" 
                  placeholder="Enter Minimum Quantity" 
                  className="form-input" 
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value)}
                />
                <p className="field-hint" style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>By Default Minimum Quantity is 1</p>
              </div>
              <div className="form-group">
                <label>Quantity Step Size</label>
                <input 
                  type="number" 
                  placeholder="Enter Quantity Step Size" 
                  className="form-input" 
                  value={qtyStepSize}
                  onChange={(e) => setQtyStepSize(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Total Allowed Quantity</label>
                <input 
                  type="number" 
                  placeholder="Enter Total Allowed Quantity" 
                  className="form-input" 
                  value={maxAllowedQty}
                  onChange={(e) => setMaxAllowedQty(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Is Returnable, Is Cancelable, Cancelable Till, Is Attachment Required */}
            <div className="form-grid-4" style={{ marginBottom: '20px' }}>
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
                <label>Cancelable Till</label>
                <select 
                  className="form-select"
                  value={cancelableTill}
                  onChange={(e) => setCancelableTill(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="awaiting_store_response">Awaiting Store Response</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Is Attachment Required</label>
                <select 
                  className="form-select"
                  value={isAttachmentRequired}
                  onChange={(e) => setIsAttachmentRequired(e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            {/* Row 3: Featured, Requires OTP */}
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Requires OTP <span style={{ cursor: 'help', color: '#64748b', fontSize: '14px' }} title="OTP is required for delivery validation">ⓘ</span>
                </label>
                <select 
                  className="form-select"
                  value={requiresOtp}
                  onChange={(e) => setRequiresOtp(e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            {/* Row 4: Returnable Days, Warranty, Guarantee */}
            <div className="form-grid-3">
              <div className="form-group">
                <label>Returnable Days</label>
                <input 
                  type="number" 
                  placeholder="Enter Returnable Days" 
                  className="form-input" 
                  value={returnableDays}
                  onChange={(e) => setReturnableDays(e.target.value)}
                  disabled={isReturnable !== '1'}
                />
                <p className="field-hint" style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>Required if Product is returnable</p>
              </div>
              <div className="form-group">
                <label>Warranty Period</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Year" 
                  className="form-input" 
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Guarantee Period</label>
                <input 
                  type="text" 
                  placeholder="e.g. 6 Months" 
                  className="form-input" 
                  value={guaranteePeriod}
                  onChange={(e) => setGuaranteePeriod(e.target.value)}
                />
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
                  <option value="simple">Simple</option>
                  <option value="variable">Variable Product</option>
                </select>
              </div>
            </div>

            {productType === 'simple' && (
              <div className="simple-dimensions-form" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Barcode</label>
                  <input 
                    type="text" 
                    placeholder="Enter Barcode" 
                    className="form-input" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Enter Weight" 
                      className="form-input" 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <div className="suffix">kg</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Height</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Enter Height" 
                      className="form-input" 
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <div className="suffix">CM</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Length</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Enter Length" 
                      className="form-input" 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                    <div className="suffix">CM</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Breadth</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Enter Breadth" 
                      className="form-input" 
                      value={breadth}
                      onChange={(e) => setBreadth(e.target.value)}
                    />
                    <div className="suffix">CM</div>
                  </div>
                </div>
              </div>
            )}

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
          <div className="images-step-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Main Image Block */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Main Image <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="product-image-upload"
              />

              {imageUrl ? (
                <div 
                  className="selected-image-container"
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '200px',
                    position: 'relative',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setMainFileName('');
                        setMainFileSize('');
                        const fileInput = document.getElementById('product-image-upload');
                        if (fileInput) fileInput.value = '';
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px', wordBreak: 'break-all' }}>
                        {mainFileName || 'product_image.jpg'}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        {mainFileSize || 'Unknown size'}
                      </span>
                      <button
                        type="button"
                        onClick={() => document.getElementById('product-image-upload').click()}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#3b82f6',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                          marginTop: '6px'
                        }}
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => document.getElementById('product-image-upload').click()}
                    style={{ flex: '1', display: 'flex', justifyContent: 'center', maxHeight: '160px', cursor: 'pointer' }}
                    title="Click to change image"
                  >
                    <img 
                      src={imageUrl} 
                      alt="Selected Main Preview" 
                      style={{ 
                        maxHeight: '160px', 
                        maxWidth: '100%', 
                        objectFit: imageFit || 'cover', 
                        borderRadius: '6px' 
                      }} 
                    />
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById('product-image-upload').click()}
                  style={{
                    border: '1.5px dashed #334155',
                    borderRadius: '8px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#0f172a',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                >
                  <div style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Drag & Drop your files or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>Browse</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    Supported formats: JPG, PNG, WEBP, JFIF
                  </div>
                </div>
              )}
              {uploading && <div style={{ color: '#3b82f6', fontSize: '13px', marginTop: '6px' }}>Uploading image...</div>}
            </div>

            {/* Additional Images Block */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Additional Images
              </label>
              
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                id="additional-images-upload" 
                style={{ display: 'none' }} 
                onChange={handleAdditionalFilesChange} 
              />

              {additionalImages.length > 0 ? (
                <div 
                  className="additional-images-list"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  {additionalImages.map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#000'
                      }}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Additional Preview ${idx}`} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalImages(additionalImages.filter((_, i) => i !== idx));
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Add More button */}
                  <div
                    onClick={() => document.getElementById('additional-images-upload').click()}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '6px',
                      border: '1.5px dashed #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b',
                      fontSize: '24px',
                      backgroundColor: 'transparent',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                  >
                    +
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById('additional-images-upload').click()}
                  style={{
                    border: '1.5px dashed #334155',
                    borderRadius: '8px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#0f172a',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                >
                  <div style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Drag & Drop your files or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>Browse</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    Supported formats: JPG, PNG, WEBP, JFIF
                  </div>
                </div>
              )}
              {uploadingAdditional && <div style={{ color: '#3b82f6', fontSize: '13px', marginTop: '6px' }}>Uploading additional images...</div>}
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                You can select multiple images at once
              </div>
            </div>

            {/* Image Fit Option */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                Image Fit
              </label>
              <select 
                className="form-select"
                value={imageFit}
                onChange={(e) => setImageFit(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid #334155', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </div>

            {/* Video Type Option */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                Video Type
              </label>
              <select 
                className="form-select"
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid #334155', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="">Select Video Type</option>
                <option value="self_hosted">Self Hosted</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </div>

            {/* Video Link Option (Conditional) */}
            {videoType && (
              <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  Video Link
                </label>
                <input 
                  type="text"
                  placeholder="Enter Video Link / URL"
                  className="form-input"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '6px', 
                    border: '1px solid #334155', 
                    backgroundColor: '#0f172a', 
                    color: '#ffffff' 
                  }}
                />
              </div>
            )}
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

            {/* Custom Product Sections Block */}
            <div className="custom-sections-block" style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#fff', fontSize: '15px' }}>Custom Product Sections</label>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>Add custom sections with fields. Upload an image for each field if needed.</p>

              {customSections.map((sec, secIdx) => (
                <div key={secIdx} className="custom-section-card" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                    <input 
                      type="text"
                      placeholder="Section Title (e.g. Specifications)"
                      value={sec.title}
                      onChange={(e) => updateSectionTitle(secIdx, e.target.value)}
                      className="form-input"
                      style={{ fontWeight: '600', maxWidth: '300px' }}
                    />
                    <button 
                      type="button"
                      onClick={() => removeSection(secIdx)}
                      style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete Section
                    </button>
                  </div>

                  {sec.fields.map((field, fieldIdx) => (
                    <div key={fieldIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <input 
                        type="text"
                        placeholder="Field Label (e.g. Color)"
                        value={field.label}
                        onChange={(e) => updateSectionField(secIdx, fieldIdx, 'label', e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="text"
                        placeholder="Field Value (e.g. Red)"
                        value={field.value}
                        onChange={(e) => updateSectionField(secIdx, fieldIdx, 'value', e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button"
                        onClick={() => removeSectionField(secIdx, fieldIdx)}
                        style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 8px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={() => addFieldToSection(secIdx)}
                    style={{ border: '1px dashed #334155', color: '#cbd5e1', backgroundColor: 'transparent', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}
                  >
                    + Add Field to Section
                  </button>
                </div>
              ))}

              <button 
                type="button"
                className="btn-add-field"
                onClick={addSection}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', border: '1px solid #3b82f6', backgroundColor: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', marginTop: '8px' }}
              >
                + Add Section
              </button>
            </div>

            {/* Tags Multiselect Block */}
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label>Tags</label>
              <div className="tags-multiselect-container" style={{ border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', backgroundColor: '#0f172a' }}>
                <div className="selected-tags-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {selectedTags.map(tag => (
                    <span key={tag} className="tag-badge" style={{ backgroundColor: '#1e293b', color: '#fff', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedTags.length === 0 && <span style={{ color: '#64748b', fontSize: '13px' }}>No tags selected. Select from below or type.</span>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    className="form-select" 
                    value="" 
                    onChange={(e) => {
                      if (e.target.value && !selectedTags.includes(e.target.value)) {
                        setSelectedTags([...selectedTags, e.target.value]);
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Popular Tag...</option>
                    {["Veg", "Non-Veg", "Biryani", "Burger", "Pizza", "Grocery", "Coffee", "Electronics", "Dessert", "Bakery", "Chinese", "North Indian", "South Indian"]
                      .filter(t => !selectedTags.includes(t))
                      .map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    }
                  </select>
                  <input 
                    type="text" 
                    placeholder="Type custom tag & press Add" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          setSelectedTags([...selectedTags, tagInput.trim()]);
                          setTagInput('');
                        }
                      }
                    }}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (tagInput.trim()) {
                        setSelectedTags([...selectedTags, tagInput.trim()]);
                        setTagInput('');
                      }
                    }}
                    style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
              </div>
              <p className="field-hint" style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>You can select multiple tags.</p>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="pricing-step-form">
            {/* Tax Rates/Group Selection */}
            <div className="form-group">
              <label>Tax Group</label>
              <div className="select-box">
                <select 
                  className="form-select" 
                  value={selectedTaxGroups[0] || ''}
                  onChange={(e) => setSelectedTaxGroups(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Search Tax Group</option>
                  {taxRates.map(rate => (
                    <option key={rate.id} value={rate.id}>{rate.title} ({rate.percentage}%)</option>
                  ))}
                </select>
              </div>
              <p className="field-hint" style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>You can select multiple tax Groups.</p>
            </div>

            {/* Is Inclusive Tax Switch */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', cursor: 'pointer', userSelect: 'none' }} onClick={() => setIsInclusiveTax(!isInclusiveTax)}>
              <div className={`toggle-switch ${isInclusiveTax ? 'active' : ''}`} style={{
                width: '40px',
                height: '20px',
                borderRadius: '10px',
                backgroundColor: isInclusiveTax ? '#3b82f6' : '#334155',
                position: 'relative',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: isInclusiveTax ? '22px' : '2px',
                  transition: 'left 0.2s'
                }}></div>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>Is Inclusive Tax</span>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>If enabled, prices you enter are treated as tax-inclusive.</p>
              </div>
            </div>

            {/* Store Pricing Section */}
            {productType === 'simple' && (
              <div className="store-pricing-section" style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#fff', fontSize: '15px', marginBottom: '4px' }}>Store Pricing</label>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>Set pricing for each store</p>

                {stores.map(store => {
                  const pricing = storePricing[store.id] || { price: '', specialPrice: '', cost: '', stock: '', sku: '' };

                  const updatePricingField = (field, val) => {
                    setStorePricing({
                      ...storePricing,
                      [store.id]: {
                        ...pricing,
                        [field]: val
                      }
                    });
                  };

                  return (
                    <div key={store.id} className="store-pricing-card" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: '#fff', margin: 0, fontWeight: '600', fontSize: '14px' }}>{store.name}</h4>
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = { ...storePricing };
                            delete updated[store.id];
                            setStorePricing(updated);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '16px' }}
                          title="Remove store pricing config"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="pricing-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Price</label>
                          <div className="input-with-prefix" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b', fontSize: '14px' }}>₹</span>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              className="form-input" 
                              style={{ paddingLeft: '22px' }}
                              value={pricing.price || pricing.price === 0 ? pricing.price : ''}
                              onChange={(e) => updatePricingField('price', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Special Price</label>
                          <div className="input-with-prefix" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b', fontSize: '14px' }}>₹</span>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              className="form-input" 
                              style={{ paddingLeft: '22px' }}
                              value={pricing.specialPrice || pricing.specialPrice === 0 ? pricing.specialPrice : (pricing.special_price || '')}
                              onChange={(e) => updatePricingField('specialPrice', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Cost</label>
                          <div className="input-with-prefix" style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b', fontSize: '14px' }}>₹</span>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              className="form-input" 
                              style={{ paddingLeft: '22px' }}
                              value={pricing.cost || pricing.cost === 0 ? pricing.cost : ''}
                              onChange={(e) => updatePricingField('cost', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Stock</label>
                          <input 
                            type="number" 
                            placeholder="Stock" 
                            className="form-input" 
                            value={pricing.stock || pricing.stock === 0 ? pricing.stock : ''}
                            onChange={(e) => updatePricingField('stock', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>SKU</label>
                          <input 
                            type="text" 
                            placeholder="SKU" 
                            className="form-input" 
                            value={pricing.sku || ''}
                            onChange={(e) => updatePricingField('sku', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stores.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Loading active stores list...</p>
                )}
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
