import React from 'react';
import { Container } from 'react-bootstrap';

const AdminNotifications: React.FC = () => {
  return (
    <Container className="py-5">
      <h1>Manage Notifications</h1>
      <p>Send notifications to all 10 charities and manage notification history.</p>
    </Container>
  );
};

export default AdminNotifications;