import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap';
import { FaUserPlus, FaUsers, FaExchangeAlt, FaSearch, FaDownload, FaUserCircle, FaEnvelope, FaPhone, FaGlobe, FaCheckCircle, FaUpload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Add these styles at the top of the file
const styles = {
    pilgrimsList: {
        marginTop: '1rem'
    },
    pilgrimRow: {
        transition: 'all 0.2s ease',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
    },
    textMono: {
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        fontWeight: 600,
        letterSpacing: '0.5px'
    },
    pilgrimAvatar: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: '#f8f9fa'
    }
};

// Sample data
const pilgrims = [
    
    
];

const LinkPilgrims = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [guides, setGuides] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [importedData, setImportedData] = useState([]);
    const [importErrors, setImportErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pilgrims, setPilgrims] = useState([]);  // Initialize as empty array

    // --- Statistics ---
    const totalPilgrims = pilgrims.length;
    const approvedCount = pilgrims.filter(p => p.status === 'Approved').length;
    const pendingCount = pilgrims.filter(p => p.status === 'Pending').length;
    const uniqueGuides = [...new Set(pilgrims.map(p => p.guide))].filter(Boolean).length;
    
    // Fetch guides on component mount
    useEffect(() => {
        const fetchGuides = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guides`);
                if (!response.ok) {
                    throw new Error('Failed to fetch guides');
                }
                const data = await response.json();
                console.log('Fetched guides:', data); // Debug log
                if (Array.isArray(data)) {
                    // If the API returns an array directly
                    setGuides(data);
                } else if (data.guides && Array.isArray(data.guides)) {
                    // If the API returns an object with guides property
                    setGuides(data.guides);
                } else {
                    console.error('Unexpected data format:', data);
                    setGuides([]);
                }
            } catch (error) {
                console.error('Error fetching guides:', error);
                setGuides([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuides();
    }, []);

    // Fetch pilgrims on component mount
    useEffect(() => {
        const fetchPilgrims = async () => {
            try {
                // Update the URL to match the new route
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/linked-pilgrims/linked`);
                if (!response.ok) {
                    throw new Error('Failed to fetch linked pilgrims');
                }
                const data = await response.json();
                // Ensure data is an array
                setPilgrims(Array.isArray(data) ? data : []);
                console.log('Fetched pilgrims:', data);
            } catch (error) {
                console.error('Error:', error);
                setPilgrims([]); // Set empty array on error
            }
        };

        fetchPilgrims();
    }, []); // Empty dependency array means this runs once on component mount

    // Handle Excel file import
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                // Normalize keys: trim and remove hidden chars
                jsonData = jsonData.map(row => {
                    const normalized = {};
                    Object.keys(row).forEach(key => {
                        normalized[key.trim().replace(/\uFEFF/g, '')] = row[key];
                    });
                    return normalized;
                });

                console.log('Normalized CSV data:', jsonData);

                // Now check for required columns
                const hasRequiredColumns = jsonData.length > 0 &&
                    jsonData.every(row =>
                        'Name' in row &&
                        'Passport No' in row &&
                        'Guide Name' in row
                    );

                if (hasRequiredColumns) {
                    const formattedPilgrims = jsonData.map(p => ({
                        name: p['Name'],
                        passport: p['Passport No'],
                        guide: p['Guide Name'],
                        status: 'Pending',
                        nationality: p['Nationality'] || 'Not specified'
                    }));

                    setImportedData(formattedPilgrims);
                    setPilgrims(formattedPilgrims);
                    setImportErrors([]);
                } else {
                    setImportErrors(['Invalid file format. Required columns: Name, Passport No, Guide Name']);
                    setImportedData([]);
                }
            } catch (error) {
                console.error('Error reading file:', error);
                setImportErrors(['Failed to read file']);
                setImportedData([]);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Handle bulk link submission
    const handleBulkLink = async () => {
        try {
            console.log('Sending data:', importedData); // Debug log

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/linked-pilgrims/bulk-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pilgrims: importedData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save pilgrims');
            }

            const result = await response.json();
            console.log('Save result:', result); // Debug log

            // Update the displayed list with the saved data
            setPilgrims(result);
            setShowBulkModal(false);
            setImportErrors([]);
            setImportedData([]);
        } catch (error) {
            console.error('Error saving pilgrims:', error);
            setImportErrors([error.message || 'Failed to save pilgrims to database']);
        }
    };

    // Add this function inside your LinkPilgrims component
    const toggleStatus = (index) => {
        setPilgrims(prevPilgrims => {
            const updated = [...prevPilgrims];
            const pilgrim = { ...updated[index] };
            if (pilgrim.status === 'Pending') {
                pilgrim.status = 'Approved';
            } else if (pilgrim.status === 'Approved') {
                pilgrim.status = 'Pending';
            }
            updated[index] = pilgrim;
            return updated;
        });
    };

    return (
        <Container fluid className="py-4">
            {/* Statistics Section */}
            <Row className="mb-4">
                <Col md={3} xs={6} className="mb-2">
                    <Card bg="primary" text="white" className="text-center shadow-sm">
                        <Card.Body>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{totalPilgrims}</div>
                            <div>Total Pilgrims</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6} className="mb-2">
                    <Card bg="success" text="white" className="text-center shadow-sm">
                        <Card.Body>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{approvedCount}</div>
                            <div>Approved</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6} className="mb-2">
                    <Card bg="warning" text="white" className="text-center shadow-sm">
                        <Card.Body>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{pendingCount}</div>
                            <div>Pending</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6} className="mb-2">
                    <Card bg="info" text="white" className="text-center shadow-sm">
                        <Card.Body>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{uniqueGuides}</div>
                            <div>Unique Guides</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Header Section */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="mb-1" style={{ color: '#0d6efd' }}>
                        <FaUsers className="me-2" />
                        Link Pilgrims to Guides
                    </h2>
                    <p className="text-muted mb-0">
                        Assign pilgrims to guides and manage their connections
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-primary" 
                        onClick={() => setShowBulkModal(true)}
                    >
                        <FaExchangeAlt className="me-2" />
                        Bulk Link
                    </Button>
                </div>
            </div>

            {/* Search and Filters Section */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by pilgrim name or passport number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Form.Select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option>All Statuses</option>
                                <option>Approved</option>
                                <option>Pending</option>
                            </Form.Select>
                        </Col>
                        {/* Removed country filter here */}
                        <Col md={2}>
                            <Button variant="outline-secondary" className="w-100">
                                <FaDownload className="me-2" />
                                Export Data
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Pilgrims List Section */}
            <div style={styles.pilgrimsList}>
                {Array.isArray(pilgrims) && pilgrims.length === 0 ? (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <FaUsers className="text-muted mb-3" size={48} />
                            <h5 className="text-muted">No linked pilgrims found</h5>
                            <p className="text-muted mb-0">Use the buttons above to start linking pilgrims to guides</p>
                        </Card.Body>
                    </Card>
                ) : (
                    Array.isArray(pilgrims) && pilgrims.map((pilgrim, index) => (
                        <Card 
                            key={index} 
                            className="mb-3"
                            style={styles.pilgrimRow}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            }}
                        >
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col xs={12} md={4}>
                                        <div className="d-flex align-items-center">
                                            <div style={styles.pilgrimAvatar} className="me-3">
                                                <FaUserCircle size={40} className="text-primary" />
                                            </div>
                                            <div>
                                                <h6 className="mb-1">{pilgrim.name}</h6>
                                                <small className="text-muted">
                                                    <FaGlobe className="me-1" />
                                                    {pilgrim.nationality || 'Not specified'}
                                                </small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={3} className="my-2 my-md-0">
                                        <div className="d-flex align-items-center">
                                            <div className="text-muted me-2">Passport:</div>
                                            <div style={styles.textMono}>{pilgrim.passport}</div>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <div className="d-flex align-items-center">
                                            <FaUsers className="text-primary me-2" />
                                            <div>
                                                <div className="text-primary">{pilgrim.guide}</div>
                                                <small className="text-muted">Guide</small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={2} className="text-md-end mt-2 mt-md-0">
                                        <Badge 
                                            bg={pilgrim.status === 'Approved' ? 'success' : 
                                                pilgrim.status === 'Pending' ? 'warning' : 'danger'}
                                            className="me-2"
                                        >
                                            {pilgrim.status}
                                        </Badge>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            className="rounded-circle"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                padding: 0,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={() => toggleStatus(index)}
                                        >
                                            <FaExchangeAlt />
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>

            {/* Bulk Link Modal */}
            <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Bulk Link Pilgrims</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h6>Available Guides</h6>
                        <Row className="g-2">
                            {isLoading ? (
                                <Col>Loading guides...</Col>
                            ) : guides.length > 0 ? (
                                guides.map(guide => (
                                    <Col md={6} key={guide._id || guide.id}>
                                        <Card className="p-2">
                                            <div className="d-flex align-items-center">
                                                <FaUsers className="me-2 text-primary" />
                                                <span>{guide.name}</span>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col>No guides available</Col>
                            )}
                        </Row>
                    </div>

                    <div className="mb-3">
                        <Form.Group>
                            <Form.Label>Upload CSV File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                            />
                            <Form.Text className="text-muted">
                                Required columns: Name, Passport No, Guide Name
                            </Form.Text>
                        </Form.Group>
                    </div>

                    {importErrors.length > 0 && (
                        <div className="mb-3">
                            <h6 className="text-danger">Errors:</h6>
                            <ul className="text-danger">
                                {importErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {importedData.length > 0 && (
                        <div>
                            <h6>Preview ({importedData.length} records)</h6>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Passport No</th>
                                        <th>Guide Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importedData.slice(0, 5).map((row, index) => (
                                        <tr key={index}>
                                            <td>{row['Name']}</td>
                                            <td>{row['Passport No']}</td>
                                            <td>{row['Guide Name']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {importedData.length > 5 && (
                                <p className="text-muted">...and {importedData.length - 5} more records</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleBulkLink}
                        disabled={importedData.length === 0}
                    >
                        Link {importedData.length} Pilgrims
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default LinkPilgrims;