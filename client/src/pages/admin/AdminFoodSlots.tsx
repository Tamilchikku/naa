import React from 'react';
import { Container } from 'react-bootstrap';

const AdminFoodSlots: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>Manage Food Slots</h1>
      <p>Create and manage time-based food donation slots with menu planning.</p>
    </Container>
  );
};

export default AdminFoodSlots;