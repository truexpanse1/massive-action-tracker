import React, { useState } from 'react';
import AddUserModal from '../../components/AddUserModal'; // adjust path if needed

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface TeamControlPageProps {
  users: User[];
  onViewUserTrends: (userId: string) => void;
}

const TeamControlPage: React.FC<TeamControlPageProps> = ({ users, onViewUserTrends }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditUser = (userId: string) => {
    // your edit logic
  };

  const handleResetPassword = (userId: string) => {
    // your reset logic
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    // your toggle logic
  };

  // THIS IS THE CRITICAL FIX — DEMO MODE IS GONE FOREVER
  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Team Control Panel</h1>
          <button
            onClick={handleAddUser}
            className="bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
          >
            + Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table-auto">
            <thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-gray-300"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active'
                          ? 'bg-brand-lime/20 text-brand-lime'
                          : 'bg-brand-gray/50 text-gray-gray-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => onViewUserTrends(user.id)}
                      className="text-xs text-lime-500 hover:underline"
                    >
                      Trends
                    </button>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-xs text-yellow-500 hover:underline"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`text-xs hover:underline ${
                        user.status === 'Active' ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default TeamControlPage;
