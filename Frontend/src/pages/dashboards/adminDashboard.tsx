// AdminDashboard.tsx
import React, { useState } from 'react';
import type{ AdminStat, User } from '../../types/admin';
import AdminStatCard from '../../components/admin/statsCard';
import UserTableRow from '../../components/admin/userTableRow';
import Footer from "../../components/home/footer";
import '../../styles/admin.css'

// --- Data Mocking ---
const statsData: AdminStat[] = [
  { id: 1, mainValue: '2,847', mainLabel: 'Total Users', primaryDetail: '+12% this month', secondaryDetail: '1,523 donors • 1,324 beneficiaries', iconClass: 'fas fa-users', iconBgColor: 'user-card', primaryDetailColor: 'success' },
  { id: 2, mainValue: '456', mainLabel: 'Active Donations', primaryDetail: '+8% this week', secondaryDetail: '342 matched • 114 pending', iconClass: 'fas fa-box-open', iconBgColor: 'donation-card', primaryDetailColor: 'success' },
  { id: 3, mainValue: '12', mainLabel: 'Flagged Items', primaryDetail: 'Needs review', secondaryDetail: '8 donations • 4 users', iconClass: 'fas fa-exclamation-triangle', iconBgColor: 'flagged-card', primaryDetailColor: 'danger' },
  { id: 4, mainValue: '94.5%', mainLabel: 'Success Rate', primaryDetail: '+2.3% vs last month', secondaryDetail: '1,234 completed matches', iconClass: 'fas fa-chart-line', iconBgColor: 'success-card', primaryDetailColor: 'primary' },
];

const usersData: User[] = [
  { id: 101, name: 'Emily Rodriguez', email: 'emily.r@email.com', isVerified: true, role: 'Donor', status: 'Active', activityMain: '15 donations', activitySub: '4.9 rating', joinedDate: '8/15/2023' },
  { id: 102, name: 'Michael Chen', email: 'michael.c@email.com', isVerified: true, role: 'Beneficiary', status: 'Active', activityMain: '8 requests', activitySub: '6 received', joinedDate: '9/22/2023' },
  // Add more user data as needed...
];
// --- End Data Mocking ---

const AdminDashboard: React.FC = () => {
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);

  const handleViewProfile = (id: number) => {
    // In a real app, this would route to the user profile page
    console.log(`Navigating to profile for User ID: ${id}`);
    alert(`Viewing profile for User ID: ${id}`);
  };

  const handleSuspendUserRequest = (id: number) => {
    const user = usersData.find(u => u.id === id);
    if (user) {
      setUserToSuspend(user);
      setSuspendModalOpen(true);
    }
  };

  const confirmSuspendUser = () => {
    if (userToSuspend) {
      console.log(`Confirmed suspension for User ID: ${userToSuspend.id}`);
      // In a real app, you would call an API to update the user's status here
    }
    setSuspendModalOpen(false);
    setUserToSuspend(null);
  };

  // Placeholder for the confirmation modal
  const SuspendConfirmationModal: React.FC = () => (
    <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div className="modal-content" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '400px', textAlign: 'center' }}>
        <h3>Confirm Suspension</h3>
        <p>Are you sure you want to suspend user **{userToSuspend?.name}**?</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={() => setSuspendModalOpen(false)} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '6px', background: 'white' }}>Cancel</button>
          <button onClick={confirmSuspendUser} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: 'var(--needs-review-color)', color: 'white' }}>Suspend</button>
        </div>
      </div>
    </div>
  );


  return (
    <>
      <div className="admin-dashboard-container">
        {/* Admin Dashboard Header */}
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, content, and platform analytics</p>
        </header>

        {/* Metrics Cards Section */}
        <section className="metrics-cards">
          {statsData.map(stat => (
            <AdminStatCard key={stat.id} stat={stat} />
          ))}
        </section>
        
        {/* User Management Table Section */}
        <section className="user-management-panel">
          {/* Tabs and Controls Bar components would typically be extracted */}
          <div className="tabs">
            <div className="tab active-tab">User Management</div>
            <div className="tab">Flagged Content</div>
            <div className="tab">Impact Reports</div>
          </div>

          <div className="controls-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search users by name or email..."/>
            </div>
            <div className="dropdown">All Roles <i className="fas fa-chevron-down"></i></div>
            <div className="dropdown">All Status <i className="fas fa-chevron-down"></i></div>
          </div>

          <div className="user-table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map(user => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onViewProfile={handleViewProfile}
                    onSuspendUser={handleSuspendUserRequest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

     
      <Footer /> 

      {/* Modal is rendered at the top level */}
      {suspendModalOpen && <SuspendConfirmationModal />}
    </>
  );
};

export default AdminDashboard;