import React, { useState, useEffect } from "react";
import { Database, Table, Key, Terminal, Code, History, RefreshCcw, Layers } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  is_verified: boolean;
  biometric_confidence: number;
  verified_at: string;
}

interface QueryRow {
  id: string;
  user_id: string;
  target_role: string;
  industry_sector: string;
  match_score: number;
  ats_score: number;
  queried_at: string;
}

interface DBLogsResponse {
  users: UserRow[];
  queries: QueryRow[];
  schemas: {
    usersTable: string;
    queriesTable: string;
  };
}

export const DBConsole: React.FC = () => {
  const [dbData, setDbData] = useState<DBLogsResponse | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"erd" | "tables" | "terminal">("erd");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([
    "SELECT * FROM users JOIN career_queries ON users.id = career_queries.user_id;",
    "SELECT target_role, COUNT(*) as query_count FROM career_queries GROUP BY target_role ORDER BY query_count DESC limit 5;"
  ]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/db/logs");
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
      }
    } catch (err) {
      console.error("Failed to load db logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Poll logs every 4 seconds to reflect liveness scans and searches
    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden" id="db-schema-console">
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#0a66c2]" />

      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-[#0a66c2] border border-blue-100 shadow-sm">
            <Database className="w-5 h-5 text-[#0a66c2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight uppercase flex items-center gap-1.5 leading-none">
              Career Database Ledger <span className="text-[9px] bg-blue-50 text-[#0a66c2] border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">Simulated PostgreSQL</span>
            </h3>
            <p className="text-[10.5px] text-zinc-500 mt-1.5">
              Inspect transaction records, schema dependencies, and live diagnostic history dynamically.
            </p>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex bg-zinc-100 border border-zinc-250 p-1 rounded-xl self-start sm:self-center text-[11px] font-sans font-bold">
          <button
            onClick={() => setActiveSubTab("erd")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "erd" ? "bg-white text-[#0a66c2] font-extrabold shadow-sm" : "text-zinc-650 hover:text-zinc-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schema ERD</span>
          </button>
          <button
            onClick={() => setActiveSubTab("tables")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all relative cursor-pointer ${
              activeSubTab === "tables" ? "bg-white text-blue-700 font-extrabold shadow-sm" : "text-zinc-650 hover:text-zinc-900"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Active Rows</span>
            {dbData && dbData.users.length + dbData.queries.length > 0 && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse absolute -top-0.5 right-0.5" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("terminal")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "terminal" ? "bg-white text-purple-700 font-extrabold shadow-sm" : "text-zinc-650 hover:text-zinc-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Audit Trace</span>
          </button>
        </div>
      </div>

      {/* Panel Render Content */}
      <div className="min-h-[280px]">
        
        {/* -- Tab 1: SQL Schema ERD Diagram -- */}
        {activeSubTab === "erd" && (
          <div className="space-y-6">
            
            {/* Visual ERD layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* Table A: `users` */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-mono text-[11px] relative shadow-inner">
                <div className="bg-blue-50 border-b border-blue-200/60 pb-2 mb-3 flex items-center justify-between">
                  <span className="text-zinc-800 font-bold flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-[#0a66c2]" />
                    <span className="font-extrabold">Table: users</span>
                  </span>
                  <span className="text-[9px] text-[#0a66c2] px-1.5 bg-white border border-blue-200 rounded font-bold uppercase">PK</span>
                </div>

                <div className="space-y-1.5 text-zinc-650">
                  <div className="flex justify-between items-center bg-blue-50/50 px-1.5 py-0.5 rounded text-zinc-800">
                    <span className="font-bold text-[#0a66c2] flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-650" /> id
                    </span>
                    <span className="font-semibold text-zinc-500">VARCHAR(50) [PK] [UNIQUE]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="font-bold text-zinc-800">email</span>
                    <span className="text-zinc-500">VARCHAR(100) [NOT_NULL]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="text-emerald-700 font-bold">is_verified</span>
                    <span className="text-zinc-500">BOOLEAN [DEFAULT: FALSE]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="text-emerald-700 font-bold">biometric_confidence</span>
                    <span className="text-zinc-500">FLOAT [DEFAULT: 0.0]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="text-emerald-700 font-bold">verified_at</span>
                    <span className="text-zinc-500">TIMESTAMP [NULLABLE]</span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 mt-4 italic font-sans leading-relaxed">
                  *Stores core candidate profiles, mandatory biometric verification tokens, and compliance metadata.
                </div>
              </div>

              {/* Connected Line indicators representing references */}
              <div className="hidden md:flex absolute top-1/2 left-[48%] right-auto w-10 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 pointer-events-none justify-center items-center z-10">
                <span className="w-2 h-2 rounded-full bg-[#0a66c2]/80 animate-ping absolute" />
                <span className="text-[8px] font-mono font-bold text-blue-700 bg-white border border-blue-200 rounded px-1 -translate-y-5">
                  FK_ID
                </span>
              </div>

              {/* Table B: `career_queries` */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-mono text-[11px] relative shadow-inner">
                <div className="bg-purple-50 border-b border-purple-200/60 pb-2 mb-3 flex items-center justify-between">
                  <span className="text-zinc-800 font-bold flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-purple-750" />
                    <span className="font-extrabold uppercase">Table: career_queries</span>
                  </span>
                  <span className="text-[9px] text-purple-750 px-1.5 bg-white border border-purple-200 rounded font-bold uppercase">FK</span>
                </div>

                <div className="space-y-1.5 text-zinc-650">
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="font-bold text-zinc-800">id</span>
                    <span className="text-zinc-500">VARCHAR(50) [PK] [UNIQUE]</span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50/50 px-1.5 py-0.5 rounded text-zinc-800">
                    <span className="font-bold text-purple-750 flex items-center gap-1">
                      <Key className="w-3 h-3 text-zinc-500" /> user_id
                    </span>
                    <span className="text-zinc-500">VARCHAR(50) [REFERENCES users.id]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="text-blue-750 font-bold">target_role</span>
                    <span className="text-zinc-500">VARCHAR(100) [NOT_NULL]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5 border border-zinc-200/50 rounded p-1 bg-white">
                    <span className="text-blue-750 font-bold">industry_sector</span>
                    <span className="text-zinc-500">VARCHAR(100) [NOT_NULL]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="font-bold">match_score</span>
                    <span className="text-zinc-500">INTEGER [0-100]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="font-bold">ats_score</span>
                    <span className="text-zinc-500">INTEGER [0-100]</span>
                  </div>
                  <div className="flex justify-between px-1.5 py-0.5">
                    <span className="font-bold">queried_at</span>
                    <span className="text-zinc-500">TIMESTAMP [DEFAULT: NOW()]</span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 mt-4 italic font-sans leading-relaxed">
                  *Persists diagnostic parameters, targeting benchmarks, match scoring outcomes, and sector details.
                </div>
              </div>

            </div>

            {/* DDL SQL scripts section */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2 border-b border-zinc-250 pb-2">
                <span className="flex items-center gap-1 text-zinc-650 font-bold">
                  <Code className="w-3.5 h-3.5 text-[#0a66c2]" /> Physical_DDL.sql (Postgres Engine Standard)
                </span>
                <span className="text-[9px] uppercase font-bold text-[#0a66c2] bg-blue-50 border border-blue-200 px-1.5 rounded">READ_ONLY</span>
              </div>
              <pre className="text-[10.5px] text-zinc-650 font-mono overflow-x-auto leading-relaxed max-h-40 overflow-y-auto">
{`-- Create table schema holding biometric states
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  biometric_confidence FLOAT DEFAULT 0.0,
  verified_at TIMESTAMP
);

-- Create table schema keeping queries persistent (supporting ANY role/sector)
CREATE TABLE career_queries (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  target_role VARCHAR(100) NOT NULL,
  industry_sector VARCHAR(100) NOT NULL,
  match_score INT,
  ats_score INT,
  queried_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimize search lookups via indices on composite keys
CREATE INDEX idx_queries_role ON career_queries (industry_sector, target_role);`}
              </pre>
            </div>

          </div>
        )}

        {/* -- Tab 2: Live Active Database Tables Render -- */}
        {activeSubTab === "tables" && (
          <div className="space-y-6">
            
            {/* Table 1: Users */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm p-0.5 bg-zinc-50">
              <div className="bg-zinc-150/70 py-2.5 px-4 border-b border-zinc-200 text-xs font-sans font-bold text-purple-750 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-600" />
                  <span>TABLE RECORDS: users (Session Registry)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-bold bg-white px-2 py-0.5 rounded border border-zinc-200">
                  Total Rows: {dbData ? dbData.users.length : 0}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] font-mono text-zinc-700 text-left bg-white">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-extrabold uppercase tracking-wider text-[8.5px]">
                    <tr>
                      <th className="py-2.5 px-3">id</th>
                      <th className="py-2.5 px-3">email</th>
                      <th className="py-2.5 px-3">is_verified</th>
                      <th className="py-2.5 px-3">biometric_confidence</th>
                      <th className="py-2.5 px-3">verified_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {dbData?.users.map((row) => (
                      <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2.5 px-3 text-[#0a66c2] font-bold">{row.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">{row.email}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold ${
                            row.is_verified ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                          }`}>
                            {row.is_verified ? "true" : "false"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {row.is_verified ? (
                            <span className="text-purple-700 font-mono font-bold">{(row.biometric_confidence * 100).toFixed(1)}%</span>
                          ) : (
                            <span className="text-zinc-600 font-bold">0.0%</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">{row.verified_at ? new Date(row.verified_at).toLocaleTimeString() : "NULL"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Queries */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm p-0.5 bg-zinc-50">
              <div className="bg-zinc-150/70 py-2.5 px-4 border-b border-zinc-200 text-xs font-sans font-bold text-blue-750 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#0a66c2]" />
                  <span>TABLE RECORDS: career_queries (Diagnostic Query History)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-bold bg-white px-2 py-0.5 rounded border border-zinc-200">
                  Total Rows: {dbData ? dbData.queries.length : 0}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] font-mono text-zinc-700 text-left bg-white">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-extrabold uppercase tracking-wider text-[8.5px]">
                    <tr>
                      <th className="py-2.5 px-3">id</th>
                      <th className="py-2.5 px-3">user_id</th>
                      <th className="py-2.5 px-3">target_role</th>
                      <th className="py-2.5 px-3">industry_sector</th>
                      <th className="py-2.5 px-3">match_score</th>
                      <th className="py-2.5 px-3">ats_score</th>
                      <th className="py-2.5 px-3">queried_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {dbData?.queries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-zinc-500 italic">No search entries yet. Perform a career diagnostic above to record searches!</td>
                      </tr>
                    ) : (
                      dbData?.queries.map((row) => (
                        <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2 px-3 text-[#0a66c2] font-bold">{row.id}</td>
                          <td className="py-2 px-3 text-zinc-500 font-semibold">{row.user_id}</td>
                          <td className="py-2 px-3 font-semibold text-zinc-900">{row.target_role}</td>
                          <td className="py-2 px-3 text-purple-700">
                            <span className="px-1.5 bg-purple-50/60 border border-purple-200/50 rounded font-semibold">{row.industry_sector}</span>
                          </td>
                          <td className="py-2 px-3 text-amber-700 font-extrabold">{row.match_score}%</td>
                          <td className="py-2 px-3 text-emerald-700 font-semibold">{row.ats_score}%</td>
                          <td className="py-2 px-3 text-zinc-400">{new Date(row.queried_at).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* -- Tab 3: Terminal View / Query Logging traces -- */}
        {activeSubTab === "terminal" && (
          <div className="space-y-4">
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-mono text-[11px] text-zinc-700 space-y-3 shadow-inner max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-205 pb-2 mb-2 font-mono">
                <span className="flex items-center gap-1 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-[#0a66c2]" /> SQLite / Postgres System Execution Logs
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </div>

              {/* Dynamic Transaction SQL Lines based on data state */}
              <div className="space-y-4">
                
                {/* Seed user standard select check */}
                <div className="space-y-1">
                  <span className="text-zinc-450 font-bold">[SESSION HANDSHAKE]</span>
                  <div className="text-blue-750 font-bold font-mono">SELECT * FROM users WHERE email = 'ankurnegi68@gmail.com' LIMIT 1;</div>
                  <div className="text-zinc-500 italic">QueryResult: Row found (usr_001). Verification status: unverified. Spawning authentication gate.</div>
                </div>

                {/* Face Scanning log */}
                {dbData && dbData.users.some(u => u.is_verified) ? (
                  <div className="space-y-1.5 border-l border-emerald-500/55 pl-2.5">
                    <span className="text-purple-700 font-extrabold uppercase">[EVENT: BIOMETRIC_SUCCESS]</span>
                    <div className="text-[#0a66c2] font-semibold font-mono">
                      UPDATE users SET is_verified = true, biometric_confidence = {
                        dbData.users.find(u => u.email === "ankurnegi68@gmail.com")?.biometric_confidence || 0.985
                      }, verified_at = CURRENT_TIMESTAMP WHERE email = 'ankurnegi68@gmail.com';
                    </div>
                    <div className="text-emerald-700 font-bold">
                      SUCCESS: 1 row affected. Session unlocked cleanly. Dashboard live feeds open.
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-400 font-medium select-none italic font-sans p-1">
                    * [Waiting for biometric check transaction sequence...]
                  </div>
                )}

                {/* Diagnostic query logs */}
                {dbData && dbData.queries.map((q, idx) => (
                  <div key={idx} className="space-y-1.5 border-l border-blue-500/45 pl-2.5">
                    <span className="text-blue-750 font-extrabold uppercase">[DB AUDIT: SEARCH_DETERMINISTIC]</span>
                    <div className="text-zinc-600 font-mono leading-relaxed">
                      INSERT INTO career_queries (id, user_id, target_role, industry_sector, match_score, ats_score, queried_at) 
                      VALUES ('{q.id}', '{q.user_id}', '{q.target_role.replace(/'/g, "''")}', '{q.industry_sector.replace(/'/g, "''")}', {q.match_score}, {q.ats_score}, CURRENT_TIMESTAMP);
                    </div>
                    <div className="text-emerald-700 font-bold">
                      SUCCESS: Inserted query token into PostgreSQL ledger registry.
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Quick manual selection query view */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-[#0a66c2]" /> Prepared Query Statement Cache
              </div>
              <div className="space-y-1.5 max-h-20 overflow-y-auto font-mono">
                {queryHistory.map((q, i) => (
                  <div key={i} className="text-[10px] text-zinc-600 hover:text-blue-700 transition-colors cursor-pointer select-none truncate">
                    &bull; <span className="text-[#0a66c2] font-semibold">EXPLAIN ANALYZE</span> {q}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Database control footer */}
      <div className="border-t border-zinc-100 pt-4 mt-4 flex flex-col sm:flex-row items-center sm:justify-between text-[11px] text-zinc-500 uppercase font-bold font-sans gap-2">
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Pipeline: Synced Live
        </span>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3 py-1.5 bg-white border border-zinc-250 hover:bg-zinc-50 text-zinc-700 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all text-[10px] font-bold cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#0a66c2]" : "text-zinc-500"}`} />
          <span>Sync Log Records</span>
        </button>
      </div>
    </div>
  );
};
