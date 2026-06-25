import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import { MOCK_FAQS } from '../data/mockData';

export default function Help() {
  const { isAuthenticated } = useAuth();

  const [query, setQuery]   = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_FAQS;
    const q = query.toLowerCase();
    return MOCK_FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  function toggleFaq(id) {
    setOpenFaq((cur) => (cur === id ? null : id));
  }

  return (
    <div className="help-page page-enter">
      {isAuthenticated ? <TopNav /> : (
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--gray-200)', background:'var(--white)' }}>
          <Brand />
        </div>
      )}

      {/* Hero */}
      <div className="help-hero">
        <h1>How can we help?</h1>
        <p>Search our knowledge base or browse common questions below.</p>
        <div className="search-bar-wrap">
          <input
            type="search"
            className="search-bar"
            placeholder="Search for answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles"
          />
          <button className="search-icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
      </div>

      <div className="help-body">
        {/* FAQ */}
        <div className="faq-section">
          <p className="section-title">Frequently Asked Questions</p>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--gray-500)', fontSize:14 }}>
              <p>No results for "<strong>{query}</strong>". Try a different search term.</p>
            </div>
          ) : (
            <div className="faq-list" role="list">
              {filtered.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div className="faq-item" key={faq.id} role="listitem">
                    <button
                      className={`faq-question${isOpen ? ' open' : ''}`}
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      id={`faq-btn-${faq.id}`}
                    >
                      <span>{faq.q}</span>
                      <ChevronIcon />
                    </button>
                    {isOpen && (
                      <div
                        className="faq-answer"
                        id={`faq-answer-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${faq.id}`}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Options */}
        <p className="section-title">Contact Support</p>
        <div className="contact-grid">
          {[
            { icon: <ChatIcon />, title:'Live Chat', desc:'Available Mon–Fri, 8am–8pm ET', href:'#' },
            { icon: <MailIcon />, title:'Email Support', desc:'Response within 1–2 business days', href:'#' },
            { icon: <PhoneIcon />, title:'Call Us', desc:'1-800-CHASE (24/7)', href:'tel:18006242427' },
          ].map((c) => (
            <a key={c.title} href={c.href} className="contact-card">
              <div className="contact-icon">{c.icon}</div>
              <p className="contact-title">{c.title}</p>
              <p className="contact-desc">{c.desc}</p>
            </a>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:40 }}>
          {isAuthenticated
            ? <Link to="/dashboard" className="link link-sm">← Back to Dashboard</Link>
            : <Link to="/signin"    className="link link-sm">← Back to Sign In</Link>
          }
        </div>
      </div>
    </div>
  );
}

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
);
const svgBase = { stroke:'currentColor', fill:'none', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
const ChatIcon  = () => <svg viewBox="0 0 24 24" style={svgBase}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const MailIcon  = () => <svg viewBox="0 0 24 24" style={svgBase}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" style={svgBase}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l1.37-1.37a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z"/></svg>;
