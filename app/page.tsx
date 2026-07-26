const kpis = [
  ["Total Parts", "5", "Part-centered library"],
  ["Total Cases", "5", "Imported structured cases"],
  ["Repeated Issue Parts", "3", "Watch these first"],
  ["Reusable Lessons", "2", "Approved knowledge"],
  ["Missing Evidence", "1", "Need review"],
  ["Temporary / Lot-Specific", "1", "Batch only"],
  ["Rejected Cases", "1", "Do not reuse", "active"],
  ["Conditional Reuse", "2", "Needs verification"],
];

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Part-centered deviation knowledge, lessons and evidence readiness.</p>
        </div>
        <button className="btn-solid">Clear Filter</button>
      </div>

      <section className="kpi-grid">
        {kpis.map(([label, value, help, active]) => (
          <article key={label} className={`kpi-card ${active ? "selected" : ""}`}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-help">{help}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel-card">
          <div className="panel-head"><h2>Recent Part Issues</h2><span>Filtered: reject</span></div>
          <table className="dash-table"><thead><tr><th>Part</th><th>DEV ID</th><th>Issue</th><th>Decision</th><th>Status</th></tr></thead><tbody>
            <tr><td><a>34320-02</a></td><td>DEV250928</td><td>Crimp height below minimum</td><td>REJECT</td><td><span className="pill rejected">REJECTED</span></td></tr>
          </tbody></table>
        </div>
        <div className="panel-card">
          <div className="panel-head"><h2>Need Review</h2><button className="chip-blue">Evidence driven</button></div>
          <table className="dash-table"><thead><tr><th>Part</th><th>Reason</th><th>Action</th></tr></thead><tbody>
            <tr><td><a>53180-09</a></td><td>TEMPORARY / LOT-SPECIFIC</td><td>Review condition</td></tr>
            <tr><td><a>34320-02</a></td><td>REJECTED</td><td>Review condition</td></tr>
            <tr><td><a>88901-08</a></td><td>Missing evidence</td><td>Request source files</td></tr>
          </tbody></table>
        </div>
        <div className="panel-card">
          <div className="panel-head"><h2>Top Repeated Parts</h2><span>Click part to review</span></div>
          <table className="dash-table"><thead><tr><th>Part</th><th>Cases</th><th>Main Pattern</th><th>Latest Lesson</th></tr></thead><tbody>
            <tr><td><a>70196-03</a></td><td>1</td><td>Crack</td><td>LL-00017</td></tr>
            <tr><td><a>53180-09</a></td><td>1</td><td>Dimension out of specification</td><td>LL-00012</td></tr>
            <tr><td><a>54101-09</a></td><td>1</td><td>Dimension out of specification</td><td>LL-00045</td></tr>
          </tbody></table>
        </div>
        <div className="panel-card">
          <div className="panel-head"><h2>Latest Approved Lessons</h2><span>Reusable knowledge</span></div>
          <table className="dash-table"><thead><tr><th>Lesson</th><th>Part</th><th>Scope</th></tr></thead><tbody>
            <tr><td>LL-00017</td><td><a>70196-03</a></td><td>Thông số cần giữ: .41</td></tr>
            <tr><td>LL-00045</td><td><a>54101-09</a></td><td>Approved lot and directly tested bobbins only.</td></tr>
          </tbody></table>
        </div>
      </section>
    </div>
  );
}
