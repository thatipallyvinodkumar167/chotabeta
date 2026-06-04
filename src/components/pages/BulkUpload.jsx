import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload as UploadIcon, FileArchive } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './BulkUpload.css';

const BulkUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State Management
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Validate and handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 10MB limit.');
      setFile(null);
      return;
    }

    // Check extension
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'csv') {
      setError('Invalid file type. Please upload a CSV (.csv) file.');
      setFile(null);
      return;
    }

    setError(null);
    setMessage(null);
    setFile(selectedFile);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Download template CSV from the backend
  const handleTemplateDownload = () => {
    window.location.href = `${API_BASE_URL}/products/bulk-template`;
  };

  // Upload CSV file to backend bulk-upload endpoint
  const handleCsvUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/products/bulk-upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Successfully uploaded and processed products.');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.message || 'Failed to process CSV upload.');
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError('An error occurred while connecting to the server. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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

        {/* Notifications / Alerts */}
        {message && (
          <div className="alert-message alert-success">
            {message}
          </div>
        )}
        {error && (
          <div className="alert-message alert-danger">
            {error}
          </div>
        )}

        {/* Instructions Box */}
        <div className="instructions-box">
          <div className="instructions-content">
            <span className="label">Instructions</span>
            <ul className="instructions-list">
              <li>Upload a CSV up to 10MB. First row should include headers.</li>
              <li>Required fields: <strong>category_id</strong>, <strong>title</strong> (Note: <strong>title</strong> is needed to identify the product).</li>
              <li>Optional fields: title, handle, type, base_prep_time, brand_id, image_fit, short_description, description, minimum_order_quantity, quantity_step_size, total_allowed_quantity, is_returnable, returnable_days, is_cancelable, cancelable_till, is_attachment_required, featured, requires_otp, video_type, video_link, warranty_period, guarantee_period, made_in, hsn_code, tags, option1_name/value, option2_name/value, option3_name/value, store_id, variant_sku, variant_price, variant_special_price, variant_cost, variant_stock, variant_barcode, variant_weight, variant_height, variant_length, variant_breadth, variant_is_default</li>
              <li>Images upload is a separate step. After creating products via CSV, go to <span className="link-text">Images Upload</span> to attach main/additional/variant images using a ZIP file.</li>
            </ul>
          </div>
          <div className="download-template-side" onClick={handleTemplateDownload}>
            <div className="template-box">
              <Download size={24} className="template-icon" />
              <span className="link-text">Download Template</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-container">
          <label className="upload-label">
            {file ? 'Selected CSV File' : 'Drag & drop CSV here, or click to browse'}
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, text/csv, application/vnd.ms-excel"
            style={{ display: 'none' }}
          />

          {!file ? (
            <div
              className={`csv-upload-box ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerBrowse}
            >
              <p>Drag & Drop your CSV or <span className="browse-link">Browse</span></p>
            </div>
          ) : (
            <div className="selected-file-box">
              <div className="file-info">
                <FileArchive size={32} className="file-icon" />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                className="btn-remove-file"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          )}
          <span className="upload-info">.csv, max 10MB</span>
        </div>

        {/* Action Buttons */}
        <div className="bulk-footer-actions">
          <button
            className="btn-upload-blue"
            onClick={handleCsvUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
          <button
            className="btn-outline-blue"
            onClick={handleTemplateDownload}
            disabled={uploading}
          >
            Download Template
          </button>
          <button
            className="btn-outline-blue"
            disabled={true}
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Images upload is currently handled separately"
          >
            Upload Images ZIP
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
