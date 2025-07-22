import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../../config/api';
import { Charity } from '../../types';

const HomePage: React.FC = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await api.get(`${endpoints.charities.list}?limit=6`);
        if (response.data.success) {
          setCharities(response.data.charities);
        }
      } catch (error) {
        console.error('Error fetching charities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = (raised: number, target: number) => {
    return target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Make a Difference Today
              </h1>
              <p className="lead mb-4">
                Join our community of donors and help charities around the world. 
                Every contribution matters, no matter how small.
              </p>
              <div className="d-flex gap-3">
                <Button 
                  as={Link} 
                  to="/donate" 
                  size="lg" 
                  className="btn-primary"
                >
                  <i className="fas fa-heart me-2"></i>
                  Donate Now
                </Button>
                <Button 
                  as={Link} 
                  to="/charities" 
                  variant="outline-light" 
                  size="lg"
                >
                  <i className="fas fa-search me-2"></i>
                  Browse Charities
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-stats">
                <Row>
                  <Col md={4}>
                    <div className="stat-item">
                      <h3 className="display-6 fw-bold">10+</h3>
                      <p>Active Charities</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <h3 className="display-6 fw-bold">$1M+</h3>
                      <p>Raised So Far</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <h3 className="display-6 fw-bold">1000+</h3>
                      <p>Happy Donors</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Charities Section */}
      <Container className="my-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">Featured Charities</h2>
          <p className="lead text-muted">
            Discover amazing organizations making a real impact in communities worldwide
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row>
            {charities.map((charity) => (
              <Col md={6} lg={4} key={charity._id} className="mb-4">
                <Card className="charity-card h-100">
                  {charity.logo && (
                    <Card.Img
                      variant="top"
                      src={charity.logo}
                      alt={charity.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <Badge bg="primary" className="mb-2">
                        {charity.category}
                      </Badge>
                      <Card.Title className="h5">{charity.name}</Card.Title>
                      <Card.Text className="text-muted">
                        {charity.description.length > 100
                          ? `${charity.description.substring(0, 100)}...`
                          : charity.description
                        }
                      </Card.Text>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">
                          Raised: {formatCurrency(charity.raisedAmount)}
                        </small>
                        <small className="text-muted">
                          Goal: {formatCurrency(charity.targetAmount)}
                        </small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${calculateProgress(charity.raisedAmount, charity.targetAmount)}%`
                          }}
                          aria-valuenow={calculateProgress(charity.raisedAmount, charity.targetAmount)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {calculateProgress(charity.raisedAmount, charity.targetAmount).toFixed(1)}% Complete
                      </small>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/donate/${charity._id}`}
                        variant="primary"
                        size="sm"
                        className="flex-fill"
                      >
                        <i className="fas fa-heart me-1"></i>
                        Donate
                      </Button>
                      <Button
                        as={Link}
                        to={`/charities/${charity._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        <i className="fas fa-info-circle me-1"></i>
                        Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="text-center mt-4">
          <Button 
            as={Link} 
            to="/charities" 
            variant="outline-primary" 
            size="lg"
          >
            View All Charities
          </Button>
        </div>
      </Container>

      {/* Call to Action Section */}
      <section className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h3 className="h2 mb-3">Ready to Make a Difference?</h3>
              <p className="lead mb-0">
                Join thousands of donors who are already making an impact. 
                Every donation, big or small, helps create positive change.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button 
                as={Link} 
                to="/donate" 
                variant="primary" 
                size="lg"
                className="me-3"
              >
                <i className="fas fa-heart me-2"></i>
                Donate Now
              </Button>
              <Button 
                as={Link} 
                to="/food-slots" 
                variant="success" 
                size="lg"
              >
                <i className="fas fa-utensils me-2"></i>
                Food Slots
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default HomePage;