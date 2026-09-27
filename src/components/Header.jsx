import React, { useState } from 'react';
import { 
  Boxes, Save, Download, Plus, Sparkles, Layers, FileCode, CheckCircle2, 
  RotateCcw, Moon, Sun, ChevronDown 
} from 'lucide-react';
import { exportToTurtle, exportToOwlXml, exportToJsonLd, exportToNTriples } from '../utils/serializers';
import { ONTOLOGY_TEMPLATES } from '../data/templates';

export default function Header({ 
  ontology, 
  allOntologies, 
  onSelectOntology, 
  onLoadTemplate, 
  isSaving, 
  theme, 
  onToggleTheme,
  onOpenCreateModal 
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExport = (format) => {
    const filenameBase = (ontology.name || 'industrial_ontology').toLowerCase().replace(/[^a-z0-9]/g, '_');
    switch (format) {
      case 'turtle':
        downloadFile(exportToTurtle(ontology), `${filenameBase}.ttl`, 'text/turtle');
        break;
      case 'owl':
        downloadFile(exportToOwlXml(ontology), `${filenameBase}.owl`, 'application/rdf+xml');
        break;
      case 'jsonld':
        downloadFile(exportToJsonLd(ontology), `${filenameBase}.jsonld`, 'application/ld+json');
        break;
      case 'ntriples':
        downloadFile(exportToNTriples(ontology), `${filenameBase}.nt`, 'text/plain');
        break;
      case 'json':
        downloadFile(JSON.stringify(ontology, null, 2), `${filenameBase}_backup.json`, 'application/json');
        break;
      default:
        break;
    }
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', zIndex: 100 }}>
      {/* Brand & Active Ontology */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #00f2fe, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)' }}>
            <Boxes size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                IOF Studio
              </h1>
              <span className="badge badge-iof" style={{ fontSize: '0.65rem' }}>BFO / IOF 2026</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Industrial Ontology Studio & Repository</p>
          </div>
        </div>

        <div style={{ height: 28, width: 1, background: 'var(--border-color)', margin: '0 0.25rem' }} />

        {/* Ontology Picker */}
        <div style={{ position: 'relative' }}>
          <select 
            value={ontology.id} 
            onChange={(e) => onSelectOntology(e.target.value)}
            className="input-field"
            style={{ width: '240px', fontWeight: 600, paddingRight: '2rem', cursor: 'pointer', background: 'var(--bg-tertiary)' }}
          >
            {allOntologies.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} (v{o.version || '1.0'})
              </option>
            ))}
          </select>
        </div>

        {/* Auto Save Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: isSaving ? 'var(--accent-amber)' : 'var(--accent-emerald)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: 6 }}>
          {isSaving ? (
            <>
              <RotateCcw size={12} className="spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} />
              <span>Saved locally</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Quick Add Class/Property/Individual Button */}
        <button className="btn-primary" onClick={onOpenCreateModal}>
          <Plus size={16} />
          <span>New Entity</span>
        </button>

        {/* Template Starter Selector */}
        <div style={{ position: 'relative' }}>
          <button className="btn-secondary" onClick={() => setShowTemplateMenu(!showTemplateMenu)}>
            <Layers size={16} />
            <span>Templates</span>
            <ChevronDown size={14} />
          </button>

          {showTemplateMenu && (
            <div className="glass-panel" style={{ position: 'absolute', top: '110%', right: 0, width: 320, padding: '0.5rem', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.6rem' }}>
                LOAD INDUSTRIAL TEMPLATE
              </div>
              {ONTOLOGY_TEMPLATES.map(t => (
                <div 
                  key={t.id}
                  onClick={() => { onLoadTemplate(t); setShowTemplateMenu(false); }}
                  style={{ padding: '0.6rem', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export & Download Menu */}
        <div style={{ position: 'relative' }}>
          <button className="btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
            <Download size={16} />
            <span>Download</span>
            <ChevronDown size={14} />
          </button>

          {showExportMenu && (
            <div className="glass-panel" style={{ position: 'absolute', top: '110%', right: 0, width: 220, padding: '0.5rem', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.6rem' }}>
                DOWNLOAD FORMATS
              </div>
              <button 
                onClick={() => handleExport('turtle')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileCode size={14} color="var(--accent-cyan)" />
                <span>Turtle (.ttl)</span>
              </button>
              <button 
                onClick={() => handleExport('owl')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileCode size={14} color="var(--accent-violet)" />
                <span>W3C OWL / XML (.owl)</span>
              </button>
              <button 
                onClick={() => handleExport('jsonld')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileCode size={14} color="var(--accent-emerald)" />
                <span>JSON-LD (.jsonld)</span>
              </button>
              <button 
                onClick={() => handleExport('ntriples')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileCode size={14} color="var(--accent-amber)" />
                <span>N-Triples (.nt)</span>
              </button>
              <div style={{ height: 1, background: 'var(--border-color)', margin: '0.3rem 0' }} />
              <button 
                onClick={() => handleExport('json')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Save size={14} color="var(--text-muted)" />
                <span>Project JSON Backup</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={onToggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-violet)" />}
        </button>
      </div>
    </header>
  );
}
