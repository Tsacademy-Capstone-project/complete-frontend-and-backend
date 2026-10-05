import { Search } from "lucide-react";
import { useMemo, useState } from "react";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Users({
  users = [],
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (user) =>
        user.id?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, search]);

  return (
    <section className="users-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Users</h1>
          <p>
            View registered users and their account information.
          </p>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="search-wrapper">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <h2>No users available</h2>
          <p>
            Registered users will appear here.
          </p>
        </div>
      ) : (
        <div className="users-table-card">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email}>
                    <td>
                      {user.id ? (
                        <code className="user-id">{user.id}</code>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                      <span className="role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}