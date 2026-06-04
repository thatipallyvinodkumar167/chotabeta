import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './AddStore.css';

const mockPlaces = [
  {
    name: "Rajampet Railway Station, Piller 19",
    address: "Rajampet, Andhra Pradesh 516115, India",
    landmark: "Near Railway station Piller Number 19",
    city: "Rajampet",
    state: "Andhra Pradesh",
    zipcode: "516115",
    latitude: "14.18559350",
    longitude: "79.15463520",
    x: 350,
    y: 180
  },
  {
    name: "Rajampet RTC Bus Stand",
    address: "Bus Stand Road, Rajampet, Andhra Pradesh 516115, India",
    landmark: "Opposite RTC Bus Stand",
    city: "Rajampet",
    state: "Andhra Pradesh",
    zipcode: "516115",
    latitude: "14.19210400",
    longitude: "79.16104200",
    x: 420,
    y: 120
  },
  {
    name: "Government Hospital Rajampet",
    address: "Hospital Road, Rajampet, Andhra Pradesh 516115, India",
    landmark: "Near Government Hospital",
    city: "Rajampet",
    state: "Andhra Pradesh",
    zipcode: "516115",
    latitude: "14.17830200",
    longitude: "79.14820100",
    x: 280,
    y: 240
  },
  {
    name: "Yogi Vemana University College, Rajampet",
    address: "YVU Road, Rajampet, Andhra Pradesh 516115, India",
    landmark: "Beside University Campus Gate",
    city: "Rajampet",
    state: "Andhra Pradesh",
    zipcode: "516115",
    latitude: "14.16950400",
    longitude: "79.13940200",
    x: 190,
    y: 310
  }
];

const AddStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const tabs = ['basic', 'location', 'logo', 'business', 'bank'];

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedPlaceLabel, setSelectedPlaceLabel] = useState('');

  const getPlaceDisplayNameParts = (place) => {
    if (place.name && place.address && !place.display_name) {
      return { name: place.name, address: place.address };
    }
    const displayName = place.display_name || '';
    const parts = displayName.split(',');
    const name = parts[0]?.trim() || 'Location';
    const address = parts.slice(1).map(p => p.trim()).join(', ') || displayName;
    return { name, address };
  };

  const handleSelectPlace = (place) => {
    const lat = place.lat || place.latitude;
    const lon = place.lon || place.longitude;
    const parts = getPlaceDisplayNameParts(place);
    
    const addrObj = place.address || {};
    const city = addrObj.city || addrObj.town || addrObj.village || addrObj.county || place.city || '';
    const state = addrObj.state || place.state || '';
    const zipcode = addrObj.postcode || place.zipcode || '';
    
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lon);
    
    let x = 350;
    let y = 180;
    
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      const rawX = 350 + (parsedLng - 79.15463520) / 0.0001;
      const rawY = 180 + (14.18559350 - parsedLat) / 0.0001;
      x = Math.max(50, Math.min(650, rawX));
      y = Math.max(50, Math.min(300, rawY));
    }

    setFormData(prev => ({
      ...prev,
      address: parts.name + (parts.address ? ', ' + parts.address : ''),
      landmark: place.landmark || addrObj.suburb || addrObj.neighbourhood || addrObj.road || '',
      city: city,
      state: state,
      zipcode: zipcode,
      latitude: lat,
      longitude: lon
    }));

    setMarkerPos({ x, y });
    setSearchQuery(parts.name);
    setSelectedPlaceLabel(parts.name);
    setShowSuggestions(false);
  };
  
  const isEditMode = !!id;
  const storeName = location.state?.storeName || 'Store';
  const pageTitle = isEditMode ? `Update ${storeName} Store` : 'Register New Store';

  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    landmark: '',
    latitude: '',
    longitude: '',
    fulfillment_type: 'hyperlocal',
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
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [addressProofPreview, setAddressProofPreview] = useState('');
  const [voidedCheckFile, setVoidedCheckFile] = useState(null);
  const [voidedCheckPreview, setVoidedCheckPreview] = useState('');

  const [markerPos, setMarkerPos] = useState({ x: 350, y: 180 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zoom, setZoom] = useState(1);

  const logoInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);
  const addressProofInputRef = React.useRef(null);
  const voidedCheckInputRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);

  useEffect(() => {
    if (isEditMode) {
      fetchStoreDetails();
    }

    // Scroll spy for sidebar menu active highlighting
    const sections = tabs.map(tab => document.getElementById(tab));
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    // Click outside handler for map search suggestions
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchResults, searchQuery]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
        const query = searchQuery.toLowerCase();
        const matches = mockPlaces.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.address.toLowerCase().includes(query) ||
          p.landmark.toLowerCase().includes(query)
        );
        setSearchResults(matches);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
          landmark: store.landmark || '',
          latitude: store.latitude || '',
          longitude: store.longitude || '',
          fulfillment_type: store.fulfillment_type || 'hyperlocal',
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
        if (store.address_proof) setAddressProofPreview(store.address_proof);
        if (store.voided_check) setVoidedCheckPreview(store.voided_check);
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

  const handleAddressProofChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAddressProofFile(file);
      setAddressProofPreview(URL.createObjectURL(file));
    }
  };

  const handleVoidedCheckChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVoidedCheckFile(file);
      setVoidedCheckPreview(URL.createObjectURL(file));
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
      scrollToSection('basic');
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
      if (addressProofFile) {
        data.append('address_proof', addressProofFile);
      }
      if (voidedCheckFile) {
        data.append('voided_check', voidedCheckFile);
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

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const renderFileUploader = (label, fileInputRef, fileChangeHandler, fileObj, previewUrl, isRequired = false) => {
    const hasPreview = !!previewUrl;
    const fileName = fileObj ? fileObj.name : getFileNameFromUrl(previewUrl);
    const fileSize = fileObj ? `${(fileObj.size / 1024).toFixed(0)} KB` : 'Uploaded Document';
    const isPdf = fileObj ? (fileObj.type === 'application/pdf') : (previewUrl && previewUrl.toLowerCase().includes('.pdf'));

    const handleRemove = (e) => {
      e.stopPropagation();
      if (fileInputRef === logoInputRef) {
        setLogoFile(null);
        setLogoPreview('');
      } else if (fileInputRef === bannerInputRef) {
        setBannerFile(null);
        setBannerPreview('');
      } else if (fileInputRef === addressProofInputRef) {
        setAddressProofFile(null);
        setAddressProofPreview('');
      } else if (fileInputRef === voidedCheckInputRef) {
        setVoidedCheckFile(null);
        setVoidedCheckPreview('');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className="form-group full-width" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
          {label} {isRequired && <span className="required">*</span>}
        </label>
        
        {hasPreview ? (
          <div 
            className="premium-upload-box"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={fileChangeHandler} 
              accept="image/*,application/pdf" 
              style={{ display: 'none' }} 
            />
            <div className="premium-upload-info">
              <button type="button" className="premium-upload-remove" onClick={handleRemove}>×</button>
              <div className="premium-upload-meta">
                <span className="premium-upload-filename">{fileName}</span>
                <span className="premium-upload-size">{fileSize}</span>
              </div>
            </div>
            
            {isPdf ? (
              <div className="pdf-preview-badge">
                📄 PDF
              </div>
            ) : (
              <img 
                src={previewUrl} 
                alt={`${label} Preview`} 
                className={`premium-upload-preview ${fileInputRef === bannerInputRef ? 'banner-preview' : ''}`} 
              />
            )}
          </div>
        ) : (
          <div 
            className="file-drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (fileInputRef === logoInputRef) {
                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                } else if (fileInputRef === bannerInputRef) {
                  setBannerFile(file);
                  setBannerPreview(URL.createObjectURL(file));
                } else if (fileInputRef === addressProofInputRef) {
                  setAddressProofFile(file);
                  setAddressProofPreview(URL.createObjectURL(file));
                } else if (fileInputRef === voidedCheckInputRef) {
                  setVoidedCheckFile(file);
                  setVoidedCheckPreview(URL.createObjectURL(file));
                }
              }
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={fileChangeHandler} 
              accept="image/*,application/pdf" 
              style={{ display: 'none' }} 
            />
            <p>Drag & Drop your files or <span className="browse-link">Browse</span></p>
          </div>
        )}
      </div>
    );
  };

  const MapMockup = () => {
    const viewBoxWidth = 700 / zoom;
    const viewBoxHeight = 350 / zoom;
    
    let viewBoxX = markerPos.x - viewBoxWidth / 2;
    let viewBoxY = markerPos.y - viewBoxHeight / 2;
    
    if (viewBoxX < 0) viewBoxX = 0;
    if (viewBoxY < 0) viewBoxY = 0;
    if (viewBoxX + viewBoxWidth > 700) viewBoxX = 700 - viewBoxWidth;
    if (viewBoxY + viewBoxHeight > 350) viewBoxY = 350 - viewBoxHeight;

    const handleMapClick = async (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickClientX = e.clientX - rect.left;
      const clickClientY = e.clientY - rect.top;
      
      const percentX = clickClientX / rect.width;
      const percentY = clickClientY / rect.height;
      
      const clickedInternalX = viewBoxX + (percentX * viewBoxWidth);
      const clickedInternalY = viewBoxY + (percentY * viewBoxHeight);
      
      const clickedLat = (14.18559350 - ((clickedInternalY - 180) * 0.0001)).toFixed(8);
      const clickedLng = (79.15463520 + ((clickedInternalX - 350) * 0.0001)).toFixed(8);
      
      setFormData(prev => ({
        ...prev,
        latitude: clickedLat,
        longitude: clickedLng
      }));
      
      setMarkerPos({ x: clickedInternalX, y: clickedInternalY });
      setSelectedPlaceLabel(`Selected Point (${parseFloat(clickedLat).toFixed(4)}, ${parseFloat(clickedLng).toFixed(4)})`);
      
      // Dynamic reverse geocode clicked map point
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLat}&lon=${clickedLng}&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          const displayName = data.display_name;
          const addrObj = data.address || {};
          const city = addrObj.city || addrObj.town || addrObj.village || addrObj.county || '';
          const state = addrObj.state || '';
          const zipcode = addrObj.postcode || '';
          const landmark = addrObj.suburb || addrObj.neighbourhood || addrObj.road || '';
          
          const parts = displayName.split(',');
          const name = parts[0]?.trim() || 'Selected Location';

          setFormData(prev => ({
            ...prev,
            address: displayName,
            landmark: landmark || prev.landmark,
            city: city || prev.city,
            state: state || prev.state,
            zipcode: zipcode || prev.zipcode
          }));
          setSearchQuery(displayName);
          setSelectedPlaceLabel(name);
        }
      } catch (err) {
        console.error("Failed to reverse geocode clicked location:", err);
      }
    };

    const handleGetLiveLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setFormData(prev => ({
              ...prev,
              latitude: lat.toFixed(8),
              longitude: lng.toFixed(8),
              address: `Live Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
              landmark: "Detected Live Location"
            }));
            
            const rawX = 350 + (lng - 79.15463520) / 0.0001;
            const rawY = 180 + (14.18559350 - lat) / 0.0001;
            const x = Math.max(50, Math.min(650, rawX));
            const y = Math.max(50, Math.min(300, rawY));
            
            setMarkerPos({ x, y });
            setSearchQuery(`Live Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
            setSelectedPlaceLabel("My Live Location");
            setZoom(1.5);

            // Attempt to reverse geocode live coordinates using Nominatim API
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
              const data = await res.json();
              if (data && data.display_name) {
                const displayName = data.display_name;
                const addrObj = data.address || {};
                const city = addrObj.city || addrObj.town || addrObj.village || addrObj.county || '';
                const state = addrObj.state || '';
                const zipcode = addrObj.postcode || '';
                const landmark = addrObj.suburb || addrObj.neighbourhood || addrObj.road || "Detected Live Location";

                const parts = displayName.split(',');
                const name = parts[0]?.trim() || 'Live Location';

                setFormData(prev => ({
                  ...prev,
                  address: displayName,
                  landmark: landmark,
                  city: city,
                  state: state,
                  zipcode: zipcode
                }));
                setSearchQuery(displayName);
                setSelectedPlaceLabel(name);
              }
            } catch (err) {
              console.error("Failed to reverse geocode live location:", err);
            }
          },
          (error) => {
            setError("Failed to get live location: " + error.message);
            setTimeout(() => setError(null), 5000);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser");
        setTimeout(() => setError(null), 5000);
      }
    };

    const getSuggestionsToDisplay = () => {
      if (!searchQuery) return mockPlaces;
      return searchResults.length > 0 ? searchResults : mockPlaces.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    const handleKeyDown = (e) => {
      const suggestions = getSuggestionsToDisplay();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const index = focusedIndex >= 0 ? focusedIndex : 0;
        if (suggestions[index]) {
          handleSelectPlace(suggestions[index]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    return (
      <div className="map-container-placeholder" style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px', backgroundColor: '#0b1329', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <svg 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair' }}
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          onClick={handleMapClick}
        >
          <rect width="100%" height="100%" fill="#cadcf5" />
          <path d="M -50 100 Q 150 150 250 80 T 600 200 L 600 0 L -50 0 Z" fill="#7ba0e0" opacity="0.6" />
          <path d="M 300 350 Q 450 250 550 320 T 900 280 L 900 350 Z" fill="#7ba0e0" opacity="0.6" />
          <path d="M -20 180 L 800 220" stroke="#ffffff" strokeWidth="8" fill="none" />
          <path d="M -20 180 L 800 220" stroke="#ffe0b2" strokeWidth="6" fill="none" />
          <path d="M 250 -20 L 320 400" stroke="#ffffff" strokeWidth="8" fill="none" />
          <path d="M 250 -20 L 320 400" stroke="#ffe0b2" strokeWidth="6" fill="none" />
          <path d="M 500 -20 Q 420 150 550 400" stroke="#ffffff" strokeWidth="6" fill="none" />
          <path d="M 500 -20 Q 420 150 550 400" stroke="#ffe0b2" strokeWidth="4" fill="none" />
          <path d="M -20 50 L 800 70" stroke="#ffffff" strokeWidth="3" fill="none" />
          <path d="M -20 300 L 800 310" stroke="#ffffff" strokeWidth="3" fill="none" />
          <path d="M 100 -20 L 150 400" stroke="#ffffff" strokeWidth="3" fill="none" />
          <path d="M 700 -20 L 650 400" stroke="#ffffff" strokeWidth="3" fill="none" />
          <rect x="50" y="220" width="120" height="60" rx="5" fill="#a5d6a7" opacity="0.7" />
          <rect x="550" y="80" width="100" height="90" rx="8" fill="#a5d6a7" opacity="0.7" />
          <circle cx="350" cy="180" r="150" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="350" cy="180" r="148" fill="none" stroke="#60a5fa" strokeWidth="1" />
          
          {/* Styled Area Name Labels (legible white halo design) */}
          <text x="350" y="208" fill="#1e293b" fontSize="10px" fontWeight="700" textAnchor="middle" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>Rajampet Railway Station</text>
          <text x="420" y="145" fill="#1e293b" fontSize="10px" fontWeight="700" textAnchor="middle" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>RTC Bus Stand</text>
          <text x="280" y="265" fill="#1e293b" fontSize="10px" fontWeight="700" textAnchor="middle" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>Government Hospital</text>
          <text x="190" y="330" fill="#1e293b" fontSize="10px" fontWeight="700" textAnchor="middle" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>YVU College Campus</text>
          <text x="550" y="110" fill="#0369a1" fontSize="9px" fontWeight="600" textAnchor="middle" stroke="#ffffff" strokeWidth="2" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>Green Park Town</text>
          <text x="100" y="80" fill="#475569" fontSize="9px" fontWeight="600" textAnchor="middle" stroke="#ffffff" strokeWidth="2" paintOrder="stroke" style={{ pointerEvents: 'none', userSelect: 'none' }}>National Highway 164</text>
          
          {selectedPlaceLabel && (
            <text 
              x={markerPos.x} 
              y={markerPos.y - 42} 
              fill="#ef4444" 
              fontSize="11px" 
              fontWeight="800" 
              textAnchor="middle" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              paintOrder="stroke" 
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              📍 {selectedPlaceLabel}
            </text>
          )}

          <g transform={`translate(${markerPos.x}, ${markerPos.y})`}>
            <ellipse cx="0" cy="0" rx="8" ry="3" fill="rgba(0,0,0,0.25)" />
            <path d="M 0 -36 C -10 -36 -14 -26 -14 -18 C -14 -8 0 0 0 0 C 0 0 14 -8 14 -18 C 14 -26 10 -36 0 -36 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="0" cy="-22" r="5" fill="#ffffff" />
          </g>
        </svg>

        <div ref={searchContainerRef} className="map-search-box" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, backgroundColor: '#1e293b', borderRadius: '6px', padding: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '320px' }}>
          <label style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Search for a place or click on map:</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', color: '#64748b', fontSize: '14px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search or select place..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="form-control" 
              style={{ paddingLeft: '32px', paddingRight: '28px', height: '32px', fontSize: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
            />
            {searchQuery && (
              <span 
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                  setSelectedPlaceLabel('');
                }}
                style={{ position: 'absolute', right: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
              >
                ×
              </span>
            )}
          </div>

          {showSuggestions && (
            <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginTop: '4px', maxHeight: '180px', overflowY: 'auto', zIndex: 100, position: 'absolute', width: '300px', left: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              {searchLoading && (
                <div style={{ padding: '8px 12px', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="search-spinner" style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }}></div>
                  Searching...
                </div>
              )}
              {getSuggestionsToDisplay().map((place, idx) => {
                const parts = getPlaceDisplayNameParts(place);
                return (
                  <div 
                    key={idx}
                    onClick={() => handleSelectPlace(place)}
                    style={{ 
                      padding: '8px 12px', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      textAlign: 'left', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '2px',
                      backgroundColor: idx === focusedIndex ? 'rgba(59, 130, 246, 0.15)' : 'transparent'
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>📍 {parts.name}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', paddingLeft: '16px' }}>{parts.address}</span>
                  </div>
                );
              })}
              {!searchLoading && getSuggestionsToDisplay().length === 0 && (
                <div style={{ padding: '8px 12px', fontSize: '11px', color: '#64748b' }}>No matches found</div>
              )}
            </div>
          )}
        </div>

        <button type="button" style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z" fill="#666" />
          </svg>
        </button>

        <button type="button" style={{ position: 'absolute', top: '56px', right: '16px', width: '32px', height: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2.26 8.16L13 14v7h-2v-7l-1.26-3.84c-.39-1.21.52-2.43 1.76-2.43h1.24c1.24 0 2.15 1.22 1.76 2.43z" fill="#f4b400" />
          </svg>
        </button>

        {/* GPS Locate Button */}
        <button 
          type="button" 
          onClick={handleGetLiveLocation}
          title="Use Live Location"
          style={{ 
            position: 'absolute', 
            bottom: '96px', 
            right: '16px', 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#ffffff', 
            border: 'none', 
            borderRadius: '2px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)', 
            cursor: 'pointer' 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="1" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="1" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="23" y2="12" />
            <circle cx="12" cy="12" r="3" fill="#666" />
          </svg>
        </button>

        <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
          <button type="button" onClick={() => setZoom(prev => Math.min(prev + 0.5, 3.5))} style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', border: 'none', borderBottom: '1px solid #e6e6e6', fontSize: '18px', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
          <button type="button" onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))} style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
        </div>
      </div>
    );
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
              onClick={() => scrollToSection('basic')}
            >
              Basic Details
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => scrollToSection('location')}
            >
              Location Details
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'logo' ? 'active' : ''}`}
              onClick={() => scrollToSection('logo')}
            >
              Logo & Banner
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => scrollToSection('business')}
            >
              Business Documents
            </li>
            <li 
              className={`sidebar-menu-item ${activeTab === 'bank' ? 'active' : ''}`}
              onClick={() => scrollToSection('bank')}
            >
              Bank Details
            </li>
          </ul>
        </div>

        <div className="add-store-content">
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px', backgroundColor: '#1e293b' }}>
            
            {/* Basic Details Section */}
            <div className="tab-pane" id="basic" style={{ display: 'block', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '32px' }}>
              <div className="tab-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>Basic Details</h2>
              </div>
              <div className="tab-body" style={{ padding: '16px 0 0 0' }}>
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
                <div className="form-group full-width">
                  <label>Fulfillment Type <span className="required">*</span></label>
                  <select name="fulfillment_type" value={formData.fulfillment_type} onChange={handleChange} className="form-control">
                    <option value="hyperlocal">Hyperlocal</option>
                    <option value="regular">Regular</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Details Section */}
            <div className="tab-pane" id="location" style={{ display: 'block', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '32px' }}>
              <div className="tab-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>Location Details</h2>
              </div>
              <div className="tab-body" style={{ padding: '16px 0 0 0' }}>
                <div className="info-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', marginBottom: '24px', lineHeight: '1.5' }}>
                  Your store location must be within our available delivery areas. Please select a location inside the blue highlighted zones on the map.
                </div>
                
                {/* Styled Map Mockup */}
                <MapMockup />
                
                <div className="form-group full-width">
                  <label>Country <span className="required">*</span></label>
                  <select className="form-control" disabled value="India">
                    <option value="India">🇮🇳 India</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Address <span className="required">*</span></label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="Enter address" />
                </div>
                
                <div className="form-group full-width">
                  <label>Landmark <span className="required">*</span></label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="form-control" placeholder="Enter landmark" />
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="form-control" placeholder="Enter latitude" />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="form-control" placeholder="Enter longitude" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo & Banner Section */}
            <div className="tab-pane" id="logo" style={{ display: 'block', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '32px' }}>
              <div className="tab-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>Logo & Banner</h2>
              </div>
              <div className="tab-body" style={{ padding: '16px 0 0 0' }}>
                {renderFileUploader('Store Logo', logoInputRef, handleLogoChange, logoFile, logoPreview, true)}
                {renderFileUploader('Store Banner', bannerInputRef, handleBannerChange, bannerFile, bannerPreview, false)}
              </div>
            </div>

            {/* Business Documents Section */}
            <div className="tab-pane" id="business" style={{ display: 'block', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '32px' }}>
              <div className="tab-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>Business Documents</h2>
              </div>
              <div className="tab-body" style={{ padding: '16px 0 0 0' }}>
                {renderFileUploader('Address Proof', addressProofInputRef, handleAddressProofChange, addressProofFile, addressProofPreview, true)}
                {renderFileUploader('Voided Check', voidedCheckInputRef, handleVoidedCheckChange, voidedCheckFile, voidedCheckPreview, true)}
                
                <div className="form-group full-width" style={{ marginTop: '24px' }}>
                  <label>Tax Name <span className="required">*</span></label>
                  <input type="text" name="tax_name" value={formData.tax_name} onChange={handleChange} className="form-control" placeholder="Enter tax name (e.g. GST)" />
                </div>
                
                <div className="form-group full-width">
                  <label>Tax Number <span className="required">*</span></label>
                  <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className="form-control" placeholder="Enter tax number" />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="tab-pane" id="bank" style={{ display: 'block' }}>
              <div className="tab-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>Bank Details</h2>
              </div>
              <div className="tab-body" style={{ padding: '16px 0 0 0' }}>
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

          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn-submit" onClick={handleSubmit} disabled={loading} type="button" style={{ padding: '12px 32px', fontSize: '15px' }}>
              {loading ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
