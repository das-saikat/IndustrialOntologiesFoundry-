import React, { useState } from 'react';
import { exportToTurtle, exportToOwlXml, exportToJsonLd, exportToNTriples } from '../utils/serializers';
import { FileCode, Copy, Check, Download, Layers } from 'lucide-react';

export default function CodeStudio({ ontology }) {
  const [format, setFormat] = useState('turtle');
  const [copied, setCopied] = useState(false);

  let code = '';
  let filename = (ontology.name || 'ontology').toLowerCase().replace(/[^a-z0-9]/g, '_');
  let mimeType = 'text/plain';

  switch (format) {
    case 'turtle':
      code = exportToTurtle(ontology);
      filename += '.ttl';
      mimeType = 'text/turtle';
      break;
    case 'owl':
      code = exportToOwlXml(ontology);
      filename += '.owl';
      mimeType = 'application/rdf+xml';
      break;
    case 'jsonld':
      code = exportToJsonLd(ontology);
      filename += '.jsonld';
      mimeType = 'application/ld+json';
      break;
    case 'ntriples':
      code = exportToNTriples(ontology);
      filename += '.nt';
      mimeType = 'text/plain';
      break;
    default:
      code = exportToTurtle(ontology);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Ontology Code Studio</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time computer-readable W3C semantic web code generation.</p>
        </div>

        {/* Format Selector & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            {[
              { id: 'turtle', label: 'Turtle (.ttl)' },
              { id: 'owl', label: 'OWL / XML (.owl)' },
              { id: 'jsonld', label: 'JSON-LD (.jsonld)' },
              { id: 'ntriples', label: 'N-Triples (.nt)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: format === f.id ? 'var(--accent-cyan)' : 'transparent',
                  color: format === f.id ? '#040914' : 'var(--text-muted)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button className="btn-primary" onClick={handleDownload}>
            <Download size={14} />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Code Editor Preview Window */}
      <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#070a14', borderRadius: 12 }}>
        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#38bdf8', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {code}
        </pre>
      </div>
    </div>
  );
}
