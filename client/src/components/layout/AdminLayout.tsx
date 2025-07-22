import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <h1>Admin Layout</h1>
      <p>Admin panel components will be implemented here.</p>
      <Outlet />
    </div>
  );
};

export default AdminLayout;