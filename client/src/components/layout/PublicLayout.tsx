import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const PublicLayout: React.FC = () => {
  return (
    <>
      {/* Navigation */}
      <Navbar expand="lg" className="navbar-dark" sticky="top">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <i className="fas fa-heart me-2"></i>
              CharityConnect
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/">
                <Nav.Link>
                  <i className="fas fa-home me-1"></i>
                  Home
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/charities">
                <Nav.Link>
                  <i className="fas fa-hands-helping me-1"></i>
                  Charities
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/food-slots">
                <Nav.Link>
                  <i className="fas fa-utensils me-1"></i>
                  Food Slots
                </Nav.Link>
              </LinkContainer>
            </Nav>
            
            <Nav>
              <LinkContainer to="/donate">
                <Nav.Link className="btn btn-warning text-dark rounded me-2">
                  <i className="fas fa-heart me-1"></i>
                  Donate Now
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/admin/login">
                <Nav.Link>
                  <i className="fas fa-user-shield me-1"></i>
                  Admin
                </Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-6">
              <h5>
                <i className="fas fa-heart me-2"></i>
                CharityConnect
              </h5>
              <p className="text-muted">
                Connecting generous hearts with meaningful causes. 
                Together, we can make a difference in the world.
              </p>
              <div className="social-links">
                <a href="#" className="text-light me-3">
                  <i className="fab fa-facebook fa-lg"></i>
                </a>
                <a href="#" className="text-light me-3">
                  <i className="fab fa-twitter fa-lg"></i>
                </a>
                <a href="#" className="text-light me-3">
                  <i className="fab fa-instagram fa-lg"></i>
                </a>
                <a href="#" className="text-light">
                  <i className="fab fa-linkedin fa-lg"></i>
                </a>
              </div>
            </div>
            <div className="col-md-3">
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li>
                  <LinkContainer to="/charities">
                    <a className="text-muted">Browse Charities</a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to="/donate">
                    <a className="text-muted">Make a Donation</a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to="/food-slots">
                    <a className="text-muted">Food Slots</a>
                  </LinkContainer>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6>Categories</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="text-muted">Education</a></li>
                <li><a href="#" className="text-muted">Healthcare</a></li>
                <li><a href="#" className="text-muted">Environment</a></li>
                <li><a href="#" className="text-muted">Food & Hunger</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-4" />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-muted mb-0">
                &copy; 2024 CharityConnect. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-muted mb-0">
                Built with ❤️ using MERN Stack
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default PublicLayout;