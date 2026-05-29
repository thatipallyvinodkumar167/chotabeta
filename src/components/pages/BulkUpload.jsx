import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload as UploadIcon, FileArchive } from 'lucide-react';
import './BulkUpload.css';

const BulkUpload = () => {
  const navigate = useNavigate();

  return (
    <div className="bulk-upload-page">
      <div className="bulk-upload-card">
        {/* Header Section */}
        <div className="card-header-row">
          <div className="header-info">
            <h1 className="page-title">Bulk Upload Products</h1>
            <div className="breadcrumbs">
              <span>Home</span> / <span>Products</span> / <span className="active">Bulk Upload</span>
            </div>
          </div>
          <button className="btn-back-outline" onClick={() => navigate('/products')}>
            Back
          </button>
        </div>

        {/* Instructions Box */}
        <div className="instructions-box">
          <div className="instructions-content">
            <span className="label">Instructions</span>
            <ul className="instructions-list">
              <li>Upload a CSV up to 10MB. First row should include headers.</li>
              <li>Required fields: <strong>category_id</strong> (Note: <strong>title</strong> or <strong>handle</strong> is also needed to identify the product)</li>
              <li>Optional fields: title, handle, type, base_prep_time, brand_id, image_fit, short_description, description, minimum_order_quantity, quantity_step_size, total_allowed_quantity, is_returnable, returnable_days, is_cancelable, cancelable_till, is_attachment_required, featured, requires_otp, video_type, video_link, warranty_period, guarantee_period, made_in, hsn_code, tags, option1_name/value, option2_name/value, option3_name/value, store_id, variant_sku, variant_price, variant_special_price, variant_cost, variant_stock, variant_barcode, variant_weight, variant_height, variant_length, variant_breadth, variant_is_default</li>
              <li>Images upload is now a separate step. After creating products via CSV, go to <span className="link-text">Images Upload</span> to attach main/additional/variant images using a ZIP file.</li>
            </ul>
          </div>
          <div className="download-template-side">
            <div className="template-box">
              <Download size={24} className="template-icon" />
              <span className="link-text">Download Template</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-container">
          <label className="upload-label">Drag & drop CSV here, or click to browse</label>
          <div className="csv-upload-box">
            <p>Drag & Drop your CSV or <span className="browse-link">Browse</span></p>
          </div>
          <span className="upload-info">.csv, max 10MB</span>
        </div>

        {/* Action Buttons */}
        <div className="bulk-footer-actions">
          <button className="btn-upload-blue">Upload</button>
          <button className="btn-outline-blue">Download Template</button>
          <button className="btn-outline-blue">Upload Images ZIP</button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
