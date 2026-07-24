"use client";

import { useState } from "react";
import { Search, RotateCcw, FileText, Folder, HardDrive, RefreshCw, AlertTriangle, Wrench, CheckCircle2 } from "lucide-react";

const parts = [
  { id: "70196-03", dev: "DEV260119", date: "17 Jan 25", issue: "Staking joint rotation", root: "Crack", status: "REUSABLE", action: "Consulted DC team, ordered new punch.", lesson: "Slight rotation is accepted if force limit (600-700 lbf) is maintained. Inspect radius under 10x magnification.", supplier: "Dong Tam", evidence: ["DEV260119.pdf", "DEV260119.docx"] }
];

export default function Home() {
  const [selected] = useState(parts[0]);

  return (
    <main className="qms-shell">
      <header className="qms-header">
        <div className="logo"><span>◆</span> Deviation Knowledge Hub</div>
        <div className="toolbar">
          <button>Import</button><button>Import New</button><button>Data Folder</button><button><RefreshCw size={14}/>Refresh</button>
          <div className="status"><span className="dot"></span>Connected | Records: 152</div>
        </div>
      </header>

      <div className="qms-main">
        <aside className="qms-sidebar">
          {["Keyword", "Part Number", "DEV ID", "Supplier", "Customer", "Root Cause"].map(f => (
            <div key={f} className="filter-group">
              <label>{f}</label>
              <input placeholder={`Search ${f}...`} />
            </div>
          ))}
          <div className="filter-actions">
            <button className="btn-search">Search</button>
            <button className="btn-reset">Reset</button>
          </div>
        </aside>

        <section className="qms-content">
          <div className="result-table">
            <div className="table-head"><span>Part</span><span>DEV ID</span><span>Issue</span><span>Root Cause</span><span>Status</span></div>
            {parts.map(p => (
              <div key={p.id} className="row active">
                <span>{p.id}</span><span>{p.dev}</span><span>{p.issue}</span><span>{p.root}</span>
                <span className="pill green">{p.status}</span>
              </div>
            ))}
          </div>

          <div className="detail-view">
            <div className="detail-nav">
              <button>Open Detail</button><button>Open Folder</button><button>Open Word</button><button>Open PDF</button>
            </div>
            <div className="three-col">
              <div className="col">
                <h3><AlertTriangle size={16}/> VẤN ĐỀ ĐÃ GẶP</h3>
                <p><strong>{selected.issue}</strong></p>
                <p>Force limit 600-700 lbf exceeded, staking joint rotation and surface crack identified.</p>
              </div>
              <div className="col">
                <h3><Wrench size={16}/> CÁCH ĐÃ XỬ LÝ</h3>
                <p>Ordered new punch, adjusted OD/backstop. Consulted DC team for force limit verification.</p>
                <div className="result-box"><strong>Kết quả:</strong> Accepted condition.</div>
              </div>
              <div className="col lesson">
                <h3><CheckCircle2 size={16}/> KINH NGHIỆM LẶP LẠI</h3>
                <p>{selected.lesson}</p>
                <small><strong>Phạm vi:</strong> {selected.id} staking joints</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
