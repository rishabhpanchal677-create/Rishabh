import React, { useState, useEffect } from 'react';
import { 
  connectGoogleDrive, 
  getDriveAccessToken, 
  setDriveAccessToken, 
  uploadToDrive, 
  listDriveFiles, 
  deleteDriveFile, 
  DriveFileItem 
} from '../lib/driveService';
import { useApp } from '../context/AppContext';
import { 
  Folder, UploadCloud, RefreshCw, FileText, Trash2, ExternalLink, 
  CheckCircle2, AlertCircle, X, Shield, Lock, FileSpreadsheet, HardDrive
} from 'lucide-react';

interface GoogleDriveManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleDriveManager({ isOpen, onClose }: GoogleDriveManagerProps) {
  const { users, orders } = useApp();
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Confirmation Modal state for file deletion
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkTokenAndLoadFiles();
    }
  }, [isOpen]);

  const checkTokenAndLoadFiles = async () => {
    const activeToken = await getDriveAccessToken();
    if (activeToken) {
      setToken(activeToken);
      fetchFiles(activeToken);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const accessToken = await connectGoogleDrive();
      setToken(accessToken);
      setStatusMessage({ type: 'success', text: 'Google Drive connected successfully!' });
      await fetchFiles(accessToken);
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Failed to connect with Google Drive. Please try again.' 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchFiles = async (accessToken: string) => {
    setIsListing(true);
    try {
      const driveFiles = await listDriveFiles(accessToken);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      // If token expired, clear token
      if (err.message && err.message.includes('401')) {
        setDriveAccessToken(null);
        setToken(null);
      }
    } finally {
      setIsListing(false);
    }
  };

  const handleDisconnect = () => {
    setDriveAccessToken(null);
    setToken(null);
    setFiles([]);
    setStatusMessage({ type: 'success', text: 'Disconnected from Google Drive.' });
  };

  const generateKitchenReport = () => {
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const activeCustomers = users.filter(u => !u.isAdmin && (u.subscriptionStatus === 'active' || u.mealsRemaining > 0));
    const morningList = activeCustomers.filter(c => c.mealTiming === 'morning' || c.mealTiming === 'both');
    const eveningList = activeCustomers.filter(c => c.mealTiming === 'evening' || c.mealTiming === 'both');

    return `====================================================
PUREATY PREMIUM TIFFIN SERVICE - DAILY KITCHEN REPORT
Generated: ${today}
====================================================

SUMMARY METRICS:
----------------------------------------------------
Total Active Subscribers: ${activeCustomers.length}
Morning Slot Deliveries : ${morningList.length}
Evening Slot Deliveries : ${eveningList.length}

MORNING SLOT CUSTOMERS (${morningList.length}):
${morningList.map((c, i) => `${i + 1}. ${c.name} (${c.phone}) - ${c.activePlanName || 'Active'} [Remaining: ${c.mealsRemaining}]\n   Address: ${c.address}`).join('\n')}

EVENING SLOT CUSTOMERS (${eveningList.length}):
${eveningList.map((c, i) => `${i + 1}. ${c.name} (${c.phone}) - ${c.activePlanName || 'Active'} [Remaining: ${c.mealsRemaining}]\n   Address: ${c.address}`).join('\n')}

====================================================
Report automatically generated & synced by PUREATY Operations.
`;
  };

  const generateCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Plan', 'Meal Timing', 'Meals Remaining', 'Total Paid', 'Address', 'Status'];
    const rows = users.filter(u => !u.isAdmin).map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.phone}"`,
      `"${u.email}"`,
      `"${u.activePlanName || 'None'}"`,
      `"${u.mealTiming || 'morning'}"`,
      u.mealsRemaining || 0,
      u.totalPaid || 0,
      `"${u.address.replace(/"/g, '""')}"`,
      u.subscriptionStatus || 'inactive'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const generateOrdersBackup = () => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      service: 'PUREATY Premium Food Tiffins',
      totalOrders: orders.length,
      orders: orders
    }, null, 2);
  };

  const handleBackupKitchenReport = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const content = generateKitchenReport();
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `PUREATY_Kitchen_Preparation_Report_${dateStr}.txt`;
      await uploadToDrive(token, fileName, content, 'text/plain');
      setStatusMessage({ type: 'success', text: `Saved "${fileName}" to Google Drive!` });
      await fetchFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackupCustomerCSV = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const content = generateCustomersCSV();
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `PUREATY_Subscribers_List_${dateStr}.csv`;
      await uploadToDrive(token, fileName, content, 'text/csv');
      setStatusMessage({ type: 'success', text: `Saved "${fileName}" to Google Drive!` });
      await fetchFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload CSV file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackupOrdersJSON = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const content = generateOrdersBackup();
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `PUREATY_Order_Invoices_Backup_${dateStr}.json`;
      await uploadToDrive(token, fileName, content, 'application/json');
      setStatusMessage({ type: 'success', text: `Saved "${fileName}" to Google Drive!` });
      await fetchFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to backup orders.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Explicit confirmation before destructive Drive operation
  const confirmDelete = async () => {
    if (!token || !deleteConfirmFile) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(token, deleteConfirmFile.id);
      setStatusMessage({ 
        type: 'success', 
        text: `Permanently deleted "${deleteConfirmFile.name}" from Google Drive.` 
      });
      setDeleteConfirmFile(null);
      await fetchFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete file.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Google Drive Backup Center
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  Workspace API
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Sync kitchen reports, customer logs & invoices directly to your Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-fade-in ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Connection Status Card */}
          {!token ? (
            <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-emerald-400">
                <Folder className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Connect Google Drive Account</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Authorize Google Drive access to export and manage PUREATY kitchen operational reports, customer lists, and financial backups safely.
                </p>
              </div>

              {/* Standard Google Sign-In Material Button */}
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold px-6 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isConnecting ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Connected Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">Connected to Google Drive</span>
                    <span className="text-[10px] text-neutral-400">Authorized for cloud report exports</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-neutral-400 hover:text-red-400 underline transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* 1-Click Backup Options */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                  <span>1-Click Report Backups</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Auto-Format</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Daily Kitchen Prep Report */}
                  <button
                    type="button"
                    onClick={handleBackupKitchenReport}
                    disabled={isUploading}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-white">Daily Kitchen Sheet</h5>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                        Active meal counts & morning/evening subscriber address logs (.txt)
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <UploadCloud className="w-3 h-3" />
                      <span>Save to Drive</span>
                    </div>
                  </button>

                  {/* Customer Subscribers CSV */}
                  <button
                    type="button"
                    onClick={handleBackupCustomerCSV}
                    disabled={isUploading}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-white">Subscribers Log</h5>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                        Complete directory of active subscriptions & payments (.csv)
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <UploadCloud className="w-3 h-3" />
                      <span>Save to Drive</span>
                    </div>
                  </button>

                  {/* Orders JSON */}
                  <button
                    type="button"
                    onClick={handleBackupOrdersJSON}
                    disabled={isUploading}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-white">Invoices & Orders</h5>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                        Full historical transaction audit log (.json)
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <UploadCloud className="w-3 h-3" />
                      <span>Save to Drive</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* Synced Drive Files List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                    Your Drive Cloud Files ({files.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => token && fetchFiles(token)}
                    disabled={isListing}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isListing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {isListing ? (
                  <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-2xl border border-neutral-800">
                    Loading your Google Drive files...
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-2xl border border-neutral-800">
                    No PUREATY reports found in Google Drive yet. Click any 1-Click Backup button above!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                            {file.name.endsWith('.csv') ? (
                              <FileSpreadsheet className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-bold text-white truncate">{file.name}</h5>
                            <span className="text-[10px] text-neutral-500 block">
                              Created: {file.createdTime ? new Date(file.createdTime).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmFile(file)}
                            className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-all"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Google OAuth2 Connection</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>

      {/* Explicit User Confirmation Modal for Destructive Delete Action */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Delete Google Drive File?</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmFile.name}"</strong> from your Google Drive account? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmFile(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
