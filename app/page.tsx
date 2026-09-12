"use client";

import { useMemo, useState } from "react";
import callFixtures from "@/data/calls.json";

type Sentiment = "frustrated" | "neutral" | "positive";
type Call = typeof callFixtures[number];
type Triage = { classification: "handled" | "follow-up" | "lost"; priorityScore: number; urgency: "now" | "today" | "monitor"; recommendedAction: "callback" | "quote" | "text" | "none"; reasons: string[] };
type QueueItem = Call & Triage;
type Filter = "rescue" | "all" | "handled";

function triageCall(item: Call): Triage {
  const text = `${item.intent} ${item.summary}`.toLowerCase();
  const emergency = ["burst", "flood", "leak", "no heat"].some(word => text.includes(word));
  const handled = item.botConfidence >= .85 && item.sentiment === "positive" && !item.requestedQuote;
  const lost = item.botConfidence < .5 || item.sentiment === "frustrated";
  const classification = handled ? "handled" : lost ? "lost" : "follow-up";
  let priorityScore = 12 + (emergency ? 35 : 0) + (item.sentiment === "frustrated" ? 18 : 0) + (item.requestedQuote ? 14 : 0) + (item.afterHours ? 10 : 0) + Math.min(20, Math.round(item.estimatedValue / 125)) - (handled ? 45 : 0);
  priorityScore = Math.max(0, Math.min(100, priorityScore));
  const recommendedAction = emergency || item.sentiment === "frustrated" ? "callback" : item.requestedQuote ? "quote" : handled ? "none" : "text";
  return { classification, priorityScore, urgency: priorityScore >= 70 ? "now" : priorityScore >= 40 ? "today" : "monitor", recommendedAction, reasons: [...(emergency ? ["Emergency language detected"] : []), ...(item.sentiment === "frustrated" ? ["Caller frustration detected"] : []), ...(item.requestedQuote ? ["Quote intent captured"] : []), ...(item.botConfidence < .5 ? ["Low bot confidence"] : []), ...(item.afterHours ? ["After-hours opportunity"] : [])] };
}

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const pretty = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());

export default function Home() {
  const [calls, setCalls] = useState<Call[]>(callFixtures);
  const [filter, setFilter] = useState<Filter>("rescue");
  const [selectedId, setSelectedId] = useState("call-1048");
  const [resolved, setResolved] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [caller, setCaller] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [value, setValue] = useState(500);

  const queue = useMemo(() => calls.map(call => ({ ...call, ...triageCall(call) })).sort((a, b) => b.priorityScore - a.priorityScore), [calls]);
  const visible = queue.filter(item => !resolved.includes(item.id) && (filter === "all" || (filter === "handled" ? item.classification === "handled" : item.classification !== "handled")));
  const selected = queue.find(item => item.id === selectedId);
  const openValue = queue.filter(item => !resolved.includes(item.id) && item.classification !== "handled").reduce((sum, item) => sum + item.estimatedValue, 0);

  async function scanQueue() {
    setError(""); setLoading(true); setScanned(false);
    await new Promise(resolve => setTimeout(resolve, 650));
    if (!calls.length) setError("No call records are available to scan."); else setScanned(true);
    setLoading(false);
  }

  function addCall(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (caller.trim().length < 2) return setError("Caller name must contain at least 2 characters.");
    if (!/^[0-9+() .-]{7,24}$/.test(phone)) return setError("Enter a valid callback number using 7–24 phone characters.");
    if (summary.trim().length < 10) return setError("Call summary must contain at least 10 characters.");
    const item: Call = { id: `demo-${calls.length + 1}`, caller: caller.trim(), phone, minutesAgo: 4, intent: "Manual review", summary: summary.trim(), sentiment, botConfidence: sentiment === "frustrated" ? .35 : .62, estimatedValue: value, requestedQuote: /quote|price|estimate/i.test(summary), afterHours: false };
    setCalls(current => [item, ...current]); setSelectedId(item.id); setFilter("all"); setShowAdd(false); setScanned(true); setCaller(""); setPhone(""); setSummary("");
  }

  return <div className="app-shell">
    <a className="skip" href="#queue">Skip to rescue queue</a>
    <header className="topbar"><a className="brand" href="#top"><span>R</span>RescueLine</a><nav aria-label="Primary"><a className="active" href="#queue">Recovery desk</a><a href="#method">Method</a></nav><div className="demo"><i /> FICTIONAL CALLS · SIMULATED RULES</div></header>
    <main id="top">
      <section className="hero"><div><div className="eyebrow">MISSED REVENUE CONTROL ROOM</div><h1>Your bot missed it.<br /><em>Your team still can’t.</em></h1><p>Turn dropped AI-receptionist calls into a ranked morning recovery queue, with the failure reason and next-best human action attached.</p><button onClick={() => void scanQueue()} disabled={loading}>{loading ? "Analyzing demo calls…" : "Analyze missed calls"}<span aria-hidden="true">→</span></button></div><aside aria-label="Demo queue summary"><small>TODAY · 8:00 AM</small><strong>{queue.filter(i => i.classification !== "handled").length}</strong><span>calls need a human</span><dl><div><dt>Open pipeline</dt><dd>{money(openValue)}</dd></div><div><dt>Call now</dt><dd>{queue.filter(i => i.urgency === "now").length}</dd></div><div><dt>Bot handled</dt><dd>{queue.filter(i => i.classification === "handled").length}</dd></div></dl></aside></section>
      <section className="method" id="method"><div><span>01</span><p><strong>Listen for the break</strong>Detect confusion, frustration, quote intent, and emergency language.</p></div><div><span>02</span><p><strong>Rank the recovery</strong>Combine urgency, call outcome, confidence, and opportunity value.</p></div><div><span>03</span><p><strong>Close the loop</strong>Give a human one action and record a demo resolution.</p></div></section>
      <section className="workspace" id="queue"><div className="section-head"><div><small>RECOVERY DESK 01</small><h2>Morning callback queue</h2></div><p>No live telephony, AI, CRM, messages, bookings, or customer data. Every record and outcome is fictional.</p></div>
        {scanned && <div className="success" role="status">Scan complete: {queue.filter(i => i.classification !== "handled").length} recoverable calls ranked by deterministic demo rules.</div>}
        {error && <div className="error" role="alert">{error}</div>}
        <div className="toolbar"><div className="tabs" role="group" aria-label="Queue filter">{([['rescue','Needs rescue'],['all','All calls'],['handled','Bot handled']] as [Filter,string][]).map(([id,label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}<span>{id === "rescue" ? queue.filter(i => i.classification !== "handled" && !resolved.includes(i.id)).length : id === "handled" ? queue.filter(i => i.classification === "handled").length : queue.length}</span></button>)}</div><button className="add" onClick={() => setShowAdd(value => !value)}>{showAdd ? "Close form" : "+ Add demo call"}</button></div>
        {showAdd && <form className="add-form" onSubmit={addCall}><div><label>Caller name<input aria-label="Caller name" value={caller} onChange={e => setCaller(e.target.value)} placeholder="Jamie R." /></label><label>Callback number<input aria-label="Callback number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 010-1234" /></label></div><label>What happened<textarea aria-label="Call summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="The caller asked for a quote, then disconnected…" /></label><div><label>Sentiment<select aria-label="Caller sentiment" value={sentiment} onChange={e => setSentiment(e.target.value as Sentiment)}><option value="neutral">Neutral</option><option value="frustrated">Frustrated</option><option value="positive">Positive</option></select></label><label>Estimated opportunity<input aria-label="Estimated opportunity" type="number" min="0" max="1000000" value={value} onChange={e => setValue(Number(e.target.value))} /></label><button type="submit">Triage demo call →</button></div></form>}
        <div className="workgrid"><section className="queue-panel" aria-label="Call queue"><div className="queue-head"><span>PRIORITY</span><span>CALLER / FAILURE</span><span>VALUE</span></div>{visible.length ? visible.map(item => <button key={item.id} className={`call-row ${selectedId === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)} aria-pressed={selectedId === item.id}><span className={`score s-${item.urgency}`}>{item.priorityScore}</span><span className="call-copy"><strong>{item.caller}<i className={`tag ${item.classification}`}>{pretty(item.classification)}</i></strong><small>{item.intent} · {item.minutesAgo}m ago</small><em>{item.summary}</em></span><span className="value">{money(item.estimatedValue)}<small>{pretty(item.recommendedAction)}</small></span></button>) : <div className="empty"><strong>Queue clear</strong><p>No calls match this view. Resolve the morning list or change filters.</p></div>}</section>
          <aside className="detail" aria-live="polite">{selected ? <><div className="detail-head"><div><small>CALL REVIEW</small><h3>{selected.caller}</h3><a href={`tel:${selected.phone}`}>{selected.phone}</a></div><span className={`score s-${selected.urgency}`}>{selected.priorityScore}</span></div><div className="transcript"><small>FICTIONAL POST-CALL SUMMARY</small><p>“{selected.summary}”</p></div><dl><div><dt>Bot confidence</dt><dd>{Math.round(selected.botConfidence * 100)}%</dd></div><div><dt>Opportunity</dt><dd>{money(selected.estimatedValue)}</dd></div><div><dt>Queue</dt><dd>{pretty(selected.classification)}</dd></div><div><dt>Response</dt><dd>{pretty(selected.urgency)}</dd></div></dl><div className="signals"><small>WHY IT RANKED</small>{selected.reasons.length ? selected.reasons.map(reason => <span key={reason}>✓ {reason}</span>) : <span>✓ No rescue signal detected</span>}</div><div className="next"><small>NEXT BEST ACTION</small><strong>{selected.recommendedAction === "none" ? "No human follow-up" : `${pretty(selected.recommendedAction)} ${selected.urgency}`}</strong><p>{selected.recommendedAction === "callback" ? "Lead with a human apology, confirm the urgent need, then secure a service window." : selected.recommendedAction === "quote" ? "Send the pricing path promised on the call, then offer a booking link." : selected.recommendedAction === "text" ? "Send a concise check-in and ask whether the caller still needs help." : "The bot completed the caller’s stated task."}</p></div><button className="resolve" disabled={resolved.includes(selected.id) || selected.recommendedAction === "none"} onClick={() => setResolved(current => [...current, selected.id])}>{resolved.includes(selected.id) ? "Resolved in this demo" : "Mark demo action complete"}</button></> : <div className="empty"><strong>Select a call</strong><p>Choose a queue item to inspect the recovery rationale.</p></div>}</aside>
        </div>
      </section>
    </main>
    <footer><a className="brand" href="#top"><span>R</span>RescueLine</a><p>Decision-support prototype only. Humans verify every recommendation before contacting a caller.</p><a href="https://github.com/DrGonzo79/rescueline-20260912">Source & product notes →</a></footer>
  </div>;
}
