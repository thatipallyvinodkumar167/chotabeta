import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './AddPermissions.css';

const AddPermissions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const roleName = location.state?.roleName || 'Role';

  const [permissions, setPermissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPermissionsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all seller permissions
      const allRes = await fetch(`${API_BASE_URL}/roles/permissions/list`);
      const allResult = await allRes.json();
      if (!allResult.success) throw new Error(allResult.message || 'Failed to fetch permissions');

      // 2. Fetch role detail & assigned permissions
      const roleRes = await fetch(`${API_BASE_URL}/roles/${id}`);
      const roleResult = await roleRes.json();
      if (!roleResult.success) throw new Error(roleResult.message || 'Failed to fetch role info');

      setPermissions(allResult.data);
      
      // Populate active permission IDs
      const activeIds = new Set(roleResult.data.permissions.map(p => p.id));
      setSelectedIds(activeIds);
    } catch (err) {
      setError(err.message || 'An error occurred while loading permissions data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionsData();
  }, [id]);

  // Group permissions dynamically by resource prefix (e.g. "product.view" -> group: "Product", action: "view")
  const groupedPermissions = React.useMemo(() => {
    const groups = {};
    permissions.forEach(perm => {
      const parts = perm.name.split('.');
      const resource = parts[0] || 'general';
      const actionName = parts.slice(1).join('.') || 'access';

      const formattedResource = resource
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (!groups[formattedResource]) {
        groups[formattedResource] = [];
      }
      groups[formattedResource].push({
        id: perm.id,
        name: perm.name,
        action: actionName.replace(/_/g, ' ')
      });
    });
    return groups;
  }, [permissions]);

  const handleTogglePermission = (permId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleToggleGroup = (groupItems, isAllSelected) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      groupItems.forEach(item => {
        if (isAllSelected) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: Array.from(selectedIds) })
      });
      const result = await response.json();
      if (result.success) {
        alert('Permissions updated successfully!');
        navigate('/roles');
      } else {
        alert(result.message || 'Failed to update permissions');
      }
    } catch (err) {
      alert('Error saving permissions: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-permissions-page">
      {/* Top Header Card */}
      <div className="permissions-header-card">
        <h2 className="permissions-page-title">Add Permission to {roleName}</h2>
        <div className="permissions-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/roles')}>Roles</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">Add Permission to {roleName}</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="permissions-content-card">
        <div className="card-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Permissions for: {roleName}</h3>
          <button className="btn-outline-blue" onClick={fetchPermissionsData} disabled={loading} style={{ padding: '6px 12px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        
        <div className="permissions-body">
          {error && <div className="error-message" style={{color: '#ff4d4d', marginBottom: '15px'}}>{error}</div>}
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading permissions list...</div>
          ) : (
            <>
              {Object.keys(groupedPermissions).map((resourceName) => {
                const items = groupedPermissions[resourceName];
                const isAllSelected = items.every(item => selectedIds.has(item.id));
                return (
                  <div className="permission-section" key={resourceName}>
                    <h4 className="permission-title">{resourceName}</h4>
                    <div className="permission-actions-row">
                      <label className="checkbox-label select-all">
                        <input 
                          type="checkbox" 
                          className="custom-checkbox" 
                          checked={isAllSelected}
                          onChange={() => handleToggleGroup(items, isAllSelected)}
                        />
                        <span>Select All</span>
                      </label>
                      
                      {items.map((item) => (
                        <label className="checkbox-label" key={item.id}>
                          <input 
                            type="checkbox" 
                            className="custom-checkbox" 
                            checked={selectedIds.has(item.id)}
                            onChange={() => handleTogglePermission(item.id)}
                          />
                          <span>{item.action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="form-actions-bottom">
                <button 
                  className="btn-add-permissions"
                  onClick={handleSavePermissions}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPermissions;
