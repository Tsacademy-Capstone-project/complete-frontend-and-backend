import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "./PublicFooter";

const values = [
  {
    title: "Transparency",
    text: "Users should be able to understand what is happening with the concerns they raise.",
  },
  {
    title: "Accountability",
    text: "Teams need clear ownership and visibility over the issues they are responsible for.",
  },
  {
    title: "Efficiency",
    text: "A good complaint process should reduce confusion and help issues move toward resolution.",
  },
  {
    title: "Trust",
    text: "Organizations build trust when people know their concerns are being heard and acted upon.",
  },
];

export default function About() {
  return (
    <div className="public-page">
      <PublicNavbar />

      <main>
        {/* About hero */}
        <section className="about-hero">
          <div className="container about-hero-content">
            <span className="eyebrow">About ComplaintsHQ</span>

            <h1>
              Better feedback starts with
              <span> better systems.</span>
            </h1>

            <p>
              ComplaintsHQ helps organizations create a clear, structured
              process for receiving, managing, tracking, and resolving
              complaints and feedback.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="section section-white">
          <div className="container story-grid">
            <div>
              <span className="eyebrow">Why we built it</span>

              <h2>
                Listening is only the beginning.
              </h2>
            </div>

            <div className="story-content">
              <p>
                Every organization receives complaints, questions, requests,
                and feedback. The challenge is making sure those concerns do
                not disappear after they are received.
              </p>

              <p>
                A message can be read and still remain unresolved. An email
                can be forwarded and still have no clear owner. A spreadsheet
                can contain hundreds of issues without showing what needs
                attention first.
              </p>

              <p>
                ComplaintsHQ provides a central workflow where concerns can be
                submitted, organized, assigned, tracked, and resolved.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section mission-section">
          <div className="container mission-card">
            <div>
              <span className="eyebrow">Our mission</span>

              <h2>
                Turn concerns into action.
              </h2>
            </div>

            <p>
              Our goal is to make it easier for organizations to listen to
              their users and easier for users to know that their concerns have
              a clear path forward.
            </p>
          </div>
        </section>

        {/* Process */}
        <section className="section section-white">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">The approach</span>

              <h2>A simple system for a complex process.</h2>

              <p>
                ComplaintsHQ is built around a straightforward lifecycle.
              </p>
            </div>

            <div className="about-process">
              <div>
                <strong>01</strong>
                <h3>Receive</h3>
                <p>Capture complaints, feedback, requests, and issues.</p>
              </div>

              <div>
                <strong>02</strong>
                <h3>Organize</h3>
                <p>Categorize and prioritize what your team receives.</p>
              </div>

              <div>
                <strong>03</strong>
                <h3>Assign</h3>
                <p>Make responsibility clear and give issues an owner.</p>
              </div>

              <div>
                <strong>04</strong>
                <h3>Track</h3>
                <p>Follow progress as the team works toward a solution.</p>
              </div>

              <div>
                <strong>05</strong>
                <h3>Resolve</h3>
                <p>Record the outcome and close the loop with the user.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section values-section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">What matters to us</span>

              <h2>The principles behind the product.</h2>
            </div>

            <div className="values-grid">
              {values.map((value) => (
                <article className="value-card" key={value.title}>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container cta-content">
            <span className="eyebrow">ComplaintsHQ</span>

            <h2>Make every concern easier to manage.</h2>

            <p>
              Give your users a clear channel and your team a structured
              workflow.
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
