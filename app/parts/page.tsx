export default function PartsPage(){
  return (
    <div className="parts-screen">
      <aside className="parts-filter">
        <div className="filter-title">Search & Filter</div>
        {['Keyword','Part Number','DEV ID','Supplier','Customer'].map((x,i)=>(
          <label className="filter-field" key={x}><span>{x}</span><input placeholder={i===0?'crimp reject supplier...':''}/></label>
        ))}
        {['Root Cause','Review Decision','Review Status'].map(x=>(
          <label className="filter-field" key={x}><span>{x}</span><select><option>All</option></select></label>
        ))}
        <div className="filter-actions"><button className="btn-solid">Search</button><button className="btn-light">Reset</button></div>
      </aside>

      <section className="parts-content">
        <div className="results-head">
          <div><h1>Results (1)</h1><p>Part <b>34320-02</b> • 1 case(s) • Process variation.</p></div>
        </div>
        <div className="action-row"><button>Open Detail</button><button>Open Folder</button><button>Open Word</button><button>Open PDF</button><button>Open Evidence</button><button className="ml-auto">Export Full Data</button></div>
        <div className="result-table-wrap">
          <table className="result-table"><thead><tr><th>Part</th><th>DEV ID</th><th>Issue</th><th>Root Cause</th><th>Decision</th><th>Status</th><th>Lesson Code</th></tr></thead><tbody>
            <tr><td><a>34320-02</a></td><td>DEV250928</td><td>Crimp height below minimum</td><td>Process variation</td><td>REJECT</td><td><span className="pill rejected">REJECTED</span></td><td>LL-00022</td></tr>
          </tbody></table>
        </div>
        <div className="lesson-grid">
          <article className="lesson-card issue"><div className="num">1</div><h2>Vấn đề đã gặp</h2><h3>What happened?</h3><p>Crimp height below minimum. Below control limit. Cannot verify stable crimp performance.</p><ul><li>Reject lot</li><li>Notify supplier</li><li>Request corrective action</li></ul></article>
          <article className="lesson-card action"><div className="num">2</div><h2>Cách đã xử lý</h2><h3>What was done?</h3><ul><li>Reject lot</li><li>Notify supplier</li><li>Request corrective action</li></ul><div className="result-box"><b>Kết quả / Result</b><span>Rejected due to functional risk.</span></div></article>
          <article className="lesson-card lesson"><div className="num">3</div><h2>Kinh nghiệm khi lập lại</h2><h3>What to do next time?</h3><p>Do not reuse without new crimp validation.</p><div className="mini-box"><b>Phạm vi áp dụng</b><span>Rejected condition</span></div><div className="mini-box"><b>Cần kiểm tra lại</b><span>Pull test, Crimp cross-section</span></div></article>
        </div>
      </section>

      <aside className="evidence-panel">
        <div className="evidence-head"><h2>Evidence</h2><span>R2 preview</span></div>
        <input className="evidence-search" placeholder="Search evidence..." />
        <div className="file-row selected"><div><b>crimp_height_report.pdf</b><span>PDF • 220 KB • 28 Sep 25</span></div></div>
        <div className="pdf-preview"><div className="pdf-page"><h3>Fluid Power & Controls Co., Ltd.</h3><p>Crimp height inspection report</p><div className="pdf-line"/><div className="pdf-line short"/><div className="pdf-table"><span>Part</span><b>34320-02</b><span>Result</span><b>Rejected</b></div></div><div className="pdf-nav">‹ Page 1 / 2 ›</div></div>
      </aside>
    </div>
  )
}
