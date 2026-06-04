import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  CheckCheck,
  Check,
  ChevronDown,
  Download,
  Database,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Trash2,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  X
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import '../../tailwind.css';

const SortIcons = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', opacity: 0.3 }}>
    <ChevronDown size={11} style={{ transform: 'rotate(180deg)', display: 'block' }} />
    <ChevronDown size={11} style={{ display: 'block' }} />
  </div>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, read, unread

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Columns & Dropdown States
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const columnsRef = useRef(null);
  const exportRef = useRef(null);

  // View Modal State
  const [viewNotification, setViewNotification] = useState(null);

  // Active visible columns state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    message: true,
    status: true,
    createdAt: true,
    action: true
  });

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnsRef.current && !columnsRef.current.contains(event.target)) {
        setShowColumnsDropdown(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
      });
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams.toString()}`);
      const resData = await response.json();
      
      if (resData.success) {
        setNotifications(resData.data);
        setTotalEntries(resData.pagination.total);
        setTotalPages(resData.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, limit, search, statusFilter]);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
      });
      const resData = await response.json();
      if (resData.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      alert("Failed to mark all notifications as read");
    }
  };

  const handleMarkAsRead = async (id, currentReadAt) => {
    try {
      const nextStatus = currentReadAt ? 'unread' : 'read';
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const resData = await response.json();
      
      if (resData.success) {
        fetchNotifications();
        // If the current viewed notification is marked as read/unread, update it in modal too
        if (viewNotification && viewNotification.id === id) {
          setViewNotification(prev => prev ? { ...prev, read_at: nextStatus === 'read' ? new Date().toISOString() : null } : null);
        }
      }
    } catch (err) {
      console.error("Error updating notification status:", err);
      alert("Failed to update notification status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification record?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE'
      });
      const resData = await response.json();
      
      if (resData.success) {
        fetchNotifications();
        if (viewNotification && viewNotification.id === id) {
          setViewNotification(null);
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification");
    }
  };

  const handleExportCSV = () => {
    if (notifications.length === 0) return;
    const csvHeaders = "ID,Title,Message,Status,Created At";
    const csvRows = notifications.map(n => {
      const title = n.data.title || "Notification";
      const message = n.data.message || "";
      const status = n.read_at ? "Read" : "Unread";
      return `"${n.id}","${title.replace(/"/g, '""')}","${message.replace(/"/g, '""')}","${status}","${n.created_at}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [csvHeaders, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `notifications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const handleExportJSON = () => {
    if (notifications.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(notifications, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `notifications_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const headers = [
    { key: "id", label: "ID", width: "120px" },
    { key: "title", label: "TITLE", width: "260px" },
    { key: "message", label: "MESSAGE", width: "auto" },
    { key: "status", label: "STATUS", width: "130px" },
    { key: "createdAt", label: "CREATED AT", width: "180px" },
    { key: "action", label: "ACTION", width: "140px" }
  ];

  const visibleHeaders = headers.filter(h => visibleColumns[h.key]);

  return (
    <div className="p-8 font-sans selection:bg-blue-500/30 text-white min-h-screen bg-[#070b14]">
      {/* Main Container Card */}
      <div className="dashboard-card p-6 shadow-2xl overflow-hidden bg-[#111827] border-[#1e293b] mt-8" style={{ border: '1px solid #1e293b', borderRadius: '12px' }}>
        
        {/* Row 1: Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-[24px] font-semibold tracking-tight">Notifications</h1>
            <nav className="flex items-center gap-2 text-[12px] mt-1">
              <span className="text-blue-500 font-medium cursor-pointer hover:underline">Home</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300">Notifications</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 transition-all duration-300 text-[13px] font-medium border border-[#22c55e] text-[#22c55e] bg-transparent hover:bg-[#22c55e]/10 active:scale-95 rounded-md"
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-2 px-4 py-2 transition-all duration-300 text-[13px] font-medium border border-[#3b82f6] text-[#3b82f6] bg-transparent hover:bg-[#3b82f6]/10 active:scale-95 rounded-md"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Row 2: Filters and Search */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-[240px] bg-[#0c101a] border border-[#2d3748] rounded-md px-4 py-2 text-[13px] text-slate-300 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center gap-2">
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-[#0c101a] border border-[#2d3748] rounded-md pl-3 pr-8 py-2 text-[13px] text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-[13px] text-slate-400">entries per page</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#0c101a] border border-[#2d3748] rounded-md px-3 py-2 text-[13px] text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Columns Dropdown */}
            <div className="relative" ref={columnsRef}>
              <button
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#2d3748] bg-[#0c101a] hover:bg-[#141b2d] rounded-md transition-all active:scale-95 text-slate-300"
              >
                <SlidersHorizontal size={14} /> Columns <ChevronDown size={14} className="opacity-60 ml-1" />
              </button>
              {showColumnsDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-[#1e293b] rounded-md shadow-2xl z-50 p-2">
                  <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1 mb-1 border-b border-[#1e293b]">
                    Toggle Columns
                  </div>
                  {Object.keys(visibleColumns).map((col) => (
                    <label key={col} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#1e293b] rounded cursor-pointer text-[13px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col]}
                        onChange={() => setVisibleColumns(prev => ({
                          ...prev,
                          [col]: !prev[col]
                        }))}
                        className="rounded border-[#2d3748] bg-[#0c101a] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#111827]"
                      />
                      <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#3b82f6] bg-[#0c101a] text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-md transition-all active:scale-95"
              >
                <Download size={14} /> Export <ChevronDown size={14} className="opacity-60 ml-1" />
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-[#111827] border border-[#1e293b] rounded-md shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-slate-300 hover:bg-[#1e293b] transition-colors"
                  >
                    <FileText size={14} className="text-amber-500" /> Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-slate-300 hover:bg-[#1e293b] transition-colors"
                  >
                    <FileSpreadsheet size={14} className="text-blue-500" /> Export JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Table Section */}
        <div className="border border-[#2d3748] overflow-hidden rounded-t-sm overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr style={{ backgroundColor: '#131e35', borderBottom: '1px solid #2d3748' }}>
                {visibleHeaders.map((header, idx) => (
                  <th 
                    key={header.key}
                    style={{ 
                      padding: '12px 16px', 
                      fontSize: '12px',
                      color: '#94a3b8',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                      letterSpacing: '0.05em',
                      width: header.width,
                      whiteSpace: 'nowrap',
                      borderRight: idx === visibleHeaders.length - 1 ? 'none' : '1px solid #2d3748',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {header.label}
                      <SortIcons />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#0c101a' }}>
              {loading ? (
                <tr>
                  <td colSpan={visibleHeaders.length} className="px-6 py-28 text-center bg-[#0c101a]">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw size={20} className="animate-spin text-blue-500" />
                      <p className="text-[14px] text-slate-400 font-medium tracking-wide">Loading notifications...</p>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={visibleHeaders.length} className="px-6 py-28 text-center bg-[#0c101a]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Database size={48} className="text-slate-600 opacity-60" />
                      <p className="text-[14px] text-slate-500 font-medium tracking-wide">No data available.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/10 border-b border-[#2d3748]/50 transition-colors">
                    {visibleColumns.id && (
                      <td className="px-4 py-3.5 border-r border-[#2d3748]/30 text-slate-400 font-mono text-[12px] tracking-tight">{n.id}</td>
                    )}
                    {visibleColumns.title && (
                      <td className="px-4 py-3.5 border-r border-[#2d3748]/30 text-white font-medium text-[13px]">{n.data.title || "Notification"}</td>
                    )}
                    {visibleColumns.message && (
                      <td className="px-4 py-3.5 border-r border-[#2d3748]/30 text-slate-300 text-[13px]">{n.data.message || ""}</td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3.5 border-r border-[#2d3748]/30 text-[13px]">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize tracking-wide text-white ${
                          n.read_at ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                        }`}>
                          {n.read_at ? 'Read' : 'Unread'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="px-4 py-3.5 border-r border-[#2d3748]/30 text-slate-400 text-[13px]">
                        {new Date(n.created_at).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleMarkAsRead(n.id, n.read_at)}
                            className={`w-[32px] h-[32px] inline-flex items-center justify-center rounded-lg border transition-all ${
                              n.read_at
                                ? 'border-slate-600 text-emerald-400 bg-emerald-500/10 hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10 active:scale-90'
                                : 'border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/15 active:scale-90'
                            }`}
                            style={{ borderRadius: '8px' }}
                            title={n.read_at ? "Mark as Unread" : "Mark as Read"}
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
 
                          <button
                            onClick={() => {
                              setViewNotification(n);
                              if (!n.read_at) {
                                handleMarkAsRead(n.id, n.read_at);
                              }
                            }}
                            className="w-[32px] h-[32px] inline-flex items-center justify-center rounded-lg border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/15 active:scale-90 transition-all"
                            style={{ borderRadius: '8px' }}
                            title="View Details"
                          >
                            <Eye size={16} strokeWidth={2} />
                          </button>
 
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="w-[32px] h-[32px] inline-flex items-center justify-center rounded-lg border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/15 active:scale-90 transition-all"
                            style={{ borderRadius: '8px' }}
                            title="Delete Record"
                          >
                            <Trash2 size={16} strokeWidth={2} />
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
        
        {/* Row 4: Footer */}
        <div className="flex justify-between items-center mt-6 px-1 flex-wrap gap-4">
          <p className="text-[13px] text-slate-400 font-light opacity-80">
            Showing {notifications.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalEntries)} of {totalEntries} entries
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(1)} 
              disabled={page === 1}
              className={`p-1.5 border border-[#2d3748] rounded bg-[#0c101a] text-slate-400 transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#141b2d] hover:text-white active:scale-95'}`}
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))} 
              disabled={page === 1}
              className={`p-1.5 border border-[#2d3748] rounded bg-[#0c101a] text-slate-400 transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#141b2d] hover:text-white active:scale-95'}`}
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-[13px] text-slate-300 px-2 font-medium">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-slate-400">{totalPages}</span>
            </span>

            <button 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
              disabled={page === totalPages}
              className={`p-1.5 border border-[#2d3748] rounded bg-[#0c101a] text-slate-400 transition-all ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#141b2d] hover:text-white active:scale-95'}`}
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => setPage(totalPages)} 
              disabled={page === totalPages}
              className={`p-1.5 border border-[#2d3748] rounded bg-[#0c101a] text-slate-400 transition-all ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#141b2d] hover:text-white active:scale-95'}`}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Premium Notification Details View Modal */}
      {viewNotification && (
        <div
          onClick={() => setViewNotification(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '640px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0f1623] border-b border-[#1e293b]">
              <h2 className="text-[16px] font-semibold text-white">System Notification Details</h2>
              <button
                onClick={() => setViewNotification(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]" style={{ scrollbarWidth: 'thin' }}>
              
              {/* Top metadata grid */}
              <div className="grid grid-cols-2 gap-4 text-[13px] bg-[#0c101a] p-4 border border-[#1e293b] rounded-lg">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold mb-1">Notification ID</span>
                  <span className="font-mono text-slate-300 font-medium break-all">{viewNotification.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold mb-1">Category Type</span>
                  <span className="font-mono text-slate-300 font-medium capitalize">{viewNotification.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold mb-1">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                    viewNotification.read_at
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {viewNotification.read_at ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold mb-1">Date Created</span>
                  <span className="text-slate-300 font-medium">{new Date(viewNotification.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 text-[12px] block mb-1">Notification Title</span>
                  <h3 className="text-white text-[16px] font-medium">{viewNotification.data.title || "Notification"}</h3>
                </div>
                <div>
                  <span className="text-slate-400 text-[12px] block mb-1">Notification Message</span>
                  <p className="text-slate-300 text-[14px] bg-[#0c101a] p-4 border border-[#1e293b]/50 rounded-lg leading-relaxed">{viewNotification.data.message || "No message body."}</p>
                </div>
              </div>

              {/* JSON Metadata Payload */}
              {viewNotification.data.metadata && Object.keys(viewNotification.data.metadata).length > 0 && (
                <div>
                  <span className="text-slate-400 text-[12px] block mb-1">Parameters & Metadata Payload</span>
                  <div className="bg-[#0c101a] border border-[#1e293b]/70 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-blue-400 font-mono text-[12px] leading-relaxed">
                      {JSON.stringify(viewNotification.data.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0f1623] border-t border-[#1e293b]">
              <div>
                <button
                  onClick={() => handleMarkAsRead(viewNotification.id, viewNotification.read_at)}
                  className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 text-[13px] font-medium border rounded-md active:scale-95 ${
                    viewNotification.read_at
                      ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10'
                      : 'border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10'
                  }`}
                >
                  <Check size={14} strokeWidth={2.5} /> {viewNotification.read_at ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>
              <button
                onClick={() => setViewNotification(null)}
                className="px-4 py-2 bg-[#2d3748] hover:bg-[#1e293b] text-white text-[13px] font-medium rounded-md active:scale-95 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
