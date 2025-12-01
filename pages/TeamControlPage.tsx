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
                      : 'bg-brand-gray/50 text-gray-400'
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

  {/* The AddUserModal component is rendered here */}
  {isModalOpen && (
    <AddUserModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      // Add any other props your modal expects here
    />
  )}
</>
);
};
export default TeamControlPage;
