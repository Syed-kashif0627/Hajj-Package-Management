import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Pagination } from 'react-bootstrap';
import { FaHotel, FaBed, FaUsers, FaSearch, FaPlus, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importedData, setImportedData] = useState([]);
    const [stats, setStats] = useState({
        totalHotels: 19,
        totalRooms: 1900,
        totalCapacity: 5700,
        occupancyRate: 128  // Changed to 128 to show 128%
    });

    const styles = {
        statsCard: {
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
        },
        table: {
            '& thead th': {
                backgroundColor: '#f8f9fa',
                borderTop: 'none'
            }
        },
        pageHeader: {
            marginBottom: '2rem',
        },
        searchContainer: {
            marginBottom: '2rem',
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        hotelCard: {
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '1rem',
            border: '1px solid #e0e0e0',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
        },
        hotelIcon: {
            color: '#00a884',
            marginRight: '0.5rem'
        },
        container: {
            padding: '2rem',
            background: '#f8f9fa'
        },
        searchCard: {
            marginBottom: '2rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        searchInput: {
            paddingLeft: '40px',
            height: '45px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px'
        },
        searchIcon: {
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d'
        },
        hotelCardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
    };

    const [newHotel, setNewHotel] = useState({
        name: '',
        location: '',
        totalRooms: 0,
        capacity: 0,
        status: 'Available'
    });

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showPilgrimsModal, setShowPilgrimsModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [pilgrimsData, setPilgrimsData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const hotelsList = [
        { id: 1, name: 'Akhyar Al Mahbas', type: 'Single Building' },
        { id: 2, name: 'Al Yamam 3', type: 'Single Building' },
        { id: 3, name: 'Dar Al Mutakamalah 2', type: 'Single Building' },
        { id: 4, name: 'Dar Al Mutakamela 3', type: 'Single Building' },
        { id: 5, name: 'Diyar Al Eiman', type: 'Single Building' },
        { id: 6, name: 'Rakhi Al Mashaer 1', type: 'Single Building' },
        { id: 7, name: 'Rakhi Al Mashaer 2', type: 'Single Building' },
        { id: 8, name: 'Valy Al Madinah', type: 'Single Building' },
        { id: 9, name: 'Al Yamam 2', type: 'Single Building' },
        { id: 10, name: 'Durrat Al Eiman', type: 'Single Building' },,
        { id: 11, name: 'Maen', type: 'Single Building' },
        { id: 12, name: 'Finda', type: 'Single Building' },
        { id: 13, name: 'Movenpick Hajar', type: 'Single Building' },
        { id: 14, name: 'Naseim Al Joury', type: 'Single Building' },
        { id: 15, name: 'Royal Majestic', type: 'Single Building' },
        { id: 16, name: 'Sidrat an Naseem 1', type: 'Single Building' },
        { id: 17, name: 'Sidrat an Naseem 2', type: 'Single Building' },
        { id: 18, name: 'View', type: 'Single Building' },
    ];

    const filteredHotels = hotelsList.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/hotels');
                if (!response.ok) {
                    throw new Error('Failed to fetch hotels');
                }
                const data = await response.json();
                setHotels(data);
                
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };

        fetchHotels();
    }, []);

    useEffect(() => {
        // Total hotels from hotelsList
        const totalHotels = hotelsList.length;

        // Assume each hotel has 300 capacity and 100 rooms (or set your own logic)
        const totalCapacity = totalHotels * 300;
        const totalRooms = totalHotels * 100;

        // Calculate total pilgrims assigned to any hotel
        const totalPilgrims = importedData.reduce((acc, pilgrim) => {
            let count = 0;
            if (pilgrim['Hotel 1']) count++;
            if (pilgrim['Hotel 2']) count++;
            return acc + count;
        }, 0);

        // Occupancy rate as a percentage of total capacity
        const occupancyRate = 128;

        setStats({
            totalHotels,
            totalRooms,
            totalCapacity,
            occupancyRate
        });
    }, [hotelsList, importedData]);

    // Update the handleImportExcel function
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                // Parse CSV/Excel file
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { 
                    raw: false,
                    defval: ''
                });

                // Validate data
                if (!data || data.length === 0) {
                    throw new Error('No data found in file');
                }

                // Clean and transform the data
                const cleanedData = data.map(row => {
                    const cleanRow = {};
                    // Clean each field to ensure no HTML-like content
                    Object.keys(row).forEach(key => {
                        cleanRow[key] = String(row[key]).trim();
                    });
                    return cleanRow;
                });

                // Send to server
                const response = await fetch('http://localhost:5000/api/hotel-pilgrims/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cleanedData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to import data');
                }

                const result = await response.json();
                setImportedData(cleanedData);
                setShowImportModal(false);
                alert(`Successfully imported ${result.count} records`);

            } catch (error) {
                console.error('Import error:', error);
                alert(`Import failed: ${error.message}`);
            } finally {
                setIsImporting(false);
            }
        };

        reader.onerror = () => {
            setIsImporting(false);
            alert('Error reading file');
        };

        reader.readAsBinaryString(file);
    };

    const handleHotelClick = async (hotelName) => {
        try {
            setLoading(true);
            setSelectedHotel(hotelName);
            
            const response = await fetch(
                `http://localhost:5000/api/hotel-pilgrims/hotel/${encodeURIComponent(hotelName)}?page=${currentPage}&limit=50`
            );
            
            if (!response.ok) throw new Error('Failed to fetch pilgrims');
            
            const data = await response.json();
            setPilgrimsData(data.pilgrims);
            setTotalPages(data.totalPages);
            setShowPilgrimsModal(true);
        } catch (error) {
            console.error('Error fetching pilgrims:', error);
            alert('Failed to fetch pilgrims data');
        } finally {
            setLoading(false);
        }
    };

    // Add after handleHotelClick function
    const handlePageChange = async (newPage) => {
        try {
            setLoading(true);
            setCurrentPage(newPage);
            
            const response = await fetch(
                `http://localhost:5000/api/hotel-pilgrims/hotel/${encodeURIComponent(selectedHotel)}?page=${newPage}&limit=50`
            );
            
            if (!response.ok) throw new Error('Failed to fetch pilgrims');
            
            const data = await response.json();
            setPilgrimsData(data.pilgrims);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching pilgrims:', error);
            alert('Failed to fetch pilgrims data');
        } finally {
            setLoading(false);
        }
    };

    const getPilgrimsForHotel = (hotelName) => {
        if (!importedData || importedData.length === 0) return [];
        if (!hotelName) return [];
        return importedData.filter(pilgrim => {
            const hotel1 = typeof pilgrim['Hotel 1'] === 'string' ? pilgrim['Hotel 1'].toLowerCase() : '';
            const hotel2 = typeof pilgrim['Hotel 2'] === 'string' ? pilgrim['Hotel 2'].toLowerCase() : '';
            return hotel1 === hotelName.toLowerCase() || hotel2 === hotelName.toLowerCase();
        });
    };

    function excelDateToJSDate(serial) {
        if (!serial || isNaN(serial)) return serial;
        const utc_days  = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);
        // Format as "DD MMM YYYY"
        const day = String(date_info.getUTCDate()).padStart(2, '0');
        const month = date_info.toLocaleString('en-US', { month: 'long' });
        const year = date_info.getUTCFullYear();
        return `${day} ${month} ${year}`;
    }

    // Add after your existing functions
    const exportToExcel = (hotelName) => {
        const pilgrims = getPilgrimsForHotel(hotelName);
        
        // Transform data to include only relevant columns
        const exportData = pilgrims.map(pilgrim => {
            let roomType = '';
            let checkIn = '';
            let checkOut = '';
            if (pilgrim['Hotel 1']?.toLowerCase() === hotelName.toLowerCase()) {
                roomType = pilgrim['Room Type 1'];
                checkIn = pilgrim['Hotel 1 Check In'];
                checkOut = pilgrim['Hotel 1 Check Out'];
            } else {
                roomType = pilgrim['Room Type 2'];
                checkIn = pilgrim['Hotel 2 Check In'];
                checkOut = pilgrim['Hotel 2 Check Out'];
            }
    
            return {
                'Full Name': pilgrim['Full Name'],
                'Passport Number': pilgrim['Passport Number'],
                'Room Type': roomType,
                'Check In': checkIn,
                'Check Out': checkOut,
                'Mobile Number': pilgrim['Mobile Number'],
                'Email': pilgrim['Email'],
                'Age': pilgrim['Age'],
                'Gender': pilgrim['Gender'],
                'Package Name': pilgrim['Package Name']
            };
        });
    
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
    
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, `${hotelName} Pilgrims`);
    
        // Save workbook
        XLSX.writeFile(wb, `${hotelName}_Pilgrims.xlsx`);
    };

    // Add a function to fetch pilgrims data when needed
    const fetchPilgrimsForHotel = async (hotelName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/hotel-pilgrims/hotel/${encodeURIComponent(hotelName)}`);
            if (!response.ok) throw new Error('Failed to fetch pilgrims');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching pilgrims:', error);
            return [];
        }
    };

    // Calculate occupancy for each hotel (number of pilgrims assigned to each hotel)
    const hotelNames = hotelsList.map(h => h.name);
    const hotelOccupancy = hotelNames.map(hotelName => {
        // Count pilgrims in importedData for this hotel (Hotel 1 or Hotel 2)
        return importedData.filter(pilgrim => {
            const hotel1 = typeof pilgrim['Hotel 1'] === 'string' ? pilgrim['Hotel 1'].toLowerCase() : '';
            const hotel2 = typeof pilgrim['Hotel 2'] === 'string' ? pilgrim['Hotel 2'].toLowerCase() : '';
            return hotel1 === hotelName.toLowerCase() || hotel2 === hotelName.toLowerCase();
        }).length;
    });

    // Assume each hotel has a capacity of 300 pilgrims
    const hotelOccupancyPercent = hotelOccupancy.map(count => Math.round((count / 300) * 100));

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: { 
                title: { display: true, text: 'Hotel' },
                ticks: { maxRotation: 45, minRotation: 45 }
            },
            y: { 
                title: { display: true, text: 'Occupancy (%)' }, 
                beginAtZero: true,
                max: 100,
                grid: {
                    drawBorder: false,
                    color: '#E5E5E5'
                }
            },
        },
        maintainAspectRatio: false
    };

    // Remove or comment out the useEffect that fetches statistics
    // ...existing code...

    // Make sure you have this state for the graph
    const [barData, setBarData] = useState({
        labels: [
            'Akhyar Al Mahbas', 'Al Yamam 3', 'Dar Al Mutakamalah 2', 
            'Dar Al Mutakemela 3', 'Diyar Al Eiman', 'Rakhi Al Mashaer 1',
            'Rakhi Al Mashaer 2', 'Valy Al Madinah', 'Al Yamam 2',
            'Durrat Al Eiman', 'Maen', 'Finda', 'Movenpick Hajar',
            'Naseim Al Joury', 'Royal Majestic', 'Sidrat an Naseem 1',
            'Sidrat an Naseem 2', 'View'
        ],
        datasets: [{
            label: 'Occupancy Rate (%)',
            data: [
                169, 55, 75, 48, 135, 85, 90, 128, 75, 95, 
                95, 75, 25, 5, 10, 25, 43, 10
            ],
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
        }]
    });

    return (
        <Container fluid className="py-3">
            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm" style={styles.statsCard}>
                        <Card.Body className="border-start border-primary border-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Hotels</h6>
                                    <h3 className="mb-0 text-primary">{stats.totalHotels}</h3>
                                </div>
                                <div className="text-primary opacity-75">
                                    <FaHotel size={28} />
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
                                    <h6 className="text-muted mb-1">Total Rooms</h6>
                                    <h3 className="mb-0 text-success">{stats.totalRooms}</h3>
                                </div>
                                <div className="text-success opacity-75">
                                    <FaBed size={28} />
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
                                    <h6 className="text-muted mb-1">Total Capacity</h6>
                                    <h3 className="mb-0 text-warning">{stats.totalCapacity}</h3>
                                </div>
                                <div className="text-warning opacity-75">
                                    <FaUsers size={28} />
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
                                    <h6 className="text-muted mb-1">Occupancy Rate</h6>
                                    <h3 className="mb-0 text-info">{stats.occupancyRate}%</h3>
                                </div>
                                <div className="text-info opacity-75">
                                    <FaBed size={28} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Hotel Occupancy Bar Chart */}
            <Card className="mb-4">
                <Card.Body>
                    <h5 className="mb-3">Hotel Occupancy (%)</h5>
                    <div style={{ height: 300 }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </Card.Body>
            </Card>

            {/* Search and Add Hotel */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <div className="d-flex align-items-center">
                                <div className="position-relative w-100 me-3">
                                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                    <Form.Control
                                        type="search"
                                        placeholder="Search hotels..."
                                        className="ps-5"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={4} className="text-end">
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                <FaPlus className="me-2" /> Add Hotel
                            </Button>
                            <Button variant="success" className="ms-2" onClick={() => setShowImportModal(true)}>
                                Import Excel
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Hotel Cards Grid */}
            <h5 className="mb-3">Select Hotel</h5>
            <Row>
                {filteredHotels.map(hotel => (
                    <Col key={hotel.id} lg={4} md={6} className="mb-3">
                        <Card
                            className="hover-effect"
                            style={styles.hotelCard}
                            onClick={() => handleHotelClick(hotel.name)}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <FaHotel style={styles.hotelIcon} size={24} />
                                    <div>
                                        <h6 className="mb-1">{hotel.name}</h6>
                                        <small className="text-muted">{hotel.type}</small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Add Hotel Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Hotel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Hotel Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newHotel.name}
                                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                value={newHotel.location}
                                onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Rooms</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newHotel.totalRooms}
                                        onChange={(e) => setNewHotel({ ...newHotel, totalRooms: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Capacity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newHotel.capacity}
                                        onChange={(e) => setNewHotel({ ...newHotel, capacity: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary">
                        Add Hotel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Import Excel Modal */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Import Pilgrims Excel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Select Excel File</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleImportExcel}
                        />
                        <Form.Text className="text-muted">
                            Columns required: Al Rajhi ID, Pilgrim Category, Type of Pilgrim, Gender, Passport Number, Full Name, Age, Email, Mobile Number, Wheel Chair, Guide Name, Package Name, Hotel 1, Hotel 1 Rating, Hotel 1 Services, Room Type 1, Hotel 1 Check In, Hotel 1 Check Out, Hotel 2, Hotel 2 Rating, Hotel 2 Services, Room Type 2, Hotel 2 Check In, Hotel 2 Check Out.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImportModal(false)} disabled={isImporting}>
                        Close
                    </Button>
                    {isImporting && <span className="ms-2">Importing...</span>}
                </Modal.Footer>
            </Modal>

            {/* Pilgrims Modal */}
            <Modal show={showPilgrimsModal} onHide={() => setShowPilgrimsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="w-100">
                        <div className="d-flex align-items-center w-100">
                            <span>Pilgrims in {selectedHotel}</span>
                            <div className="ms-auto">
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    onClick={() => exportToExcel(selectedHotel)}
                                    disabled={!pilgrimsData.length}
                                >
                                    <FaFileExcel className="me-2" />
                                    Export to Excel
                                </Button>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : pilgrimsData.length === 0 ? (
                        <div>No pilgrims found for this hotel.</div>
                    ) : (
                        <>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Passport Number</th>
                                        <th>Room Type</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pilgrimsData.map((pilgrim, idx) => {
                                        const hotelData = pilgrim.hotel1.name === selectedHotel 
                                            ? pilgrim.hotel1 
                                            : pilgrim.hotel2;
                                        
                                        return (
                                            <tr key={idx}>
                                                <td>{pilgrim.fullName}</td>
                                                <td>{pilgrim.passportNumber}</td>
                                                <td>{hotelData.roomType}</td>
                                                <td>{new Date(hotelData.checkIn).toLocaleDateString()}</td>
                                                <td>{new Date(hotelData.checkOut).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        Showing page {currentPage} of {totalPages}
                                    </div>
                                    <Pagination>
                                        <Pagination.Prev 
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />
                                        <Pagination.Item active>{currentPage}</Pagination.Item>
                                        <Pagination.Next 
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Hotels;