import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Table, Form, InputGroup, Pagination, Modal, Spinner, Alert, ProgressBar
} from 'react-bootstrap';
import { 
  FaUser, FaPassport, FaFileDownload, FaFileUpload,FaDownload,
  FaEye, FaTrash, FaSearch, FaFileExport, FaFileImport, FaIdCard, FaCalendar, FaFile
} from 'react-icons/fa';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PassportVisa.css';

// Set the PDF.js worker source - add this after your imports
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PassportVisa = () => {
  // States for the component
  const [pilgrims, setPilgrims] = useState([]);
  const [filteredPilgrims, setFilteredPilgrims] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentType, setDocumentType] = useState('All Document Types');
  const [status, setStatus] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPilgrims, setTotalPilgrims] = useState(0);
  const [passportDocuments, setPassportDocuments] = useState(0);
  const [visaDocuments, setVisaDocuments] = useState(0);
  const [missingDocuments, setMissingDocuments] = useState(0);
  const [passportPercentage, setPassportPercentage] = useState(0);
  const [visaPercentage, setVisaPercentage] = useState(0);
  const [missingPercentage, setMissingPercentage] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedPilgrim, setSelectedPilgrim] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  // Add this state for zip download
  const [downloadingZip, setDownloadingZip] = useState(false);
  // Add these states near your other state declarations
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setAlert({ show: false, variant: '', message: '' }); // Reset alert on new fetch
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passport-visa`);
      
      if (response.data.success) {
        const { documents, stats } = response.data;
        
        setPilgrims(documents);
        setFilteredPilgrims(documents);
        setTotalPilgrims(stats.totalPilgrims);
        setPassportDocuments(stats.passportDocuments);
        setVisaDocuments(stats.visaDocuments);
        setMissingDocuments(stats.missingDocuments);
        
        // Calculate percentages
        const pctPassport = stats.totalPilgrims > 0 
          ? Math.round((stats.passportDocuments / stats.totalPilgrims) * 100) 
          : 0;
          
        const pctVisa = stats.totalPilgrims > 0 
          ? Math.round((stats.visaDocuments / stats.totalPilgrims) * 100) 
          : 0;
          
        const expectedDocs = stats.totalPilgrims * 2; // Each pilgrim needs passport and visa
        const pctMissing = expectedDocs > 0 
          ? Math.round((stats.missingDocuments / expectedDocs) * 100) 
          : 0;
        
        setPassportPercentage(pctPassport);
        setVisaPercentage(pctVisa);
        setMissingPercentage(pctMissing);
        
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.message !== "Network Error") {
        // Only show alert if it's not a network error on initial load
        setAlert({
          show: true,
          variant: 'danger',
          message: error.response?.data?.message || 'Failed to load data. Please try again later.'
        });
      }
      
      // Set empty states
      setPilgrims([]);
      setFilteredPilgrims([]);
      setTotalPilgrims(0);
      setPassportDocuments(0);
      setVisaDocuments(0);
      setMissingDocuments(0);
      setPassportPercentage(0);
      setVisaPercentage(0);
      setMissingPercentage(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter pilgrims based on search and filters
  useEffect(() => {
    let filtered = [...pilgrims];
    
    if (searchQuery) {
      filtered = filtered.filter(pilgrim => 
        pilgrim.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pilgrim.passportNumber?.includes(searchQuery)
      );
    }
    
    if (documentType !== 'All Document Types') {
      filtered = filtered.filter(pilgrim => 
        pilgrim.documentType === (documentType === 'Passport' ? 'Passport' : 'Visa')
      );
    }
    
    if (status !== 'All Statuses') {
      filtered = filtered.filter(pilgrim => pilgrim.status === status);
    }
    
    setFilteredPilgrims(filtered);
  }, [searchQuery, documentType, status, pilgrims]);

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/passport-visa/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setAlert({
          show: true,
          variant: 'success',
          message: `Successfully imported ${response.data.count} records!`
        });
        
        // Refresh data
        fetchData();
        
        // Close modal and reset file
        setShowImportModal(false);
        setImportFile(null);
      } else {
        throw new Error(response.data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setAlert({
        show: true,
        variant: 'danger',
        message: error.response?.data?.message || 'Failed to import data. Please check the file format.'
      });
    } finally {
      setImportLoading(false);
    }
  };
  
  const handleDelete = async (id, passportNumber, documentType) => {
    if (window.confirm('Are you sure you want to delete this document? The physical file will also be removed from the server.')) {
      try {
        setAlert({ show: false }); // Reset any alerts
        
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/passport-visa/${id}`, {
          data: {
            passportNumber: passportNumber,
            documentType: documentType
          }
        });
        
        if (response.data.success) {
          setAlert({
            show: true,
            variant: 'success',
            message: `Document deleted successfully! ${response.data.fileDeleted ? 'Physical file was also removed.' : ''}`
          });
          
          // Refresh data
          fetchData();
          
          // Close view modal if open
          if (showViewModal && viewingDocument?.pilgrim?._id === id) {
            setShowViewModal(false);
          }
        } else {
          throw new Error(response.data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setAlert({
          show: true,
          variant: 'danger',
          message: error.response?.data?.message || 'Failed to delete document'
        });
      }
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true);
    
    try {
      console.log('Sending delete all request...');
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/passport-visa/all`);
      console.log('Delete all response:', response.data);
      
      if (response.data.success) {
        setAlert({
          show: true,
          variant: 'success',
          message: `Successfully deleted ${response.data.deletedCount || 'all'} records and ${response.data.filesDeleted || 0} physical files!`
        });
        
        // Refresh data
        fetchData();
        
        // Close modal and reset confirmation text
        setShowDeleteAllModal(false);
        setDeleteConfirmText('');
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete all error:', error);
      setAlert({
        show: true,
        variant: 'danger',
        message: error.response?.data?.message || 'Failed to delete all documents.'
      });
    } finally {
      setDeleteAllLoading(false);
    }
  };
  
  const handleExport = async () => {
    setExportLoading(true);
    
    try {
      // Use axios to get the file as a blob
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passport-visa/export`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Get current date for the filename
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `passport_visa_data_${today}.xlsx`);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Show success message
      setAlert({
        show: true,
        variant: 'success',
        message: 'Data exported successfully!'
      });
    } catch (error) {
      console.error('Export error:', error);
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Failed to export data. Please try again later.'
      });
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleUpload = (pilgrim) => {
    setSelectedPilgrim(pilgrim);
    setShowUploadModal(true);
  };

  // Add this function to check file type before upload
  const handleUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileType = file.type;
    const validTypes = ['application/pdf', 'image/jpeg'];
    
    if (!validTypes.includes(fileType)) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Invalid file type. Only PDF and JPEG files are allowed.'
      });
      e.target.value = ''; // Clear the file input
      return;
    }
    
    setUploadFile(file);
  };

  const handleDocumentUpload = async () => {
    if (!uploadFile || !selectedPilgrim) return;
    
    // Double-check file type
    const fileType = uploadFile.type;
    const validTypes = ['application/pdf', 'image/jpeg'];
    
    if (!validTypes.includes(fileType)) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Invalid file type. Only PDF and JPEG files are allowed.'
      });
      return;
    }
    
    setUploadLoading(true);
    
    // Create FormData with all necessary fields
    const formData = new FormData();
    
    // Make sure to append the file first
    formData.append('file', uploadFile);
    
    // Then append the other fields
    formData.append('pilgrimId', selectedPilgrim._id);
    formData.append('documentType', selectedPilgrim.documentType);
    formData.append('passportNumber', selectedPilgrim.passportNumber || 'unknown');
    
    // Log what we're sending - only for debugging
    console.log('Uploading document:', {
      pilgrimId: selectedPilgrim._id,
      documentType: selectedPilgrim.documentType,
      passportNumber: selectedPilgrim.passportNumber
    });
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/passport-visa/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data.success) {
        setAlert({
          show: true,
          variant: 'success',
          message: 'Document uploaded successfully!'
        });
        
        // Refresh data
        fetchData();
        
        // Close modal and reset
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedPilgrim(null);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setAlert({
        show: true,
        variant: 'danger',
        message: error.response?.data?.message || 'Failed to upload document.'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Calculate pagination items
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPilgrims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPilgrims.length / itemsPerPage);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add this function to handle ZIP download
  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    
    try {
      // Request the ZIP file from the server
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passport-visa/download-zip`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Get current date for the filename
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `pilgrim_documents_${today}.zip`);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Show success message
      setAlert({
        show: true,
        variant: 'success',
        message: 'Documents downloaded successfully!'
      });
    } catch (error) {
      console.error('Download error:', error);
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Failed to download documents. Please try again later.'
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  // Update your handleViewDocument function
  const handleViewDocument = async (pilgrim) => {
    try {
      // Set loading states
      setDocumentLoading(true);
      setDocumentError(null);
      
      // Create the document URL
      const url = `${process.env.REACT_APP_API_URL}/api/passport-visa/direct-pdf/${pilgrim.passportNumber}`;
      setDocumentUrl(url);
      
      // Set up modal with document metadata
      setViewingDocument({
        loading: false,
        pilgrim: pilgrim,
        url: url,
        details: {
          fileDetails: {
            filename: `${pilgrim.passportNumber}.pdf`,
            mimetype: 'application/pdf'
          }
        },
        error: null
      });
      
      // Show modal
      setShowViewModal(true);
      
    } catch (error) {
      console.error('Error viewing document:', error);
      setDocumentError('Error loading document');
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Error viewing document: ' + error.message
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Add these helper functions for PDF viewing
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
      <Container fluid className="pb-5">
        {alert.show && (
          <Alert 
            variant={alert.variant} 
            className="mt-3"
            dismissible 
            onClose={() => setAlert({...alert, show: false})}
          >
            {alert.message}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">Passport & Visa Documentation</h4>
            <p className="text-muted">Manage passport and visa documents for pilgrims</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center gap-1"
              onClick={handleDownloadZip}
              disabled={downloadingZip || loading || pilgrims.length === 0}
            >
              {downloadingZip ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-1">Downloading...</span>
                </>
              ) : (
                <>
                  <FaFileDownload /> Download All as Zip
                </>
              )}
            </Button>
            <Button 
              variant="outline-success" 
              className="d-flex align-items-center gap-1"
              onClick={handleExport}
              disabled={exportLoading || loading || pilgrims.length === 0}
            >
              {exportLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-1">Exporting...</span>
                </>
              ) : (
                <>
                  <FaFileExport /> Export Status
                </>
              )}
            </Button>
            <Button 
              variant="primary" 
              className="d-flex align-items-center gap-1"
              onClick={() => setShowImportModal(true)}
            >
              <FaFileImport /> Import Data
            </Button>
            <Button 
              variant="outline-danger" 
              className="d-flex align-items-center gap-1"
              onClick={() => setShowDeleteAllModal(true)}
            >
              <FaTrash /> Delete All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon bg-light text-primary rounded-circle p-3 me-3">
                  <FaUser size={24} />
                </div>
                <div className="w-100">
                  <h3 className="mb-0 text-success">{totalPilgrims}</h3>
                  <div className="text-muted">Total Pilgrims</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-light text-primary rounded-circle p-3 me-3">
                    <FaPassport size={24} />
                  </div>
                  <div className="w-100">
                    <h3 className="mb-0">{passportDocuments}</h3>
                    <div className="text-muted">Passport Documents</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>{passportPercentage}% uploaded</small>
                    <small>{totalPilgrims > passportDocuments ? totalPilgrims - passportDocuments : 0} missing</small>
                  </div>
                  <ProgressBar 
                    variant={passportPercentage >= 75 ? "success" : passportPercentage >= 40 ? "warning" : "danger"} 
                    now={passportPercentage} 
                    style={{ height: "6px" }}
                    className="mt-1"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-light text-success rounded-circle p-3 me-3">
                    <FaPassport size={24} />
                  </div>
                  <div className="w-100">
                    <h3 className="mb-0 text-success">{visaDocuments}</h3>
                    <div className="text-muted">Visa <br></br>Documents</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-success">{visaPercentage}% uploaded</small>
                    <small className="text-danger">{totalPilgrims > visaDocuments ? totalPilgrims - visaDocuments : 0} missing</small>
                  </div>
                  <ProgressBar 
                    variant={visaPercentage >= 75 ? "success" : visaPercentage >= 40 ? "warning" : "danger"} 
                    now={visaPercentage} 
                    style={{ height: "6px" }}
                    className="mt-1"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-light text-danger rounded-circle p-3 me-3">
                    <FaPassport size={24} />
                  </div>
                  <div className="w-100">
                    <h3 className="mb-0 text-danger">{missingDocuments}</h3>
                    <div className="text-muted">Missing Documents</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-danger">{missingPercentage}% missing</small>
                    <small className="text-success">{passportDocuments + visaDocuments} uploaded</small>
                  </div>
                  <ProgressBar 
                    variant="danger" 
                    now={missingPercentage} 
                    style={{ height: "6px" }}
                    className="mt-1"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Row className="mb-4 g-2 align-items-center">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="Search by name, passport, etc" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option>All Document Types</option>
              <option>Passport</option>
              <option>Visa</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Complete</option>
              <option>Missing</option>
              <option>Pending</option>
              <option>Uploaded</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading data...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">PILGRIM</th>
                      <th>GUIDE & ORGANIZER</th>
                      <th>DOCUMENT</th>
                      <th>TYPE</th>
                      <th>UPLOAD INFO</th>
                      <th>STATUS</th>
                      <th className="text-end pe-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No documents found. Import data or try different filters.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((pilgrim) => (
                        <tr key={pilgrim._id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle text-center me-3" style={{width: "35px", height: "35px", lineHeight: "35px"}}>
                                <span className="text-primary">{pilgrim.name?.charAt(0) || 'U'}</span>
                              </div>
                              <div>
                                <div className="fw-medium">{pilgrim.name}</div>
                                <div className="text-muted small">{pilgrim.passportNumber}</div>
                                <div className="text-muted small">{pilgrim.country}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle text-center me-2 p-1" style={{width: "25px", height: "25px", lineHeight: "18px"}}>
                                <span className="text-primary small">{pilgrim.guide?.charAt(0) || 'G'}</span>
                              </div>
                              <div className="small">{pilgrim.guide || 'Not Assigned'}</div>
                            </div>
                            <div className="d-flex align-items-center mt-1">
                              <div className="bg-light rounded-circle text-center me-2 p-1" style={{width: "25px", height: "25px", lineHeight: "18px"}}>
                                <span className="text-primary small">N</span>
                              </div>
                              <div className="small">{pilgrim.organizer || 'Noor Al-Fajr'}</div>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-success bg-opacity-10 p-1 me-2">
                                <span className="text-success">✓</span>
                              </div>
                              <small>{pilgrim.documentName || 'Younis List'}</small>
                            </div>
                            <small className="text-primary d-block mt-1">View Document</small>
                          </td>
                          <td className="align-middle">
                            <Badge bg={pilgrim.documentType === 'Visa' ? 'success' : 'primary'} 
                              className={`bg-opacity-10 text-${pilgrim.documentType === 'Visa' ? 'success' : 'primary'} border border-${pilgrim.documentType === 'Visa' ? 'success' : 'primary'}`}>
                              {pilgrim.documentType}
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <small className="d-block">{formatDate(pilgrim.uploadDate)}</small>
                            <small className="text-muted">{pilgrim.uploadedBy}</small>
                          </td>
                          <td className="align-middle">
                            <span className={`badge rounded-pill bg-${
                              pilgrim.status === 'Complete' || pilgrim.status === 'Uploaded' ? 'success' : 
                              pilgrim.status === 'Missing' ? 'danger' : 'warning'
                            }`}>
                              {pilgrim.status}
                            </span>
                          </td>
                          <td className="text-end align-middle pe-4">
                            {pilgrim.status === 'Missing' ? (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleUpload(pilgrim)}
                                className="d-flex align-items-center gap-1"
                              >
                                <FaFileUpload /> Upload
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="me-2"
                                  onClick={() => handleViewDocument(pilgrim)}  // Use handleViewDocument instead
                                >
                                  <FaEye /> View
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDelete(
                                    pilgrim._id, 
                                    pilgrim.passportNumber, 
                                    pilgrim.documentType
                                  )}
                                >
                                  <FaTrash /> Delete
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {filteredPilgrims.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredPilgrims.length)} of {filteredPilgrims.length} documents
          </div>
          {totalPages > 1 && (
            <Pagination className="mb-0">
              <Pagination.Item 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &laquo;
              </Pagination.Item>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Pagination.Item 
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <Pagination.Ellipsis />
                  <Pagination.Item
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Pagination.Item>
                </>
              )}
              
              <Pagination.Item 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &raquo;
              </Pagination.Item>
            </Pagination>
          )}
        </div>

        {/* Import Modal */}
        <Modal show={showImportModal} onHide={() => !importLoading && setShowImportModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Import Passport & Visa Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Upload an Excel file containing pilgrim passport and visa information.</p>
            <Form.Group className="mb-3">
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={importLoading}
              />
            </Form.Group>
            <div className="mt-3">
              <h6>File Requirements:</h6>
              <ul className="small text-muted">
                <li>Excel file (.xlsx or .xls)</li>
                <li>Headers must match exactly as shown in the sample below</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
            {importFile && (
              <div className="alert alert-info mt-3">
                Selected file: {importFile.name}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowImportModal(false)} 
              disabled={importLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleImport}
              disabled={!importFile || importLoading}
            >
              {importLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  Importing...
                </>
              ) : (
                <>
                  <FaFileImport className="me-1" /> Import Data
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete All Confirmation Modal */}
        <Modal 
          show={showDeleteAllModal} 
          onHide={() => !deleteAllLoading && setShowDeleteAllModal(false)}
          backdrop="static"
          keyboard={!deleteAllLoading}
        >
          <Modal.Header closeButton={!deleteAllLoading}>
            <Modal.Title className="text-danger">
              <FaTrash className="me-2" />
              Delete All Documents
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">
              <Alert.Heading>Warning: Destructive Action</Alert.Heading>
              <p>You are about to delete <strong>ALL</strong> passport and visa documents from the database.</p>
              <p>This action <strong>cannot be undone</strong>. Are you absolutely sure you want to proceed?</p>
            </Alert>
            <p className="mb-0 mt-3 fw-bold">
              Type "DELETE ALL" below to confirm:
            </p>
            <Form.Control 
              type="text" 
              placeholder="Type DELETE ALL to confirm" 
              className="mt-2"
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleteAllLoading}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowDeleteAllModal(false);
                setDeleteConfirmText('');
              }}
              disabled={deleteAllLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAll}
              disabled={deleteConfirmText !== "DELETE ALL" || deleteAllLoading}
            >
              {deleteAllLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-1" /> Delete All Documents
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Document Upload Modal */}
        <Modal show={showUploadModal} onHide={() => !uploadLoading && setShowUploadModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPilgrim && (
              <>
                <div className="mb-3">
                  <p className="mb-1"><strong>Pilgrim:</strong> {selectedPilgrim.name}</p>
                  <p className="mb-1"><strong>Passport Number:</strong> {selectedPilgrim.passportNumber}</p>
                  <p className="mb-1"><strong>Document Type:</strong> {selectedPilgrim.documentType}</p>
                </div>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>Select Document File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={handleUploadFileChange}
                    disabled={uploadLoading}
                  />
                  <Form.Text className="text-muted">
                    Only PDF and JPEG files are accepted.
                  </Form.Text>
                </Form.Group>
                {uploadFile && (
                  <div className="alert alert-info mt-3">
                    <div className="d-flex align-items-center">
                      <div>Selected file: {uploadFile.name}</div>
                      {uploadFile.type === 'application/pdf' ? 
                        <span className="ms-2 badge bg-primary">PDF</span> : 
                        <span className="ms-2 badge bg-success">JPEG</span>
                      }
                    </div>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
              }}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleDocumentUpload}
              disabled={!uploadFile || uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaFileUpload className="me-1" /> Upload Document
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Document Viewer Modal */}
        <Modal 
          show={showViewModal} 
          onHide={() => setShowViewModal(false)}
          size="xl"
          dialogClassName="document-view-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {viewingDocument?.pilgrim && (
                <>
                  {viewingDocument.pilgrim.documentType} Document - {viewingDocument.pilgrim.name}
                </>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {viewingDocument?.pilgrim && (
              <div className="document-view-container">
                <Row className="g-0 h-100">
                  {/* Document Viewer - Left Side */}
                  <Col md={7} className="document-preview-container">
                    {documentLoading && (
                      <div className="text-center p-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Loading document...</p>
                      </div>
                    )}
                    
                    {documentError && (
                      <div className="alert alert-danger m-3">
                        <p>Error loading document: {documentError}</p>
                        <p>Please try downloading the document instead.</p>
                      </div>
                    )}
                    
                    <div className="pdf-container">
                      <Document
                        file={documentUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                          console.error('Error loading PDF:', error);
                          setDocumentError('Could not load document');
                        }}
                        loading={
                          <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p>Loading PDF...</p>
                          </div>
                        }
                        className="pdf-document"
                      >
                        <Page 
                          pageNumber={pageNumber} 
                          renderTextLayer={false} 
                          renderAnnotationLayer={false}
                          width={550}
                        />
                      </Document>
                      
                      {numPages && (
                        <div className="pdf-controls">
                          <Button 
                            variant="outline-secondary" 
                            onClick={previousPage} 
                            disabled={pageNumber <= 1}
                            size="sm"
                          >
                            Previous
                          </Button>
                          <span className="mx-2">
                            Page {pageNumber} of {numPages}
                          </span>
                          <Button 
                            variant="outline-secondary" 
                            onClick={nextPage} 
                            disabled={pageNumber >= numPages}
                            size="sm"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  {/* Document Details - Right Side */}
                  <Col md={5} className="document-details-container border-start">
                    <div className="document-details p-4">
                      <h5 className="document-section-title">
                        <FaIdCard className="me-2" />
                        {viewingDocument.pilgrim.documentType} Details
                      </h5>
                      <div className="mb-3">
                        <p className="mb-1 fw-bold text-muted small">Pilgrim Name</p>
                        <p className="fs-5">{viewingDocument.pilgrim.name}</p>
                      </div>
                      <div className="mb-3">
                        <p className="mb-1 fw-bold text-muted small">Passport Number</p>
                        <p>{viewingDocument.pilgrim.passportNumber}</p>
                      </div>
                      <div className="mb-3">
                        <p className="mb-1 fw-bold text-muted small">Upload Information</p>
                        <div className="d-flex align-items-center mb-1">
                          <FaUser className="me-1 text-muted" />
                          <span>{viewingDocument.pilgrim.uploadedBy || 'System Import'}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaCalendar className="me-1 text-muted" />
                          <span>{formatDate(viewingDocument.pilgrim.uploadDate) || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="mb-1 fw-bold text-muted small">File Information</p>
                        <div className="d-flex align-items-center">
                          <FaFile className="me-1 text-muted" />
                          <span>{viewingDocument.details?.fileDetails?.filename || 
                          `${viewingDocument.pilgrim.passportNumber}.pdf`}</span>
                        </div>
                      </div>
                      
                      <hr className="my-4" />
                      
                      <div className="document-actions">
                        <Button 
                          variant="primary" 
                          className="w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
                          onClick={() => {
                            const url = `${process.env.REACT_APP_API_URL}/api/passport-visa/direct-pdf/${viewingDocument.pilgrim.passportNumber}`;
                            window.open(url, '_blank', 'noopener');
                          }}
                        >
                          <FaDownload /> Download Document
                        </Button>
                        
                        <Button 
                          variant="outline-danger" 
                          className="w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => {
                            setShowViewModal(false);
                            handleDelete(
                              viewingDocument.pilgrim._id, 
                              viewingDocument.pilgrim.passportNumber, 
                              viewingDocument.pilgrim.documentType
                            );
                          }}
                        >
                          <FaTrash /> Delete Document
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
  );
};

export default PassportVisa;