import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SignOut from "@/components/sign-out";
import Link from "next/link";

const matches = [
  { title: "Salesforce Project Manager", company: "ABC Technologies", location: "Toronto, ON", type: "Hybrid", score: 94, salary: "$100K–$120K" },
  { title: "Senior Project Manager", company: "Deloitte", location: "Remote · Canada", type: "Remote", score: 91, salary: "$105K–$130K" },
  { title: "Digital Product Manager", company: "Rogers", location: "Mississauga, ON", type: "Hybrid", score: 87, salary: "$95K–$115K" },
];
const activity = [
  ["Applied to Salesforce Project Manager", "Today"],
  ["Saved 4 new job matches", "Yesterday"],
  ["Resume profile updated", "2 days ago"],
  ["Resume analysis completed", "3 days ago"],
];

export default async function Dashboard() {
  const s = await getAuthSession();
  if (!s) redirect("/login");
  const firstName = s.user?.name?.split(" ")[0] || "there";

  return (
    <main className="dashboard-shell">
      <header className="dashboard-top">
        <div className="dashboard-wrap dashboard-header-inner">
          <Link href="/" className="brand" aria-label="JobHuntPro home"><img src="/logo-primary.svg" alt="JobHuntPro" className="brand-logo" /></Link>
          <div className="dashboard-header-actions">
            <button className="icon-button" aria-label="Notifications">♧<span className="notification-dot" /></button>
            <div className="profile-chip"><span className="avatar">{firstName.charAt(0).toUpperCase()}</span><span className="profile-name">{s.user?.name || s.user?.email}</span></div>
            <SignOut />
          </div>
        </div>
      </header>

      <div className="dashboard-wrap dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-label">WORKSPACE</div>
          <Link href="/dashboard" className="side-link active"><span className="side-icon">⌂</span><span>Dashboard</span></Link>
          <Link href="/jobs" className="side-link"><span className="side-icon">⌕</span><span>Find Jobs</span></Link>
          <Link href="/applications" className="side-link"><span className="side-icon">✓</span><span>Applications</span></Link>
          <Link href="/saved-jobs" className="side-link"><span className="side-icon">♡</span><span>Saved Jobs</span></Link>
          <Link href="/resume" className="side-link"><span className="side-icon">▤</span><span>My Resume</span></Link>
          <Link href="/job-alerts" className="side-link"><span className="side-icon">◌</span><span>Job Alerts</span></Link>
          <div className="sidebar-divider" />
          <div className="sidebar-label">ACCOUNT</div>
          <Link href="/settings" className="side-link"><span className="side-icon">⚙</span><span>Settings</span></Link>
          <div className="sidebar-spacer" />
          <div className="sidebar-help"><span>Need help?</span><strong>We're here for you.</strong><a href="mailto:support@jobhuntpro.com">Contact support →</a></div>
        </aside>

        <section className="dashboard-main">
          <div className="dashboard-heading">
            <div><div className="dashboard-eyebrow">YOUR JOB SEARCH</div><h1>Good morning, {firstName}.</h1><p>Here’s what’s happening with your job search today.</p></div>
            <Link href="/jobs" className="btn btn-primary">Find matching jobs <span>→</span></Link>
          </div>

          <div className="dashboard-search"><span>⌕</span><input aria-label="Search jobs" placeholder="Search jobs by title, skill or company" /><button>Search jobs</button></div>

          <div className="stats-grid">
            <div className="stat-card stat-card-highlight"><div className="stat-top"><span className="stat-icon">✦</span><span className="stat-label">MATCHED JOBS</span></div><div className="stat-value">82</div><div className="stat-note"><b>+18</b> new since yesterday</div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon">↗</span><span className="stat-label">APPLICATIONS</span></div><div className="stat-value">18</div><div className="stat-note"><b>6</b> submitted this week</div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon">◉</span><span className="stat-label">INTERVIEWS</span></div><div className="stat-value">5</div><div className="stat-note"><b>2</b> upcoming</div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon">★</span><span className="stat-label">SAVED JOBS</span></div><div className="stat-value">12</div><div className="stat-note"><b>4</b> are 90%+ matches</div></div>
          </div>

          <div className="dashboard-content-grid">
            <div className="dashboard-column">
              <div className="section-header"><div><h2>Recommended for you</h2><p>Roles ranked by how well they match your profile.</p></div><Link href="/jobs">View all →</Link></div>
              <div className="job-match-list">
                {matches.map((job) => (
                  <article className="job-match-card" key={job.title}>
                    <div className="company-avatar">{job.company.charAt(0)}</div>
                    <div className="job-match-main">
                      <div className="job-title-row"><div><h3>{job.title}</h3><p>{job.company}</p></div><button className="save-button" aria-label={"Save " + job.title}>♡</button></div>
                      <div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.type}</span><span>◈ {job.salary}</span></div>
                      <div className="job-card-bottom"><div className="match-meter"><span style={{width: job.score + "%"}} /></div><strong>{job.score}% Match</strong><Link href="/jobs">View job →</Link></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="dashboard-column dashboard-side-column">
              <div className="section-header"><div><h2>Your profile</h2><p>Keep it complete for better matches.</p></div></div>
              <div className="profile-progress-card"><div className="progress-ring"><span>86<small>%</small></span></div><div><strong>Profile strength</strong><p>You’re almost there. Complete 2 more sections.</p></div><Link href="/settings">Complete profile →</Link></div>
              <div className="dash-card activity-card">
                <div className="section-header compact"><div><h2>Recent activity</h2></div><Link href="/applications">View all</Link></div>
                <div className="activity">{activity.map(([label, time]) => <div className="activity-row" key={label}><span className="activity-dot" /><div><strong>{label}</strong><small>{time}</small></div></div>)}</div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <nav className="mobile-nav"><Link className="active" href="/dashboard"><span>⌂</span>Home</Link><Link href="/jobs"><span>⌕</span>Jobs</Link><Link href="/applications"><span>✓</span>Apps</Link><Link href="/saved-jobs"><span>♡</span>Saved</Link><Link href="/settings"><span>⚙</span>Settings</Link></nav>
    </main>
  );
}