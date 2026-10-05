import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "./PublicFooter";
<PublicNavbar />
const features = [
  {
    number: "01",
    title: "Centralized management",
    text: "Bring complaints, feedback, requests, and support tickets into one organized workspace.",
  },
  {
    number: "02",
    title: "Clear status tracking",
    text: "Know what has been received, what is being handled, and what has already been resolved.",
  },
  {
    number: "03",
    title: "Team accountability",
    text: "Give your team visibility into issues and make ownership easier to manage.",
  },
  {
    number: "04",
    title: "Complete history",
    text: "Keep a record of each concern from submission through resolution.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Raise",
    text: "A user submits a complaint, request, feedback, or issue.",
  },
  {
    number: "02",
    title: "Organize",
    text: "Your team categorizes and prioritizes what has been received.",
  },
  {
    number: "03",
    title: "Act",
    text: "The appropriate team member investigates and works on the issue.",
  },
  {
    number: "04",
    title: "Resolve",
    text: "The outcome is recorded and the user can follow the progress.",
  },
];

const industries = [
  "Education",
  "Healthcare",
  "Technology",
  "Finance",
  "Government",
  "Non-profits",
];

export default function Home() {
  return (
    <div className="public-page">
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="eyebrow">
                Complaint & feedback management
              </span>

              <h1>
                Every concern deserves
                <span> a resolution.</span>
              </h1>

              <p className="hero-description">
                Give your users a clear way to raise complaints, share
                feedback, and report issues while giving your team the tools
                to organize, track, and resolve them.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get started
                </Link>

               <a href="#about" className="btn btn-secondary btn-large"> 
                  Learn more
                </a>
              </div>

              <div className="hero-note">
                <span className="hero-note-dot" />
                Built for teams of every size
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card hero-card-main">
                <div className="hero-card-header">
                  <div>
                    <span className="small-label">Ticket</span>
                    <strong>#CMP-1048</strong>
                  </div>

                  <span className="status-badge status-progress">
                    <span className="status-dot" />
                    In Progress
                  </span>
                </div>

                <div className="hero-ticket">
                  <span className="small-label">SUBJECT</span>
                  <h3>Service request requires attention</h3>
                  <p>
                    A submitted concern is being reviewed by the responsible
                    team.
                  </p>
                </div>

                <div className="hero-progress">
                  <div className="hero-progress-label">
                    <span>Resolution progress</span>
                    <strong>68%</strong>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill" />
                  </div>
                </div>
              </div>

              <div className="floating-card floating-card-top">
                <span className="floating-icon">✓</span>
                <div>
                  <strong>Issue resolved</strong>
                  <span>2 minutes ago</span>
                </div>
              </div>

              <div className="floating-card floating-card-bottom">
                <span className="floating-number">24</span>
                <div>
                  <strong>Open issues</strong>
                  <span>Across your team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product introduction */ }
        <section id="about-content" className="section section-white">
          <div className="container intro-grid">
            <div>
              <span className="eyebrow">One system for every issue</span>

              <h2>
                Feedback shouldn't disappear
                <span> after it is received.</span>
              </h2>
            </div>

            <div className="intro-text">
              <p>
                Complaints, requests, and feedback often arrive through
                different channels. When there is no central system, important
                issues can become difficult to track.
              </p>

              <p>
                ComplaintsHQ gives organizations one structured place to
                collect concerns, organize them, assign responsibility, and
                follow them through to resolution.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="section workflow-section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">How it works</span>

              <h2>From concern to resolution.</h2>

              <p>
                A simple workflow that keeps users informed and teams
                accountable.
              </p>
            </div>

            <div className="workflow-grid">
              {workflow.map((item) => (
                <article className="workflow-card" key={item.number}>
                  <span className="step-number">{item.number}</span>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section section-white">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Built for action</span>

              <h2>Everything your team needs to stay accountable.</h2>
            </div>

            <div className="features-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.number}>
                  <span className="feature-number">{feature.number}</span>

                  <h3>{feature.title}</h3>

                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="section integration-section">
          <div className="container integration-grid">
            <div>
              <span className="eyebrow">Fits your workflow</span>

              <h2>Connect the tools your team already uses.</h2>

              <p>
                ComplaintsHQ can sit alongside the communication and
                productivity tools your organization already depends on.
              </p>
            </div>

            <div className="integration-list">
              <div>Slack</div>
              <div>Microsoft Teams</div>
              <div>Google Workspace</div>
              <div>Email</div>
              <div>Jira</div>
              <div>Trello</div>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="section section-white">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Designed to scale</span>

              <h2>Built for teams of every size.</h2>

              <p>
                Whether you are managing a small team or a large organization,
                the workflow stays simple.
              </p>
            </div>

            <div className="industries-grid">
              {industries.map((industry) => (
                <div className="industry-card" key={industry}>
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container cta-content">
            <span className="eyebrow">Start managing better</span>

            <h2>Give every concern a clear path forward.</h2>

            <p>
              Create a structured process for receiving, managing, and
              resolving feedback.
            </p>

            <Link to="/register" className="btn btn-light btn-large">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter /> 
    </div>
  );
}