import React from 'react';
import { Container } from 'react-bootstrap';

const AdminCharities: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>Manage Charities</h1>
      <p>Admin interface to create, update, and manage the 10 charity organizations.</p>
    </Container>
  );
};

export default AdminCharities;