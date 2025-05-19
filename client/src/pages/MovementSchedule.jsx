import React, { useState, useCallback, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Button, Row, Col, Modal } from 'react-bootstrap';
import { FaSearch, FaFilter, FaDownload, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaBus, FaPlane, FaUpload, FaHotel, FaPlaneArrival, FaPlaneDeparture, FaEye } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const MovementSchedule = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movements, setMovements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });
    const [showImportModal, setShowImportModal] = useState(false);
    const [filters, setFilters] = useState({
        movementType: 'All Movements',
        fromCity: 'All Cities (From)',
        toCity: 'All Cities (To)',
    });
    const [showPilgrimDetails, setShowPilgrimDetails] = useState(false);
    const [selectedPilgrims, setSelectedPilgrims] = useState([]);

    const styles = {
        card: {
            transition: 'all 0.3s ease',
        },
        hoverEffect: {
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)'
            }
        },
        tableRow: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,.02)'
            }
        },
        badge: {
            fontWeight: 500,
            letterSpacing: '0.3px'
        },
        pilgrimCount: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        statsCard: {
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)'
            }
        }
    };

    // Stats calculation helper
    const stats = {
        todaysMovements: movements.filter(m => {
            const today = new Date().toISOString().split('T')[0];
            return m.date === today;
        }).length,
        completedMovements: movements.filter(m => m.status === 'completed').length,
        upcomingMovements: movements.filter(m => m.status === 'upcoming').length,
        completionRate: movements.length ? 
            Math.round((movements.filter(m => m.status === 'completed').length / movements.length) * 100) : 0
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch movements from the database
                const movementsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/movements`);
                if (!movementsResponse.ok) {
                    throw new Error('Failed to fetch movements');
                }
                const movementsData = await movementsResponse.json();
                setMovements(movementsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data');
                console.error('Error:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredMovements = movements.filter(movement => {
        const matchesSearch = 
            movement.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movement.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movement.to.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesType = filters.movementType === 'All Movements' || movement.type === filters.movementType;
        const matchesFrom = filters.fromCity === 'All Cities (From)' || movement.from === filters.fromCity;
        const matchesTo = filters.toCity === 'All Cities (To)' || movement.to === filters.toCity;
        
        return matchesSearch && matchesType && matchesFrom && matchesTo;
    });

    const getUniqueValues = (field) => {
        return [...new Set(movements.map(m => m[field]))];
    };

    const formatCountdown = (date, time) => {
        const targetDate = new Date(`${date}T${time}`);
        const now = new Date();
        const diff = targetDate - now;
        
        if (diff < 0) return { days: 0, hours: 0, minutes: 0 };
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return { days, hours, minutes };
    };

    const getMovementTypeIcon = (type) => {
        switch (type) {
            case 'Arrival':
                return <FaPlaneArrival />;
            case 'Departure':
                return <FaPlaneDeparture />;
            case 'Transfer of Hotels':
                return <FaHotel />;
            default:
                return <FaBus />;
        }
    };

    const getMovementTypeStyle = (type) => {
        switch (type) {
            case 'Arrival':
                return 'info';
            case 'Departure':
                return 'danger';
            case 'Transfer of Hotels':
                return 'success';
            default:
                return 'primary';
        }
    };

    // Handle file upload
    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;
        
        const file = acceptedFiles[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true }); // Enable date parsing
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: 'yyyy-MM-dd'
                });

                // Transform the imported data into movements
                const importedMovements = [];
                jsonData.forEach(row => {
                    // Format the date properly
                    const formatDate = (dateStr) => {
                        if (!dateStr) return '';
                        const date = new Date(dateStr);
                        return date.toISOString().split('T')[0];
                    };

                    // Add arrival movement
                    if (row['Type'] === 'Arrival') {
                        importedMovements.push({
                            id: `import-arrival-${row['Al Rajhi ID']}`,
                            type: 'Arrival',
                            from: row['From'],
                            to: row['To'],
                            date: formatDate(row['Date']),
                            time: row['Time'],
                            flightNumber: row['Flight Number'],
                            transportation: row['Transportation'],
                            status: 'upcoming',
                            pilgrimCount: 1,
                            pilgrimDetails: [{
                                id: row['Al Rajhi ID'],
                                name: row['Full Name'],
                                gender: row['Gender'],
                                passportNumber: row['Passport Number'],
                                packageName: row['Package Name']
                            }]
                        });
                    }

                    // Add departure movement
                    if (row['Type'] === 'Departure') {
                        importedMovements.push({
                            id: `import-departure-${row['Al Rajhi ID']}`,
                            type: 'Departure',
                            from: row['From'],
                            to: row['To'],
                            date: formatDate(row['Date']),
                            time: row['Time'],
                            flightNumber: row['Flight Number'],
                            transportation: row['Transportation'],
                            status: 'upcoming',
                            pilgrimCount: 1,
                            pilgrimDetails: [{
                                id: row['Al Rajhi ID'],
                                name: row['Full Name'],
                                gender: row['Gender'],
                                passportNumber: row['Passport Number'],
                                packageName: row['Package Name']
                            }]
                        });
                    }

                    // Add transfer movement
                    if (row['Type'] === 'Transfer of Hotels') {
                        importedMovements.push({
                            id: `import-transfer-${row['Al Rajhi ID']}`,
                            type: 'Transfer of Hotels',
                            from: row['From'],
                            to: row['To'],
                            date: formatDate(row['Date']),
                            time: row['Time'],
                            transportation: row['Transportation'],
                            status: 'upcoming',
                            pilgrimCount: 1,
                            pilgrimDetails: [{
                                id: row['Al Rajhi ID'],
                                name: row['Full Name'],
                                gender: row['Gender'],
                                passportNumber: row['Passport Number'],
                                packageName: row['Package Name']
                            }]
                        });
                    }
                });

                // Group movements based on type
                const groupedMovements = importedMovements.reduce((acc, movement) => {
                    let key;
                    if (movement.type === 'Transfer of Hotels') {
                        // Group transfers by date and time
                        key = `${movement.type}-${movement.from}-${movement.to}-${movement.date}-${movement.time}`;
                    } else {
                        // Group arrivals and departures by flight number
                        key = `${movement.type}-${movement.flightNumber}-${movement.date}-${movement.time}`;
                    }

                    if (!acc[key]) {
                        acc[key] = {
                            ...movement,
                            pilgrimCount: 0,
                            pilgrimDetails: []
                        };
                    }
                    acc[key].pilgrimCount += 1;
                    acc[key].pilgrimDetails.push(...movement.pilgrimDetails);
                    return acc;
                }, {});

                // Save to MongoDB
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/movements/batch`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(Object.values(groupedMovements))
                    });

                    if (!response.ok) {
                        throw new Error('Failed to save movements');
                    }

                    // Update local state
                    setMovements(prev => [...prev, ...Object.values(groupedMovements)]);
                    setShowImportModal(false);
                    alert('Movements imported and saved successfully!');
                } catch (error) {
                    console.error('Error saving movements:', error);
                    alert('Error saving movements to database');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error importing data. Please check the file format and try again.');
            }
        };

        reader.readAsArrayBuffer(file);
    }, []);

    // Add exportToExcel function after the onDrop function
    const exportToExcel = () => {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert the pilgrim details to the format we want to export
        const exportData = selectedPilgrims.map(pilgrim => ({
            'Al Rajhi ID': pilgrim.id,
            'Full Name': pilgrim.name,
            'Gender': pilgrim.gender,
            'Passport Number': pilgrim.passportNumber,
            'Package Name': pilgrim.packageName
        }));
        
        // Create a worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Pilgrim Details');
        
        // Generate & download the excel file
        XLSX.writeFile(wb, 'pilgrim-details.xlsx');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        multiple: false
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-3" style={{ background: '#f8f9fa' }}>  {/* Light gray background */}
            {/* Statistics Cards - Update styling */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm" style={styles.statsCard}>
                        <Card.Body className="border-start border-primary border-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Today's Movements</h6>
                                    <h3 className="mb-0 text-primary">{stats.todaysMovements}</h3>
                                </div>
                                <div className="text-primary opacity-75">
                                    <FaClock size={28} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm" style={styles.statsCard}>
                        <Card.Body className="border-start border-success border-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Completed</h6>
                                    <h3 className="mb-0 text-success">{stats.completedMovements}</h3>
                                </div>
                                <div className="text-success opacity-75">
                                    <FaCalendarAlt size={28} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm" style={styles.statsCard}>
                        <Card.Body className="border-start border-warning border-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Upcoming</h6>
                                    <h3 className="mb-0 text-warning">{stats.upcomingMovements}</h3>
                                </div>
                                <div className="text-warning opacity-75">
                                    <FaMapMarkerAlt size={28} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm" style={styles.statsCard}>
                        <Card.Body className="border-start border-info border-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Completion Rate</h6>
                                    <h3 className="mb-0 text-info">{stats.completionRate}%</h3>
                                </div>
                                <div className="text-info opacity-75">
                                    <FaBus size={28} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="shadow-sm mb-4" style={styles.card}>
                <Card.Body style={{ background: 'white' }}>
                    <Row className="align-items-center">
                        <Col md={3}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search movements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={filters.movementType}
                                onChange={(e) => setFilters(prev => ({ ...prev, movementType: e.target.value }))}
                            >
                                <option>All Movements</option>
                                <option>Arrival</option>
                                <option>Departure</option>
                                <option>Transfer of Hotels</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={filters.fromCity}
                                onChange={(e) => setFilters(prev => ({ ...prev, fromCity: e.target.value }))}
                            >
                                <option>All Cities (From)</option>
                                {getUniqueValues('from').map(city => (
                                    <option key={city}>{city}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={filters.toCity}
                                onChange={(e) => setFilters(prev => ({ ...prev, toCity: e.target.value }))}
                            >
                                <option>All Cities (To)</option>
                                {getUniqueValues('to').map(city => (
                                    <option key={city}>{city}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3} className="text-end">
                            <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                                <FaUpload className="me-1" /> Import
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Movements Table */}
            <Card className="shadow-sm" style={styles.card}>
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Pilgrims</th>
                                <th>Countdown</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.map(movement => {
                                const countdown = formatCountdown(movement.date, movement.time);
                                return (
                                    <tr key={movement.id} style={styles.tableRow}>
                                        <td>
                                            <span className={`text-${getMovementTypeStyle(movement.type)} d-inline-flex align-items-center gap-2`}>
                                                {getMovementTypeIcon(movement.type)} {movement.type}
                                            </span>
                                        </td>
                                        <td>{movement.from}</td>
                                        <td>{movement.to}</td>
                                        <td>{new Date(movement.date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}</td>
                                        <td>{movement.time}</td>
                                        <td>
                                            <div style={styles.pilgrimCount} 
                                                 onClick={() => {
                                                     setSelectedPilgrims(movement.pilgrimDetails);
                                                     setShowPilgrimDetails(true);
                                                 }}>
                                                <span className="badge bg-primary rounded-pill" style={styles.badge}>
                                                    {movement.pilgrimCount}
                                                </span>
                                                <FaEye className="text-primary" />
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-muted">
                                                {countdown.days}d {countdown.hours}h {countdown.minutes}m
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge bg-${movement.status === 'completed' ? 'success' : 'warning'} rounded-pill`}>
                                                {movement.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Import Modal */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Import Movements</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div {...getRootProps()} className="border rounded p-4 text-center" style={{ cursor: 'pointer' }}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the file here...</p>
                        ) : (
                            <div>
                                <FaUpload size={24} className="mb-2" />
                                <p>Drag and drop Excel/CSV file here, or click to select file</p>
                                <small className="text-muted">Supported formats: .xlsx, .xls, .csv</small>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Pilgrim Details Modal */}
            <Modal show={showPilgrimDetails} onHide={() => setShowPilgrimDetails(false)} size="lg">
                <Modal.Header closeButton>
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <Modal.Title>Pilgrim Details</Modal.Title>
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={exportToExcel}
                            className="d-flex align-items-center gap-2"
                        >
                            <FaDownload /> Export to Excel
                        </Button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Al Rajhi ID</th>
                                <th>Full Name</th>
                                <th>Gender</th>
                                <th>Passport Number</th>
                                <th>Package Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPilgrims.map(pilgrim => (
                                <tr key={pilgrim.id}>
                                    <td>{pilgrim.id}</td>
                                    <td>{pilgrim.name}</td>
                                    <td>{pilgrim.gender}</td>
                                    <td>{pilgrim.passportNumber}</td>
                                    <td>{pilgrim.packageName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MovementSchedule;
