import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/api';
import { format } from 'date-fns';
import DocumentPreview from './DocumentPreview';

interface VerificationDetailModalProps {
  verification: any;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({
  verification,
  onClose,
  onStatusUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [fullVerification, setFullVerification] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details');

  useEffect(() => {
    fetchFullDetails();
  }, [verification.id]);

  const fetchFullDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getVerificationDetail(verification.id);
      setFullVerification(response.data);
    } catch (error) {
      console.error('Error fetching verification details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this verification?')) return;

    try {
      setLoading(true);
      await adminService.reviewVerification(verification.id, {
        status: 'APPROVED',
        notes: reviewNotes,
      });
      alert('Verification approved successfully');
      onStatusUpdate();
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this verification?')) return;

    try {
      setLoading(true);
      await adminService.reviewVerification(verification.id, {
        status: 'REJECTED',
        notes: reviewNotes,
        rejectionReason,
      });
      alert('Verification rejected');
      onStatusUpdate();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!reviewNotes) {
      alert('Please specify what additional information is needed');
      return;
    }

    try {
      setLoading(true);
      await adminService.reviewVerification(verification.id, {
        status: 'RESUBMISSION_REQUIRED',
        notes: reviewNotes,
      });
      alert('Request for more information sent');
      onStatusUpdate();
    } catch (error) {
      console.error('Error requesting more info:', error);
      alert('Failed to request more information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const blob = await adminService.getVerificationDocument(verification.id, documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'PENDING':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'IN_REVIEW':
        return <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-500" />;
      case 'EXPIRED':
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <CurrencyDollarIcon className="h-6 w-6 text-green-600" />;
      case 'NET_WORTH':
        return <DocumentTextIcon className="h-6 w-6 text-blue-600" />;
      case 'PROFESSIONAL':
        return <UserGroupIcon className="h-6 w-6 text-purple-600" />;
      case 'ENTITY':
        return <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScanStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEAN':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Clean</span>;
      case 'INFECTED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Infected</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Scanning</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading && !fullVerification) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const v = fullVerification || verification;

  return (
    <>
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTypeIcon(v.verificationType)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verification Review</h2>
              <p className="text-sm text-gray-600">ID: {v.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents ({v.documents?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{v.user.firstName} {v.user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {v.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{v.user.role}</p>
                    </div>
                    {v.user.phoneNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {v.user.phoneNumber}
                        </p>
                      </div>
                    )}
                    {v.user.location && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {v.user.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div className="lg:col-span-2">
                <div className="bg-white border rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Verification Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{v.verificationType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center">
                        {getStatusIcon(v.status)}
                        <span className="ml-2 font-medium">{v.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(v.submittedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    {v.reviewedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Reviewed</p>
                        <p className="font-medium">
                          {format(new Date(v.reviewedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {v.verificationType === 'INCOME' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Annual Income</p>
                          <p className="font-medium text-lg">{formatAmount(v.annualIncome)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Income Source</p>
                          <p className="font-medium">{v.incomeSource || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                    {v.verificationType === 'NET_WORTH' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Net Worth</p>
                          <p className="font-medium text-lg">{formatAmount(v.netWorth)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Liquid Net Worth</p>
                          <p className="font-medium">{formatAmount(v.liquidNetWorth)}</p>
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Attestation</p>
                      <p className="font-medium">
                        {v.attestation ? (
                          <span className="text-green-600">✓ User has attested to the accuracy of information</span>
                        ) : (
                          <span className="text-red-600">✗ No attestation provided</span>
                        )}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Consent to Verify</p>
                      <p className="font-medium">
                        {v.consentToVerify ? (
                          <span className="text-green-600">✓ User consents to verification</span>
                        ) : (
                          <span className="text-red-600">✗ No consent provided</span>
                        )}
                      </p>
                    </div>
                    {v.expiresAt && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium">
                          {format(new Date(v.expiresAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Review Notes */}
                {v.reviewNotes && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Previous Review Notes</h4>
                    <p className="text-blue-800">{v.reviewNotes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {v.rejectionReason && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg shadow-md p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-red-800">{v.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {v.documents && v.documents.length > 0 ? (
                v.documents.map((doc: any) => (
                  <div key={doc.id} className="bg-white border rounded-lg shadow-md p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <DocumentIcon className="h-10 w-10 text-gray-400" />
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {doc.documentType}</span>
                          <span>Size: {(doc.fileSize / 1024).toFixed(2)} KB</span>
                          <span>Uploaded: {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getScanStatusBadge(doc.virusScanStatus)}
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg shadow-md p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Verification History</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(v.submittedAt), 'MMM dd, yyyy HH:mm')} by {v.user.email}
                      </p>
                    </div>
                  </div>
                  {v.reviewedAt && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        v.status === 'APPROVED' ? 'bg-green-500' : 
                        v.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{v.status}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(v.reviewedAt), 'MMM dd, yyyy HH:mm')} by {v.reviewedBy || 'Admin'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {v.status === 'PENDING' || v.status === 'IN_REVIEW' ? (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes (Internal)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Add internal notes about this verification..."
                />
              </div>

              {activeTab === 'details' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (If rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Provide a reason for rejection (will be sent to user)..."
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handleRequestMoreInfo}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  disabled={loading}
                >
                  Request More Info
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={loading}
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={loading}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Document Preview Modal */}
    {selectedDocument && (
      <DocumentPreview
        verificationId={verification.id}
        documentId={selectedDocument.id}
        fileName={selectedDocument.fileName}
        mimeType={selectedDocument.mimeType}
        onClose={() => setSelectedDocument(null)}
      />
    )}
    </>
  );
};

export default VerificationDetailModal;