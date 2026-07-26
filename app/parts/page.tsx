"use client";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartsListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/deviations").then(data => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="p-5">
      {loading ? <div>Loading...</div> : (
        <table className="w-full">
          <thead><tr><th>DEV ID</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((c: any) => (
              <tr key={c.dev_code}>
                <td>{c.dev_code}</td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
