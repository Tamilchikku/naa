import React from 'react';
import { Container } from 'react-bootstrap';

const CharitiesPage: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>All Charities</h1>
      <p>This page will display all charities with filtering and search functionality.</p>
    </Container>
  );
};

export default CharitiesPage;