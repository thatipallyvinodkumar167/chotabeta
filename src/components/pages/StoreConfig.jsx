import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, IndentDecrease, IndentIncrease, RemoveFormatting } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './StoreConfig.css';

const RichTextToolbar = () => (
  <div className="rich-text-toolbar">
    <button type="button" className="rt-btn"><Bold size={14} /></button>
    <button type="button" className="rt-btn"><Italic size={14} /></button>
    <button type="button" className="rt-btn"><Type size={14} /></button>
    <div className="rt-divider"></div>
    <button type="button" className="rt-btn"><AlignLeft size={14} /></button>
    <button type="button" className="rt-btn"><AlignCenter size={14} /></button>
    <button type="button" className="rt-btn"><AlignRight size={14} /></button>
    <button type="button" className="rt-btn"><AlignJustify size={14} /></button>
    <div className="rt-divider"></div>
    <button type="button" className="rt-btn"><List size={14} /></button>
    <button type="button" className="rt-btn"><ListOrdered size={14} /></button>
    <button type="button" className="rt-btn"><IndentDecrease size={14} /></button>
    <button type="button" className="rt-btn"><IndentIncrease size={14} /></button>
    <div className="rt-divider"></div>
    <button type="button" className="rt-btn"><RemoveFormatting size={14} /></button>
  </div>
);

const StoreConfig = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('scheduling');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [config, setConfig] = useState({
    timing: '',
    order_preparation_time: '15',
    status: 'online',
    description: '',
    about_us: '',
    promotional_text: '',
    return_replacement_policy: '',
    refund_policy: '',
    terms_and_conditions: '',
    delivery_policy: '',
    metadata: '',
    max_delivery_distance: 10
  });

  const storeName = location.state?.storeName || 'Store';
  const pageTitle = `${storeName} Store Configuration`;

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/stores/${id}`);
        const resData = await response.json();
        if (resData.success && resData.data) {
          const store = resData.data;
          setConfig({
            timing: store.timing || '',
            order_preparation_time: store.order_preparation_time?.toString() || '15',
            status: store.status || 'online',
            description: store.description || '',
            about_us: store.about_us || '',
            promotional_text: store.promotional_text || '',
            return_replacement_policy: store.return_replacement_policy || '',
            refund_policy: store.refund_policy || '',
            terms_and_conditions: store.terms_and_conditions || '',
            delivery_policy: store.delivery_policy || '',
            metadata: store.metadata || '',
            max_delivery_distance: store.max_delivery_distance || 10
          });
        }
      } catch (err) {
        console.error('Error fetching store config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreDetail();
  }, [id]);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/stores/${id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          order_preparation_time: parseInt(config.order_preparation_time) || 15,
          max_delivery_distance: parseInt(config.max_delivery_distance) || 10
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Store configuration updated successfully');
      } else {
        alert(data.message || 'Failed to update store configuration');
      }
    } catch (err) {
      alert('Error updating configuration: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="store-config-page">
        <div className="content-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-config-page">
      <div className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <div className="breadcrumb">
          <span className="home" onClick={() => navigate('/stores')}>Stores</span>
          <ChevronRight size={14} className="separator-icon" />
          <span className="current active">{pageTitle}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="store-config-layout">
        <div className="store-config-sidebar">
          <h3 className="sidebar-title">Menu</h3>
          <ul className="sidebar-menu">
            <li 
              type="button"
              className={`sidebar-menu-item ${activeTab === 'scheduling' ? 'active' : ''}`}
              onClick={() => setActiveTab('scheduling')}
            >
              Scheduling
            </li>
            <li 
              type="button"
              className={`sidebar-menu-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Store Information
            </li>
            <li 
              type="button"
              className={`sidebar-menu-item ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              Policies
            </li>
            <li 
              type="button"
              className={`sidebar-menu-item ${activeTab === 'metadata' ? 'active' : ''}`}
              onClick={() => setActiveTab('metadata')}
            >
              Metadata
            </li>
          </ul>
        </div>

        <div className="store-config-content">
          <div className="content-card">
            {activeTab === 'scheduling' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Scheduling</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Timing <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={config.timing} 
                      onChange={(e) => handleChange('timing', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Order Preparation Time (minutes) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={config.order_preparation_time} 
                      onChange={(e) => handleChange('order_preparation_time', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Store Status <span className="required">*</span></label>
                    <select 
                      className="form-control" 
                      value={config.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                    <small className="help-text">Select whether the store is available for orders or not</small>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'info' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Store Information</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Description</label>
                    <div className="rich-text-editor">
                      <RichTextToolbar />
                      <textarea 
                        className="rt-textarea" 
                        value={config.description} 
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>About Us</label>
                    <div className="rich-text-editor">
                      <RichTextToolbar />
                      <textarea 
                        className="rt-textarea" 
                        value={config.about_us} 
                        onChange={(e) => handleChange('about_us', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'policies' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Policies</h2>
                </div>
                <div className="tab-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Promotional Text</label>
                      <div className="rich-text-editor">
                        <RichTextToolbar />
                        <textarea 
                          className="rt-textarea" 
                          value={config.promotional_text} 
                          onChange={(e) => handleChange('promotional_text', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Return/Replacement Policy <span className="required">*</span></label>
                      <div className="rich-text-editor">
                        <RichTextToolbar />
                        <textarea 
                          className="rt-textarea" 
                          value={config.return_replacement_policy} 
                          onChange={(e) => handleChange('return_replacement_policy', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Refund Policy <span className="required">*</span></label>
                      <div className="rich-text-editor">
                        <RichTextToolbar />
                        <textarea 
                          className="rt-textarea" 
                          value={config.refund_policy} 
                          onChange={(e) => handleChange('refund_policy', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Terms and Conditions <span className="required">*</span></label>
                      <div className="rich-text-editor">
                        <RichTextToolbar />
                        <textarea 
                          className="rt-textarea" 
                          value={config.terms_and_conditions} 
                          onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Delivery Policy <span className="required">*</span></label>
                    <div className="rich-text-editor">
                      <RichTextToolbar />
                      <textarea 
                        className="rt-textarea" 
                        value={config.delivery_policy} 
                        onChange={(e) => handleChange('delivery_policy', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'metadata' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h2>Status and Metadata</h2>
                </div>
                <div className="tab-body">
                  <div className="form-group full-width">
                    <label>Metadata</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      placeholder="Enter metadata"
                      value={config.metadata}
                      onChange={(e) => handleChange('metadata', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StoreConfig;
