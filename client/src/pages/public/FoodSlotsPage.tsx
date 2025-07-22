import React from 'react';
import { Container } from 'react-bootstrap';

const FoodSlotsPage: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>Food Slots</h1>
      <p>This page will display available food donation time slots with booking functionality.</p>
    </Container>
  );
};

export default FoodSlotsPage;