import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SignOut from "@/components/sign-out";
import Link from "next/link";

const platformMatches: Array<[string, number]> = [
  ["LinkedIn", 32],
  ["Naukri", 28],
  ["Indeed", 24],
  ["Monster", 12],
  ["Glassdoor", 10],
];

export default async function Dashboard() {
  const s = await getAuthSession();
  if (!s) redirect("/login");

  return (
    <main className="dashboard-shell">
      <header className="dashboard-top">
        <div className="dashboard-wrap" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Link href="/" className="brand" style={{textDecoration:"none"}}><span className="brand-mark"/>JOBHUNT<span>PRO</span></Link>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:13,color:"#756e88"}}>{s.user?.name || s.user?.email}</span>
            <SignOut/>
          </div>
        </div>
      </header>

      <div className="dashboard-wrap dashboard-layout">
        <aside className="sidebar">
          <Link href="/dashboard" className="side-link active">▦ <span>Dashboard</span></Link>
          <a href="#" className="side-link">⌕ <span>Find Jobs</span></a>
          <a href="#" className="side-link">✓ <span>My Applications</span></a>
          <a href="#" className="side-link">▤ <span>Resume</span></a>
          <a href="#" className="side-link">◌ <span>Job Alerts</span></a>
          <a href="#" className="side-link">♡ <span>Saved Jobs</span></a>
          <a href="#" className="side-link">⚙ <span>Settings</span></a>
        </aside>

        <section className="dashboard-main">
          <div className="dashboard-heading">
            <div><h1>Dashboard</h1><p>Here's an overview of your job search progress.</p></div>
            <button className="btn btn-ghost">Last 30 days ▾</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-label">JOBS FOUND</div><div className="stat-value">128</div><div className="stat-trend">+24% this week</div></div>
            <div className="stat-card"><div className="stat-label">APPLIED</div><div className="stat-value">18</div><div className="stat-trend">+6 this week</div></div>
            <div className="stat-card"><div className="stat-label">INTERVIEWS</div><div className="stat-value">5</div><div className="stat-trend">+2 this week</div></div>
            <div className="stat-card"><div className="stat-label">OFFERS</div><div className="stat-value">2</div><div className="stat-trend">+1 this week</div></div>
          </div>

          <div className="dash-grid">
            <div className="dash-card">
              <h3>Job matches by platform</h3>
              {platformMatches.map(([name, value]) => (
                <div className="bar-row" key={name}>
                  <span>{name}</span>
                  <div className="bar"><i style={{width: value * 2.5 + "%"}} /></div>
                  <b>{value}%</b>
                </div>
              ))}
            </div>

            <div className="dash-card">
              <h3>Recent activity</h3>
              <div className="activity">
                <div className="activity-row"><span>Applied to Salesforce PM</span><small>Today</small></div>
                <div className="activity-row"><span>Saved 4 new matches</span><small>Yesterday</small></div>
                <div className="activity-row"><span>Profile updated</span><small>2 days ago</small></div>
                <div className="activity-row"><span>Resume analyzed</span><small>3 days ago</small></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="mobile-nav">
        <a className="active" href="#">▦<br/>Home</a>
        <a href="#">⌕<br/>Jobs</a>
        <a href="#">✓<br/>Apps</a>
        <a href="#">♡<br/>Saved</a>
        <a href="#">⚙<br/>Settings</a>
      </nav>
    </main>
  );
}