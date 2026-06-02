import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './AddStore.css';

const AddStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const tabs = ['basic', 'location', 'logo', 'business', 'bank'];
  const currentIndex = tabs.indexOf(activeTab);

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  const isEditMode = !!id;
  const storeName = location.state?.storeName || 'Store';
  const pageTitle = isEditMode ? `Update ${storeName} Store` : 'Register New Store';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    tax_name: '',
    tax_number: '',
    bank_name: '',
    bank_branch_code: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    bank_account_type: 'checking'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const logoInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);

  useEffect(() => {
    if (isEditMode) {
      fetchStoreDetails();
    }
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/stores/${id}`);
      const result = await res.json();
      if (result.success) {
        const store = result.data;
        setFormData({
          name: store.name || '',
          contact_email: store.contact_email || '',
          contact_number: store.contact_number || '',
          address: store.address || '',
          city: store.city || '',
          state: store.state || '',
          zipcode: store.zipcode || '',
          tax_name: store.tax_name || '',
          tax_number: store.tax_number || '',
          bank_name: store.bank_name || '',
          bank_branch_code: store.bank_branch_code || '',
          account_holder_name: store.account_holder_name || '',
          account_number: store.account_number || '',
          routing_number: store.routing_number || '',
          bank_account_type: store.bank_account_type || 'checking'
        });
        if (store.logo) setLogoPreview(store.logo);
        if (store.banner) setBannerPreview(store.banner);
      }
    } catch (err) {
      console.error('Failed to fetch store details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact_email || !formData.contact_number) {
      setError('Please fill in the required basic details.');
      setActiveTab('basic');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const url = isEditMode ? `${API_BASE_URL}/stores/${id}` : `${API_BASE_URL}/stores`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (logoFile) {
        data.append('logo', logoFile);
      }
      if (bannerFile) {
        data.append('banner', bannerFile);
      }
      
      const response = await fetch(url, {
        method,
        body: data
      });
      
      const result = await response.json();
      if (result.success) {
        navigate('/stores');
      } else {
        setError(result.message || 'Failed to save store');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-store-page">
      <div className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <div className="breadcrumb">
          <span className="home" onClick={() => navigate('/stores')}>Stores</span>
          <ChevronRight size={14} className="separator-icon" />
          <span className="current active">{pageTitle}</span>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      <div className="add-store-layout">
        <div className="add-store-sidebar">
          <h3 className="sidebar-title">Menu</h3>
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-menu-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Details
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              Location Details
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'logo' ? 'active' : ''}`}
              onClick={() => setActiveTab('logo')}
            >
              Logo & Banner
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              Business Documents
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'bank' ? 'active' : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              Bank Details
            </li>
          </ul>
        </div>

        <div className="add-store-content">
          <div className="content-card">
            {activeTab === 'basic' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Basic Details</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Store Name <span className="required">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Enter store name" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email <span className="required">*</span></label>
                      <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="form-control" placeholder="Enter email address" />
                    </div>
                    <div className="form-group">
                      <label>Contact Number <span className="required">*</span></label>
                      <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="form-control" placeholder="Enter mobile number" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'location' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Location Details</h2>
                </div>
                <div className="tab-body">
                  <div className="info-banner">
                    Your store location must be within our available delivery areas.
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address <span className="required">*</span></label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="Enter address" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>City <span className="required">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-control" placeholder="Enter city" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>State <span className="required">*</span></label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-control" placeholder="Enter state" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Zipcode <span className="required">*</span></label>
                    <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className="form-control" placeholder="Enter zipcode" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logo' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Logo & Banner</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Store Logo</label>
                    <div 
                      className="file-drop-zone"
                      onClick={() => logoInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          setLogoFile(file);
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                      style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        onChange={handleLogoChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                      {logoPreview ? (
                        <div className="preview-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px', objectFit: 'cover' }} />
                          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Drag & Drop your files or click to replace</p>
                        </div>
                      ) : (
                        <p>Drag & Drop your files or <span className="browse-link">Browse</span></p>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Store Banner</label>
                    <div 
                      className="file-drop-zone"
                      onClick={() => bannerInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                      }}
                      style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <input 
                        type="file" 
                        ref={bannerInputRef} 
                        onChange={handleBannerChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                      {bannerPreview ? (
                        <div className="preview-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <img src={bannerPreview} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'cover' }} />
                          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Drag & Drop your files or click to replace</p>
                        </div>
                      ) : (
                        <p>Drag & Drop your files or <span className="browse-link">Browse</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Business Documents</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Tax Name <span className="required">*</span></label>
                    <input type="text" name="tax_name" value={formData.tax_name} onChange={handleChange} className="form-control" placeholder="Enter tax name (e.g. GST)" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Tax Number <span className="required">*</span></label>
                    <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className="form-control" placeholder="Enter tax number" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Bank Details</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Bank Name <span className="required">*</span></label>
                    <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-control" placeholder="Enter bank name" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Bank Branch Code <span className="required">*</span></label>
                    <input type="text" name="bank_branch_code" value={formData.bank_branch_code} onChange={handleChange} className="form-control" placeholder="Enter bank branch code" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Account Holder Name <span className="required">*</span></label>
                    <input type="text" name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} className="form-control" placeholder="Enter account holder name" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Account Number <span className="required">*</span></label>
                    <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="form-control" placeholder="Enter account number" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Routing Number <span className="required">*</span></label>
                    <input type="text" name="routing_number" value={formData.routing_number} onChange={handleChange} className="form-control" placeholder="Enter routing number" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Bank Account Type <span className="required">*</span></label>
                    <select name="bank_account_type" value={formData.bank_account_type} onChange={handleChange} className="form-control">
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {currentIndex > 0 && (
              <button className="btn-previous" onClick={handlePrevious} type="button">
                Previous
              </button>
            )}
            
            {currentIndex < tabs.length - 1 ? (
              <button className="btn-next" onClick={handleNext} type="button">
                Next
              </button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit} disabled={loading} type="button">
                {loading ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
