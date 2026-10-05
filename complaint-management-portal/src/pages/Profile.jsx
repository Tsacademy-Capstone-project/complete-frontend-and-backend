import { User, Mail, Shield, Fingerprint } from "lucide-react";

export default function Profile({ user }) {
  if (!user) return null;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  const userId = user._id || user.id;

  return (
    <section className="profile-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
          <p>
            View your account information.
          </p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {name
            ?.split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="profile-information">
          <div className="profile-row">
            <div className="profile-icon">
              <User size={18} />
            </div>

            <div>
              <span>Name</span>
              <strong>{name}</strong>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-icon">
              <Mail size={18} />
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-icon">
              <Shield size={18} />
            </div>

            <div>
              <span>Account role</span>
              <strong>{user.role}</strong>
            </div>
          </div>

          {userId && (
            <div className="profile-row">
              <div className="profile-icon">
                <Fingerprint size={18} />
              </div>

              <div>
                <span>User ID</span>
                <code>{userId}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
