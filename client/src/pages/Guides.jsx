import React, { useState, useEffect } from 'react';
import { Card, Form, InputGroup, Button, Row, Col, Badge, ProgressBar, Modal, Spinner } from 'react-bootstrap';
import { 
    FaSearch, FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, 
    FaIdCard, FaPassport, FaFileDownload, FaFileUpload, FaCheck, FaExclamationTriangle, 
    FaTimes, FaEye, FaTrashAlt
} from 'react-icons/fa';
import axios from 'axios';

const Guides = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedView, setSelectedView] = useState('All Guides');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [newGuide, setNewGuide] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        passportNumber: '',
        nusukEmail: '',
        mainPhone: '',
        hajjPhone: ''
    });
    
    const [passportFile, setPassportFile] = useState(null);
    const [validated, setValidated] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGuide, setEditingGuide] = useState(null);
    const [editPassportFile, setEditPassportFile] = useState(null);
    const [editValidated, setEditValidated] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    
    // Fetch guides on component mount
    useEffect(() => {
        fetchGuides();
    }, []);
    
    // Function to fetch all guides
    const fetchGuides = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/guides`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Use response.data.guides (which is an array)
            setGuides(Array.isArray(response.data.guides) ? response.data.guides : []);
        } catch (err) {
            console.error('Error fetching guides:', err);
            setError('Failed to load guides. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Modal handlers
    const handleOpenModal = () => setShowAddModal(true);
    const handleCloseModal = () => {
        setShowAddModal(false);
        setNewGuide({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            passportNumber: '',
            nusukEmail: '',
            mainPhone: '',
            hajjPhone: ''
        });
        setPassportFile(null);
        setValidated(false);
    };
    
    // Form input handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGuide({
            ...newGuide,
            [name]: value
        });
    };
    
    const handleFileChange = (e) => {
        if (!newGuide.passportNumber.trim()) {
            alert('Please enter a passport number before uploading a passport file.');
            // Reset the file input
            e.target.value = '';
            return;
        }
        
        if (e.target.files[0]) {
            setPassportFile(e.target.files[0]);
        }
    };
    
    // Submit new guide
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        // Form validation
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        
        // Check password match
        if (newGuide.password !== newGuide.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        
        try {
            setSubmitting(true);
            
            // Create form data for file upload
            const formData = new FormData();
            formData.append('name', newGuide.name);
            formData.append('email', newGuide.email);
            formData.append('password', newGuide.password);
            formData.append('passportNumber', newGuide.passportNumber);
            formData.append('nusukEmail', newGuide.nusukEmail);
            formData.append('mainPhone', newGuide.mainPhone);
            formData.append('hajjPhone', newGuide.hajjPhone);
            
            // Add file if selected
            if (passportFile) {
                console.log('Adding file:', passportFile.name, 'Size:', passportFile.size);
                formData.append('passportFile', passportFile);
            }
            
            // Log what we're sending
            console.log('Sending form data:', {
                name: newGuide.name,
                email: newGuide.email,
                hasPassword: !!newGuide.password,
                passportNumber: newGuide.passportNumber,
                nusukEmail: newGuide.nusukEmail,
                mainPhone: newGuide.mainPhone,
                hajjPhone: newGuide.hajjPhone,
                hasFile: !!passportFile
            });
            
            const token = localStorage.getItem('token');
            console.log('Using token:', token ? 'Token exists' : 'No token found');
            
            console.log('Making API request to /api/guides');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/guides`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('API response:', response.data);
            
            // Add the new guide to state
            setGuides([...guides, response.data]);
            
            // Success message
            alert('Guide added successfully!');
            
            // Close the modal and reset form
            handleCloseModal();
        } catch (err) {
            console.error('Error details:', err);
            if (err.response) {
                console.error('Server responded with:', {
                    status: err.response.status,
                    data: err.response.data
                });
            } else if (err.request) {
                console.error('No response received:', err.request);
            } else {
                console.error('Error setting up request:', err.message);
            }
            
            alert(err.response?.data?.message || 'Failed to create guide. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };
    
    // Delete guide
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this guide?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/guides/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Remove guide from state
                setGuides(guides.filter(guide => guide._id !== id));
                
                alert('Guide deleted successfully');
            } catch (err) {
                console.error('Error deleting guide:', err);
                alert(err.response?.data?.message || 'Failed to delete guide. Please try again.');
            }
        }
    };

    const handleEdit = (id) => {
        const guideToEdit = guides.find(guide => guide._id === id);
        if (!guideToEdit) return;
        
        // Set the editing guide data
        setEditingGuide({
            _id: guideToEdit._id,
            name: guideToEdit.name,
            email: guideToEdit.email,
            passportNumber: guideToEdit.passportId !== 'No Passport Photo' ? guideToEdit.passportId : '',
            passportFile: guideToEdit.passportFile || '',
            nusukEmail: guideToEdit.nusukEmail || '',
            mainPhone: guideToEdit.phone || '',
            hajjPhone: guideToEdit.mobile || ''
        });
        
        // Open the edit modal
        setShowEditModal(true);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditingGuide(null);
        setEditPassportFile(null);
        setEditValidated(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingGuide({
            ...editingGuide,
            [name]: value
        });
    };

    const handleEditFileChange = (e) => {
        if (!editingGuide.passportNumber.trim()) {
            alert('Please enter a passport number before uploading a passport file.');
            e.target.value = '';
            return;
        }
        
        if (e.target.files[0]) {
            setEditPassportFile(e.target.files[0]);
        }
    };

    const handleViewPassportInEdit = (filename) => {
        handleViewPassport(filename);
    };

    // Update your handleEditSubmit function
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setEditValidated(true);
            return;
        }
        
        try {
            setEditSubmitting(true);
            
            // Create form data for file upload
            const formData = new FormData();
            formData.append('name', editingGuide.name);
            formData.append('passportNumber', editingGuide.passportNumber || '');
            formData.append('nusukEmail', editingGuide.nusukEmail || '');
            formData.append('mainPhone', editingGuide.mainPhone || '');
            formData.append('hajjPhone', editingGuide.hajjPhone || '');
            
            // Only append the file if a new one was selected
            if (editPassportFile) {
                formData.append('passportFile', editPassportFile);
            }
            
            console.log('Sending update for guide:', editingGuide._id);
            console.log('Form data keys:', [...formData.keys()]);
            
            const token = localStorage.getItem('token');
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/guides/${editingGuide._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('Update response:', response.data);
            
            // Update the guide in state
            const updatedGuides = guides.map(guide => 
                guide._id === editingGuide._id ? response.data : guide
            );
            
            setGuides(updatedGuides);
            alert('Guide updated successfully!');
            handleEditClose();
            
        } catch (err) {
            console.error('Error updating guide:', err);
            if (err.response) {
                console.error('Server response:', err.response.data);
            }
            alert(err.response?.data?.message || 'Failed to update guide. Please try again.');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Download passport file
    const handleDownloadPassport = (filename) => {
        const token = localStorage.getItem('token');
        const url = `/api/guides/passport/${filename}`;
        
        // Create a hidden link and click it
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Enhanced version of your working handleViewPassport function
    const handleViewPassport = async (filename) => {
        try {
            const token = localStorage.getItem('token');
            
            // Show a loading message or spinner
            // You could add this if you want: setViewLoading(true);
            
            // Fetch the file directly as a blob
            const response = await fetch(`/api/guides/passport/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${await response.text()}`);
            }
            
            // Get content type from response header
            const contentType = response.headers.get('content-type');
            
            // Get the blob from response
            const blob = await response.blob();
            
            // Create a more descriptive filename if needed
            const displayFilename = filename.includes('.') ? filename : `${filename}.pdf`;
            
            // Create object URL from blob
            const objectUrl = URL.createObjectURL(
                new Blob([blob], { type: contentType || 'application/octet-stream' })
            );
            
            // Open in new window with appropriate name
            const newWindow = window.open(objectUrl, '_blank');
            newWindow.document.title = displayFilename;
            
            // Clean up object URL after a delay
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60000); // 1 minute
            
        } catch (err) {
            console.error('Error viewing document:', err);
            alert('Failed to view document. Please try again.');
        } finally {
            // Hide loading indicator
            // setViewLoading(false);
        }
    };

    // Delete passport file
    const handleDeletePassport = async (guideId, filename) => {
        if (window.confirm('Are you sure you want to delete this passport document?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/guides/${guideId}/passport`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Update the guide in state to show no passport file
                const updatedGuides = guides.map(guide => {
                    if (guide._id === guideId) {
                        return { 
                            ...guide, 
                            passportFile: '', 
                            profileStatus: 'incomplete' 
                        };
                    }
                    return guide;
                });
                
                setGuides(updatedGuides);
                alert('Passport document deleted successfully');
            } catch (err) {
                console.error('Error deleting passport file:', err);
                alert('Failed to delete passport document. Please try again.');
            }
        }
    };
    
    // Calculate statistics
    const totalGuides = guides.length;
    const completeProfiles = guides.filter(g => g.passportFile).length;
    const incompleteProfiles = totalGuides - completeProfiles;
    const completionPercentage = totalGuides ? Math.round((completeProfiles / totalGuides) * 100) : 0;
    
    // Filter guides based on search and selected view
    const filteredGuides = guides.filter(guide => {
        const matchesSearch = !searchTerm || 
            guide.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            guide.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (guide.phone && guide.phone.includes(searchTerm));
            
        // Use passportFile for determining complete/incomplete status
        if (selectedView === 'All Guides') return matchesSearch;
        if (selectedView === 'Complete Profiles') return matchesSearch && guide.passportFile;
        if (selectedView === 'Incomplete Profiles') return matchesSearch && !guide.passportFile;
        
        return matchesSearch;
    });

    // Loading state
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading guides...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error</h4>
                <p>{error}</p>
                <Button variant="primary" onClick={fetchGuides}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="fw-bold m-0" style={{ color: '#243b7f' }}>Guides</h2>
                    <p className="text-muted mb-0">Manage guides under your organization</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <h5 className="fw-bold mb-3">My Guides ({totalGuides})</h5>
                    <p className="text-muted mb-3">Manage your guide roster and their contact information</p>

                    <Row className="g-4 mb-4">
                        <Col md={4}>
                            <Card className="border bg-light h-100">
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Total Guides</h6>
                                    <h2 className="display-6 fw-bold" style={{ color: '#20b2aa' }}>{totalGuides}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border bg-light h-100">
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Complete Profiles</h6>
                                    <h2 className="display-6 fw-bold" style={{ color: '#20b2aa' }}>{completeProfiles}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border bg-light h-100">
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Incomplete Profiles</h6>
                                    <h2 className="display-6 fw-bold" style={{ color: '#f39c12' }}>{incompleteProfiles}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold">Profile Completion</span>
                            <span className="fw-bold">{completionPercentage}%</span>
                        </div>
                        <ProgressBar 
                            now={completionPercentage} 
                            variant="success" 
                            style={{ height: '8px' }} 
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <InputGroup style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-light border-end-0">
                                <FaSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-start-0 bg-light"
                            />
                        </InputGroup>

                        <Form.Select 
                            style={{ width: 'auto' }}
                            value={selectedView}
                            onChange={(e) => setSelectedView(e.target.value)}
                        >
                            <option>All Guides</option>
                            <option>Complete Profiles</option>
                            <option>Incomplete Profiles</option>
                        </Form.Select>

                        <Button 
                            variant="primary" 
                            className="d-flex align-items-center"
                            style={{ backgroundColor: '#00a69c', borderColor: '#00a69c' }}
                            onClick={handleOpenModal}
                        >
                            <FaPlus className="me-2" /> Add Guide
                        </Button>
                    </div>

                    <Row className="g-4">
                        {filteredGuides.map(guide => (
                            <Col lg={4} md={6} key={guide._id}>
                                <Card className="border mb-4 position-relative">
                                    {guide.passportFile ? (
                                        <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                            <Badge bg="success" className="px-2 py-1 rounded-pill">
                                                <FaCheck className="me-1" size={10} /> Complete
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                            <Badge bg="warning" className="px-2 py-1 rounded-pill text-dark">
                                                <FaExclamationTriangle className="me-1" size={10} /> Incomplete
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle p-3 me-3">
                                                <span style={{ fontSize: '18px' }}>{guide.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{guide.name}</h6>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FaEnvelope className="text-muted me-2" size={14} />
                                                <small className="text-muted">{guide.email}</small>
                                            </div>
                                            {guide.phone && (
                                                <div className="d-flex align-items-center mb-2">
                                                    <FaPhone className="text-muted me-2" size={14} />
                                                    <small className="text-muted">{guide.phone}</small>
                                                </div>
                                            )}
                                            {guide.mobile && (
                                                <div className="d-flex align-items-center mb-2">
                                                    <FaPhone className="text-muted me-2" size={14} />
                                                    <small className="text-muted">{guide.mobile}</small>
                                                </div>
                                            )}
                                            <div className="d-flex align-items-center mb-2">
                                                <FaIdCard className="text-muted me-2" size={14} />
                                                <small className="text-muted">
                                                    {guide.passportId !== 'No Passport Photo' ? 
                                                        guide.passportId : 
                                                        'No Passport Number'}
                                                </small>
                                            </div>
                                            {guide.passportFile ? (
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <FaFileDownload className="text-muted me-2" size={14} />
                                                        <small className="text-muted">{guide.passportFile}</small>
                                                    </div>
                                                    <div>
                                                        {/* View Document Button */}
                                                        <Button 
                                                            variant="link" 
                                                            className="p-0 mx-1" 
                                                            size="sm"
                                                            onClick={() => handleViewPassport(guide.passportFile)}
                                                            title="View Document"
                                                        >
                                                            <FaEye className="text-primary" />
                                                        </Button>
                                                        
                                                        {/* Delete Document Button */}
                                                        <Button 
                                                            variant="link" 
                                                            className="p-0 mx-1" 
                                                            size="sm"
                                                            onClick={() => handleDeletePassport(guide._id, guide.passportFile)}
                                                            title="Delete Document"
                                                        >
                                                            <FaTrashAlt className="text-danger" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center text-muted">
                                                    <FaPassport className="me-2" size={14} />
                                                    <small>No passport document uploaded</small>
                                                </div>
                                            )}
                                            
                                            {/* Only show this if both phone numbers are missing */}
                                            {!guide.phone && !guide.mobile && (
                                                <div className="d-flex align-items-center text-muted mt-2">
                                                    <FaPhone className="me-2" size={14} />
                                                    <small>No phone numbers provided</small>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="d-flex">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="me-2 d-flex align-items-center"
                                                onClick={() => handleEdit(guide._id)}
                                            >
                                                <FaEdit className="me-1" /> Edit
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                className="d-flex align-items-center"
                                                onClick={() => handleDelete(guide._id)}
                                            >
                                                <FaTrash className="me-1" /> Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}

                        {filteredGuides.length === 0 && (
                            <Col xs={12}>
                                <div className="text-center py-5 text-muted">
                                    <h5>No guides found</h5>
                                    <p>Try adjusting your search or add a new guide</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="w-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <Button 
                                variant="link" 
                                className="p-0 text-dark" 
                                onClick={handleCloseModal}
                                style={{ textDecoration: 'none' }}
                            >
                                <FaTimes size={20} />
                            </Button>
                            <h4 className="fw-bold">Add New Guide</h4>
                            <div style={{ width: '20px' }}></div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="pt-2">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Name<span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                name="name"
                                value={newGuide.name}
                                onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Name is required
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Email<span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="email"
                                name="email"
                                value={newGuide.email}
                                onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid email
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Password<span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="password"
                                name="password"
                                value={newGuide.password}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Confirm Password<span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="password"
                                name="confirmPassword"
                                value={newGuide.confirmPassword}
                                onChange={handleInputChange}
                            />
                            {newGuide.password !== newGuide.confirmPassword && 
                                <div className="text-danger small">Passwords do not match</div>
                            }
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Passport Number <span className="text-muted">(optional)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="passportNumber"
                                value={newGuide.passportNumber}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Passport Document <span className="text-muted">(optional, JPG, PNG or PDF)</span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange}
                                disabled={!newGuide.passportNumber.trim()}
                            />
                            {!newGuide.passportNumber.trim() && (
                                <Form.Text className="text-muted">
                                    Enter passport number first to upload passport document
                                </Form.Text>
                            )}
                            {newGuide.passportNumber.trim() && (
                                <Form.Text className="text-muted">
                                    Max file size: 5MB
                                </Form.Text>
                            )}
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Nusuk Email <span className="text-muted">(optional)</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="nusukEmail"
                                value={newGuide.nusukEmail}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Main Phone Number <span className="text-muted">(optional, with country code +xxx)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="mainPhone"
                                value={newGuide.mainPhone}
                                onChange={handleInputChange}
                                placeholder="+966XXXXXXX"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Hajj Phone Number <span className="text-muted">(optional, must be a Saudi number +966)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="hajjPhone"
                                value={newGuide.hajjPhone}
                                onChange={handleInputChange}
                                placeholder="+966XXXXXXXX"
                            />
                        </Form.Group>
                        
                        <div className="d-flex justify-content-end mt-4">
                            <Button 
                                variant="primary" 
                                type="submit"
                                style={{ backgroundColor: '#00a69c', borderColor: '#00a69c' }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Spinner 
                                            as="span" 
                                            animation="border" 
                                            size="sm" 
                                            role="status" 
                                            aria-hidden="true" 
                                            className="me-2"
                                        />
                                        Saving...
                                    </>
                                ) : 'Save'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={handleEditClose} size="lg">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="w-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <Button 
                                variant="link" 
                                className="p-0 text-dark" 
                                onClick={handleEditClose}
                                style={{ textDecoration: 'none' }}
                            >
                                <FaTimes size={20} />
                            </Button>
                            <h4 className="fw-bold">Edit Guide</h4>
                            <div style={{ width: '20px' }}></div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="pt-2">
                    <Form noValidate validated={editValidated} onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Name<span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                name="name"
                                value={editingGuide?.name || ''}
                                onChange={handleEditInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Name is required
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Passport Number <span className="text-muted">(optional)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="passportNumber"
                                value={editingGuide?.passportNumber || ''}
                                onChange={handleEditInputChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Passport Document <span className="text-muted">(optional, JPG, PNG or PDF)</span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleEditFileChange}
                                disabled={!editingGuide?.passportNumber?.trim()}
                            />
                            {!editingGuide?.passportNumber?.trim() && (
                                <Form.Text className="text-muted">
                                    Enter passport number first to upload passport document
                                </Form.Text>
                            )}
                            {editingGuide?.passportNumber?.trim() && (
                                <Form.Text className="text-muted">
                                    Max file size: 5MB
                                </Form.Text>
                            )}
                        </Form.Group>
                        
                        {editingGuide?.passportFile && (
                            <div className="mb-3">
                                <Button 
                                    variant="link" 
                                    className="p-0 text-primary" 
                                    onClick={() => handleViewPassportInEdit(editingGuide.passportFile)}
                                >
                                    View Current Passport Document
                                </Button>
                            </div>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Nusuk Email <span className="text-muted">(optional)</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="nusukEmail"
                                value={editingGuide?.nusukEmail || ''}
                                onChange={handleEditInputChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Main Phone Number <span className="text-muted">(optional, with country code +xxx)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="mainPhone"
                                value={editingGuide?.mainPhone || ''}
                                onChange={handleEditInputChange}
                                placeholder="+966XXXXXXX"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-end">
                                Hajj Phone Number <span className="text-muted">(optional, must be a Saudi number +966)</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="hajjPhone"
                                value={editingGuide?.hajjPhone || ''}
                                onChange={handleEditInputChange}
                                placeholder="+966XXXXXXXX"
                            />
                        </Form.Group>
                        
                        <div className="d-flex justify-content-end mt-4">
                            <Button 
                                variant="primary" 
                                type="submit"
                                style={{ backgroundColor: '#00a69c', borderColor: '#00a69c' }}
                                disabled={editSubmitting}
                            >
                                {editSubmitting ? (
                                    <>
                                        <Spinner 
                                            as="span" 
                                            animation="border" 
                                            size="sm" 
                                            role="status" 
                                            aria-hidden="true" 
                                            className="me-2"
                                        />
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Guides;