import React, { useState, useCallback, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Button, Row, Col, Modal, Badge } from 'react-bootstrap';
import { 
    FaSearch, 
    FaFilter, 
    FaDownload, 
    FaUpload, 
    FaUsers, 
    FaGlobeAmericas, 
    FaPassport 
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    Tooltip,
    Legend
);

const PilgrimsInformation = () => {
    const [pilgrims, setPilgrims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPilgrim, setSelectedPilgrim] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        pilgrimCategory: '',
        gender: '',
        nationality: '',
        packageType: '',
        visaStatus: '',
        wheelChair: ''
    });

    // Filter pilgrims based on search term and filters
    const filteredPilgrims = pilgrims.filter(pilgrim => {
        // Search term filter
        const matchesSearch = 
            pilgrim.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            pilgrim.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        // Additional filters
        const matchesCategory = !filters.pilgrimCategory || pilgrim.pilgrimCategory === filters.pilgrimCategory;
        const matchesGender = !filters.gender || pilgrim.gender === filters.gender;
        const matchesNationality = !filters.nationality || pilgrim.nationality === filters.nationality;
        const matchesPackageType = !filters.packageType || pilgrim.packageType === filters.packageType;
        const matchesVisaStatus = !filters.visaStatus || pilgrim.visaStatus === filters.visaStatus;
        const matchesWheelChair = !filters.wheelChair || pilgrim.wheelChair === filters.wheelChair;

        return matchesSearch && matchesCategory && matchesGender && 
               matchesNationality && matchesPackageType && matchesVisaStatus && 
               matchesWheelChair;
    });

    // Get unique values for filter options
    const getUniqueValues = (field) => {
        return [...new Set(pilgrims.map(p => p[field]).filter(Boolean))];
    };

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            pilgrimCategory: '',
            gender: '',
            nationality: '',
            packageType: '',
            visaStatus: '',
            wheelChair: ''
        });
        setShowFilterModal(false);
    };

    // Handle row click to show pilgrim details
    const handleRowClick = (pilgrim) => {
        setSelectedPilgrim(pilgrim);
        setShowModal(true);
    };

    // Handle closing the detail modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPilgrim(null);
    };

    // Handle export to Excel
    const handleExport = () => {
        if (pilgrims.length === 0) {
            alert('No data to export');
            return;
        }

        // Transform the data to make it more readable in Excel
        const exportData = pilgrims.map(pilgrim => ({
            'Full Name': pilgrim.fullName || '',
            'First Name': pilgrim.firstName || '',
            'Last Name': pilgrim.lastName || '',
            'Passport Number': pilgrim.passportNumber || '',
            'Al Rajhi ID': pilgrim.alRajhiId || '',
            'Pilgrim Category': pilgrim.pilgrimCategory || '',
            'Date of Birth': pilgrim.dateOfBirth || '',
            'Age': pilgrim.age || '',
            'Gender': pilgrim.gender || '',
            'Email': pilgrim.email || '',
            'Mobile Number': pilgrim.mobileNumber || '',
            'Marketing Partner': pilgrim.marketingPartner || '',
            'Serial Number': pilgrim.serialNumber || '',
            'Group Number': pilgrim.groupNumber || '',
            'Type of Pilgrim': pilgrim.typeOfPilgrim || '',
            'Package Number': pilgrim.packageNumber || '',
            'Package Type': pilgrim.packageType || '',
            'Package Category': pilgrim.packageCategory || '',
            'Package Name': pilgrim.packageName || '',
            'Package Start Date': pilgrim.packageStartDate || '',
            'Package End Date': pilgrim.packageEndDate || '',
            'No of Nights': pilgrim.noOfNights || ''
        }));

        try {
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            
            // Create workbook and append worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pilgrims");
            
            // Generate filename with current date
            const date = new Date().toISOString().split('T')[0];
            const fileName = `Pilgrims_Data_${date}.xlsx`;
            
            // Save file
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    };

    // Removed the card option by eliminating the card rendering logic in the renderDetailItem function.
    const renderDetailItem = (label, value) => {
        let displayValue = value;

        // Special handling for hotel objects
        if (label.includes('Hotel') && typeof value === 'object' && value !== null) {
            if (label.includes('Rating')) {
                displayValue = value.rating;
            } else if (label.includes('Services')) {
                displayValue = value.services;
                displayValue = value.services;
            } else if (label.includes('Room Type')) {
                displayValue = value.roomType;
            } else if (label.includes('Check In')) {
                displayValue = new Date(value.checkIn).toLocaleDateString();
            } else if (label.includes('Check Out')) {
                displayValue = new Date(value.checkOut).toLocaleDateString();
            } else {
                displayValue = value.name; // Default to hotel name
            }
        }
        
        // Handle regular values
        if (typeof value === 'object' && value !== null && !label.includes('Hotel')) {
            if (Array.isArray(value)) {
                displayValue = value.join(', ');
            } else {
                displayValue = Object.values(value).join(', ');
            }
        }

        // Handle dates
        if (value instanceof Date) {
            displayValue = value.toLocaleDateString();
        }

        // Handle undefined, null, or empty values
        if (value === undefined || value === null || value === '' || displayValue === undefined) {
            displayValue = 'N/A';
        }

        return (
            <div className="detail-item p-2 mb-2 rounded" style={{ backgroundColor: 'rgba(36, 59, 127, 0.03)' }}>
                <div className="text-muted small" style={{ color: '#8B4513' }}>{label}</div>
                <div className="fw-500 mt-1" style={{ color: '#243b7f' }}>{displayValue}</div>
            </div>
        );
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            setLoading(true);
            try {
                // Process Excel or CSV file using XLSX
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: 'array',
                    raw: false,
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON with headers
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: 'yyyy-mm-dd',
                    defval: '',
                    blankrows: false
                });

                if (!jsonData || jsonData.length === 0) {
                    alert('The uploaded file is empty or invalid.');
                    setLoading(false);
                    return;
                }

                // Debugging: Log the first row of the JSON data
                console.log('First row of imported data:', jsonData[0]);

                // Transform the data to match your pilgrim structure
                const transformedData = jsonData.map(row => ({
                    alRajhiId: row['Al Rajhi ID'] || 'N/A',
                    pilgrimCategory: row['Pilgrim Category'] || 'N/A',
                    serialNumber: row['Serial Number'] || 'N/A',
                    groupNumber: row['Group Number'] || 'N/A',
                    typeOfPilgrim: row['Type of Pilgrim'] || 'N/A',
                    gender: row['Gender'] || 'N/A',
                    passportNumber: row['Passport Number'] || 'N/A',
                    passportDateOfExpiry: row['Passport - Date of Expiry'] || 'N/A',
                    passportDateOfIssue: row['Passport - Date of Issue'] || 'N/A',
                    dateOfArrivalFlight: row['Date of Arrival Flight'] && !isNaN(Date.parse(row['Date of Arrival Flight'])) ? new Date(row['Date of Arrival Flight']).toLocaleDateString() : 'N/A',
                    departureCityFromSaudiArabia: row['Departure City from Saudi Arabia'] || 'N/A',
                    fullName: row['Full Name'] || 'N/A',
                    firstName: row['First Name'] || 'N/A',
                    lastName: row['Last Name'] || 'N/A',
                    dateOfBirth: row['Date of Birth'] || 'N/A',
                    age: row['Age'] || 'N/A',
                    email: row['Email'] || 'N/A',
                    mobileNumber: row['Mobile Number'] || 'N/A',
                    wheelChair: row['Wheel Chair'] || 'N/A',
                    visaStatus: row['Visa Status'] || 'N/A',
                    guideName: row['Guide Name'] || 'N/A',
                    countryOfResidence: row['Country of Residence'] || 'N/A',
                    nationality: row['Nationality'] || 'N/A',
                    packageNumber: row['Package Number'] || 'N/A',
                    packageType: row['Package Type'] || 'N/A',
                    packageCategory: row['Package Category'] || 'N/A',
                    marketingPartner: row['Marketing Partner'] || 'N/A',
                    packageName: row['Package Name'] || 'N/A',
                    packageStartDate: row['Package Start Date'] || 'N/A',
                    packageEndDate: row['Package End Date'] || 'N/A',
                    noOfNights: row['No of Nights'] || 'N/A',
                    flightContract: row['Flight Contract'] || 'N/A',
                    changingFlights: row['Changing Flights'] || 'N/A',
                    flightBookingNo: row['Flight Booking No.'] || 'N/A',
                    airlines: row['Airlines'] || 'N/A',
                    allowedBaggage: row['Allowed Baggage'] || 'N/A',
                    countryOfDeparture: row['Country of Departure'] || 'N/A',
                    cityOfDeparture: row['City of Departure'] || 'N/A',
                    routeForArrival: row['Route For Arrival'] || 'N/A',
                    arrivalFlightNumber: row['Arrival Flight Number'] || 'N/A',
                    timeOfArrivalFlight: row['Time of Arrival Flight'] || 'N/A',
                    cityOfArrival: row['City of Arrival'] || 'N/A',
                    arrivalTransportation: row['Arrival Transportation'] || 'N/A',
                    transportationArrivalDate: row['Transportation Arrival Date'] || 'N/A',
                    location1: row['Location 1'] || 'N/A',
                    hotel1: row['Hotel 1'] || 'N/A',
                    hotel1Rating: row['Hotel 1 Rating'] || 'N/A',
                    hotel1Services: row['Hotel 1 Services'] || 'N/A',
                    hotel1RoomType: row['Room Type 1'] || 'N/A',
                    hotel1CheckIn: row['Hotel 1 Check In'] && !isNaN(Date.parse(row['Hotel 1 Check In'])) ? new Date(row['Hotel 1 Check In']).toLocaleDateString() : 'N/A',
                    hotel1CheckOut: row['Hotel 1 Check Out'] && !isNaN(Date.parse(row['Hotel 1 Check Out'])) ? new Date(row['Hotel 1 Check Out']).toLocaleDateString() : 'N/A',
                    location2: row['Location 2'] || 'N/A',
                    hotel2: row['Hotel 2'] || 'N/A',
                    hotel2Rating: row['Hotel 2 Rating'] || 'N/A',
                    hotel2Services: row['Hotel 2 Services'] || 'N/A',
                    hotel2RoomType: row['Room Type 2'] || 'N/A',
                    hotel2CheckIn: row['Hotel 2 Check In'] && !isNaN(Date.parse(row['Hotel 2 Check In'])) ? new Date(row['Hotel 2 Check In']).toLocaleDateString() : 'N/A',
                    hotel2CheckOut: row['Hotel 2 Check Out'] && !isNaN(Date.parse(row['Hotel 2 Check Out'])) ? new Date(row['Hotel 2 Check Out']).toLocaleDateString() : 'N/A',
                    departureTransportation: row['Departure Transportation'] || 'N/A',
                    departureTransportationDate: row['Departure Transportation Date'] || 'N/A',
                    departureAirline: row['Departure Airline'] || 'N/A',
                    routeForDeparture: row['Route for Departure'] || 'N/A',
                    departureFlightNumber: row['Departure Flight Number'] || 'N/A',
                    departureDate: row['Departure Date'] || 'N/A',
                    departureTime: row['Departure Time'] || 'N/A',
                    ticketStatus: row['Ticket Status'] || 'N/A',
                    ticketNumber: row['Ticket Number'] || 'N/A',
                    ticketLink: row['Ticket Link'] || 'N/A',
                    billInvoiceNumber: row['Bill/Invoice Number'] || 'N/A',
                    bookingDetails: row['Booking Details'] || 'N/A'
                }));

                // Save to backend (MongoDB)
                const importRes = await fetch('http://localhost:5000/api/pilgrims/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pilgrims: transformedData })
                });
                if (!importRes.ok) {
                    const err = await importRes.json();
                    alert('Import failed: ' + (err.error || 'Unknown error'));
                    setLoading(false);
                    return;
                }

                // Fetch updated pilgrims from backend
                const pilgrimsResponse = await fetch('http://localhost:5000/api/pilgrims');
                if (!pilgrimsResponse.ok) {
                    alert('Failed to fetch pilgrims after import');
                    setLoading(false);
                    return;
                }
                const pilgrimsData = await pilgrimsResponse.json();
                setPilgrims(pilgrimsData);

                setShowImportModal(false);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please ensure it is a valid Excel or CSV file.');
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        multiple: false,
        noKeyboard: true,
        preventDropOnDocument: true
    });

    // Fetch pilgrims on component mount
    useEffect(() => {
        const fetchPilgrims = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/pilgrims');
                if (!response.ok) {
                    throw new Error('Failed to fetch pilgrims');
                }
                const data = await response.json();
                setPilgrims(data);
            } catch (err) {
                setError('Failed to load pilgrims data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPilgrims();
    }, []);

    const handleEdit = (pilgrim, e) => {
        e.stopPropagation(); // Prevent row click
        setSelectedPilgrim(pilgrim);
        // TODO: Implement edit functionality
    };

    const handleDelete = async (pilgrimId, e) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm('Are you sure you want to delete this pilgrim?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/pilgrims/${pilgrimId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete pilgrim');
                }

                setPilgrims(pilgrims.filter(p => p._id !== pilgrimId));
            } catch (err) {
                setError('Failed to delete pilgrim');
                console.error('Error:', err);
            }
        }
    };    // Calculate statistics
    const stats = {
        totalPilgrims: pilgrims.length,
        totalNationalities: new Set(pilgrims.map(p => p.nationality).filter(Boolean)).size,
        visaApprovalRate: Math.round((pilgrims.filter(p => p.visaStatus === 'Approved').length / pilgrims.length) * 100) || 0,
        genderDistribution: {
            male: pilgrims.filter(p => p.gender?.toLowerCase() === 'male').length,
            female: pilgrims.filter(p => p.gender?.toLowerCase() === 'female').length
        },
        packageTypes: Object.entries(
            pilgrims.reduce((acc, p) => {
                if (p.packageType) {
                    acc[p.packageType] = (acc[p.packageType] || 0) + 1;
                }
                return acc;
            }, {})
        ).sort((a, b) => b[1] - a[1]).slice(0, 5)
    };

    // Chart options and data
    const genderChartData = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [stats.genderDistribution.male, stats.genderDistribution.female],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverBackgroundColor: ['#36A2EB', '#FF6384']
        }]
    };

    const packageChartData = {
        labels: stats.packageTypes.map(([type]) => type),
        datasets: [{
            label: 'Pilgrims by Package Type',
            data: stats.packageTypes.map(([, count]) => count),
            backgroundColor: '#4BC0C0'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    return (
        <div className="p-3">
            {/* Statistics Section */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                <FaUsers className="text-primary" size={24} />
                            </div>
                            <div>
                                <h6 className="mb-0">Total Pilgrims</h6>
                                <h3 className="mb-0">{stats.totalPilgrims}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                <FaGlobeAmericas className="text-success" size={24} />
                            </div>
                            <div>
                                <h6 className="mb-0">Nationalities</h6>
                                <h3 className="mb-0">{stats.totalNationalities}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                <FaPassport className="text-warning" size={24} />
                            </div>
                            <div>
                                <h6 className="mb-0">Visa Approval Rate</h6>
                                <h3 className="mb-0">{stats.visaApprovalRate}%</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h6 className="mb-3">Gender Distribution</h6>
                            <div style={{ height: '300px' }}>
                                <Doughnut data={genderChartData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h6 className="mb-3">Top Package Types</h6>
                            <div style={{ height: '300px' }}>
                                <Bar data={packageChartData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Original Content Starts Here */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Pilgrims Information</h5>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" onClick={() => setShowImportModal(true)}>
                                <FaUpload className="me-2" /> Import
                            </Button>
                            <Button variant="outline-success" onClick={handleExport}>
                                <FaDownload className="me-2" /> Export
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex gap-2 mb-3">
                        <InputGroup>
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or passport number"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowFilterModal(true)}
                        >
                            <FaFilter className="me-2" /> Filter
                        </Button>
                    </div>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Passport Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPilgrims.map(pilgrim => (
                                <tr key={pilgrim._id} onClick={() => handleRowClick(pilgrim)} style={{ cursor: 'pointer' }}>
                                    <td>{pilgrim.fullName}</td>
                                    <td>{pilgrim.passportNumber}</td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={(e) => handleEdit(pilgrim, e)}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={(e) => handleDelete(pilgrim._id, e)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {filteredPilgrims.length === 0 && (
                        <div className="text-center py-4 text-muted">
                            No pilgrims found matching your search criteria.
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Import Modal */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Import Pilgrims Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <h6>Upload CSV File</h6>
                        <p className="text-muted small">
                            The CSV file should contain the following columns:<br/>
                            Al Rajhi ID,<br/>
                            Pilgrim Category,<br/>
                            Date of Birth,<br/>
                            Marketing Partner,<br/>
                            Serial Number,<br/>
                            Group Number,<br/>
                            Type of Pilgrim,<br/>
                            Gender,<br/>
                            Passport Number,<br/>
                            Passport - Date of Expiry,<br/>
                            Passport - Date of Issue,<br/>
                            Full Name,<br/>
                            First Name,<br/>
                            Last Name,<br/>
                            Age,<br/>
                            Email,<br/>
                            Mobile Number,<br/>
                            Wheel Chair,<br/>
                            Visa Status,<br/>
                            Guide Name,<br/>
                            Country of Residence,<br/>
                            Nationality,<br/>
                            and other required fields.<br/>
                            <strong>Use CSV file for better performance</strong>
                        </p>
                    </div>
                    <div 
                        {...getRootProps()} 
                        style={{
                            border: '2px dashed #ccc',
                            borderRadius: '4px',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: isDragActive ? '#f8f9fa' : 'white'
                        }}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="mb-0">Drop the CSV file here...</p>
                        ) : (
                            <p className="mb-0">Drag and drop a CSV file here, or click to select file</p>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" dialogClassName="modal-90w">
                <Modal.Header closeButton style={{ background: '#243b7f', color: 'white' }}>
                    <Modal.Title>
                        <div className="d-flex align-items-center">
                            <div className="me-3" style={{ fontSize: '24px' }}>{selectedPilgrim?.fullName}</div>
                            <span className="badge" style={{ 
                                background: 'rgba(255, 255, 255, 0.2)', 
                                color: '#ffffff',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(5px)'
                            }}>
                                {selectedPilgrim?.pilgrimCategory}
                            </span>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {selectedPilgrim && (
                        <div className="pilgrim-details" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
                            <div className="section-header mb-4" style={{ 
                                borderLeft: '4px solid #243b7f',
                                paddingLeft: '12px',
                                marginLeft: '-20px',
                                color: '#8B4513'
                            }}>
                                <h5 className="m-0">Personal Information</h5>
                            </div>
                            {renderDetailItem('Al Rajhi ID', selectedPilgrim.alRajhiId)}
                            {renderDetailItem('Pilgrim Category', selectedPilgrim.pilgrimCategory)}
                            {renderDetailItem('Serial Number', selectedPilgrim.serialNumber)}
                            {renderDetailItem('Group Number', selectedPilgrim.groupNumber)}
                            {renderDetailItem('Type of Pilgrim', selectedPilgrim.typeOfPilgrim)}
                            {renderDetailItem('Gender', selectedPilgrim.gender)}
                            
                            <h5 className="mt-4 mb-4">Passport Details</h5>
                            {renderDetailItem('Passport Number', selectedPilgrim.passportNumber)}
                            {renderDetailItem('Passport - Date of Expiry', selectedPilgrim.passportDateOfExpiry)}
                            {renderDetailItem('Passport - Date of Issue', selectedPilgrim.passportDateOfIssue)}
                            
                            <h5 className="mt-4 mb-4">Personal Details</h5>
                            {renderDetailItem('Full Name', selectedPilgrim.fullName)}
                            {renderDetailItem('First Name', selectedPilgrim.firstName)}
                            {renderDetailItem('Last Name', selectedPilgrim.lastName)}
                            {renderDetailItem('Date of Birth', selectedPilgrim.dateOfBirth)}
                            {renderDetailItem('Age', selectedPilgrim.age)}
                            {renderDetailItem('Email', selectedPilgrim.email)}
                            {renderDetailItem('Mobile Number', selectedPilgrim.mobileNumber)}
                            {renderDetailItem('Wheel Chair', selectedPilgrim.wheelChair)}
                            {renderDetailItem('Visa Status', selectedPilgrim.visaStatus)}
                            {renderDetailItem('Guide Name', selectedPilgrim.guideName)}
                            {renderDetailItem('Country of Residence', selectedPilgrim.countryOfResidence)}
                            {renderDetailItem('Nationality', selectedPilgrim.nationality)}
                            
                            <h5 className="mt-4 mb-4">Package Information</h5>
                            {renderDetailItem('Package Number', selectedPilgrim.packageNumber)}
                            {renderDetailItem('Package Type', selectedPilgrim.packageType)}
                            {renderDetailItem('Package Category', selectedPilgrim.packageCategory)}
                            {renderDetailItem('Marketing Partner', selectedPilgrim.marketingPartner)}
                            {renderDetailItem('Package Name', selectedPilgrim.packageName)}
                            {renderDetailItem('Package Start Date', selectedPilgrim.packageStartDate)}
                            {renderDetailItem('Package End Date', selectedPilgrim.packageEndDate)}
                            {renderDetailItem('No of Nights', selectedPilgrim.noOfNights)}
                            
                            <h5 className="mt-4 mb-4">Flight Information</h5>
                            {renderDetailItem('Flight Contract', selectedPilgrim.flightContract)}
                            {renderDetailItem('Changing Flights', selectedPilgrim.changingFlights)}
                            {renderDetailItem('Flight Booking No.', selectedPilgrim.flightBookingNo)}
                            {renderDetailItem('Airlines', selectedPilgrim.airlines)}
                            {renderDetailItem('Allowed Baggage', selectedPilgrim.allowedBaggage)}
                            {renderDetailItem('Country of Departure', selectedPilgrim.countryOfDeparture)}
                            {renderDetailItem('City of Departure', selectedPilgrim.cityOfDeparture)}
                            {renderDetailItem('Route For Arrival', selectedPilgrim.routeForArrival)}
                            {renderDetailItem('Arrival Flight Number', selectedPilgrim.arrivalFlightNumber)}
                            {renderDetailItem('Date of Arrival Flight', selectedPilgrim.dateOfArrivalFlight)}
                            {renderDetailItem('Time of Arrival Flight', selectedPilgrim.timeOfArrivalFlight)}
                            {renderDetailItem('City of Arrival', selectedPilgrim.cityOfArrival)}
                            
                            <h5 className="mt-4 mb-4">Transportation</h5>
                            {renderDetailItem('Arrival Transportation', selectedPilgrim.arrivalTransportation)}
                            {renderDetailItem('Transportation Arrival Date', selectedPilgrim.transportationArrivalDate)}
                            
                            <h5 className="mt-4 mb-4">Accommodation</h5>
                            <h6>Location 1</h6>
                            {renderDetailItem('Location', selectedPilgrim?.location1)}
                            {renderDetailItem('Hotel', selectedPilgrim?.hotel1)}
                            {renderDetailItem('Hotel Rating', selectedPilgrim?.hotel1Rating)}
                            {renderDetailItem('Hotel Services', Array.isArray(selectedPilgrim?.hotel1Services) 
                                ? selectedPilgrim.hotel1Services.join(', ')
                                : selectedPilgrim?.hotel1Services)}
                            {renderDetailItem('Room Type', selectedPilgrim?.hotel1RoomType)}
                            {renderDetailItem('Check In', selectedPilgrim?.hotel1CheckIn)}
                            {renderDetailItem('Check Out', selectedPilgrim?.hotel1CheckOut)}
                            
                            <h6 className="mt-3">Location 2</h6>
                            {renderDetailItem('Location', selectedPilgrim?.location2)}
                            {renderDetailItem('Hotel', selectedPilgrim?.hotel2)}
                            {renderDetailItem('Hotel Rating', selectedPilgrim?.hotel2Rating)}
                            {renderDetailItem('Hotel Services', Array.isArray(selectedPilgrim?.hotel2Services) 
                                ? selectedPilgrim.hotel2Services.join(', ')
                                : selectedPilgrim?.hotel2Services)}
                            {renderDetailItem('Room Type', selectedPilgrim?.hotel2RoomType)}
                            {renderDetailItem('Check In', selectedPilgrim?.hotel2CheckIn)}
                            {renderDetailItem('Check Out', selectedPilgrim?.hotel2CheckOut)}
                            
                            <h6 className="mt-3">Location 3</h6>
                            {renderDetailItem('Location', selectedPilgrim?.location3)}
                            {renderDetailItem('Hotel', selectedPilgrim?.hotel3)}
                            {renderDetailItem('Hotel Rating', selectedPilgrim?.hotel3Rating)}
                            {renderDetailItem('Room Type', selectedPilgrim?.roomType3)}
                            {renderDetailItem('Check In', selectedPilgrim?.hotel3CheckIn)}
                            {renderDetailItem('Check Out', selectedPilgrim?.hotel3CheckOut)}
                            
                            <h5 className="mt-4 mb-4">Departure Information</h5>
                            {renderDetailItem('Departure Transportation', selectedPilgrim.departureTransportation)}
                            {renderDetailItem('Departure Transportation Date', selectedPilgrim.departureTransportationDate)}
                            {renderDetailItem('Departure Airline', selectedPilgrim.departureAirline)}
                            {renderDetailItem('Departure City from Saudi Arabia', selectedPilgrim.departureCityFromSaudiArabia)}
                            {renderDetailItem('Route for Departure', selectedPilgrim.routeForDeparture)}
                            {renderDetailItem('Departure Flight Number', selectedPilgrim.departureFlightNumber)}
                            {renderDetailItem('Departure Date', selectedPilgrim.departureDate)}
                            {renderDetailItem('Departure Time', selectedPilgrim.departureTime)}
                            
                            <h5 className="mt-4 mb-4">Booking Details</h5>
                            {renderDetailItem('Ticket Status', selectedPilgrim.ticketStatus)}
                            {renderDetailItem('Ticket Number', selectedPilgrim.ticketNumber)}
                            {renderDetailItem('Ticket Link', selectedPilgrim.ticketLink)}
                            {renderDetailItem('Bill/Invoice Number', selectedPilgrim.billInvoiceNumber)}
                            {renderDetailItem('Booking Details', selectedPilgrim.bookingDetails)}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Filter Modal */}
            <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Filter Pilgrims</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Pilgrim Category</Form.Label>
                            <Form.Select 
                                value={filters.pilgrimCategory}
                                onChange={(e) => handleFilterChange('pilgrimCategory', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {getUniqueValues('pilgrimCategory').map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select 
                                value={filters.gender}
                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                            >
                                <option value="">All Genders</option>
                                {getUniqueValues('gender').map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nationality</Form.Label>
                            <Form.Select 
                                value={filters.nationality}
                                onChange={(e) => handleFilterChange('nationality', e.target.value)}
                            >
                                <option value="">All Nationalities</option>
                                {getUniqueValues('nationality').map(nationality => (
                                    <option key={nationality} value={nationality}>{nationality}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Package Type</Form.Label>
                            <Form.Select 
                                value={filters.packageType}
                                onChange={(e) => handleFilterChange('packageType', e.target.value)}
                            >
                                <option value="">All Package Types</option>
                                {getUniqueValues('packageType').map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Visa Status</Form.Label>
                            <Form.Select 
                                value={filters.visaStatus}
                                onChange={(e) => handleFilterChange('visaStatus', e.target.value)}
                            >
                                <option value="">All Visa Statuses</option>
                                {getUniqueValues('visaStatus').map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Wheel Chair Required</Form.Label>
                            <Form.Select 
                                value={filters.wheelChair}
                                onChange={(e) => handleFilterChange('wheelChair', e.target.value)}
                            >
                                <option value="">All</option>
                                {getUniqueValues('wheelChair').map(value => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleResetFilters}>
                        Reset Filters
                    </Button>
                    <Button variant="primary" onClick={() => setShowFilterModal(false)}>
                        Apply Filters
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PilgrimsInformation;