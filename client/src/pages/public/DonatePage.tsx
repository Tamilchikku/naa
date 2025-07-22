import React from 'react';
import { Container } from 'react-bootstrap';

const DonatePage: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>Make a Donation</h1>
      <p>This page will allow users to donate to charities without requiring login.</p>
    </Container>
  );
};

export default DonatePage;