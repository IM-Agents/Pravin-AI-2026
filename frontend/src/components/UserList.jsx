const UserList = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <div className="empty-state">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h3>Registered Users ({users.length})</h3>
      <div className="user-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h4>{user.name || 'User'}</h4>
              <p className="user-email">{user.email}</p>
              <p className="user-date">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;

