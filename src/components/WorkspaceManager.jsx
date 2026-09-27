import React, { useRef, useState } from 'react';
import { 
  FolderKanban, Plus, Download, Upload, Copy, Trash2, Edit3, Save, Layers, Clock 
} from 'lucide-react';
import { exportWorkspaceBackup, importWorkspaceBackup } from '../utils/storage';

export default function WorkspaceManager({ 
  allOntologies, 
  activeOntologyId, 
  onSelectOntology, 
  onCreateNewOntology, 
  onDeleteOntology, 
  onReload 
}) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditingName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importedId = await importWorkspaceBackup(text);
      if (onReload) await onReload();
      onSelectOntology(importedId);
      setImportError('');
    } catch (err) {
      setImportError('Failed to import JSON file: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Industrial Ontology Workspace Manager</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage local saved ontologies, create new projects, backup workspace, or import external files.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="btn-secondary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <Upload size={14} />
            <span>Import JSON</span>
          </button>
          <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />

          <button className="btn-secondary" onClick={exportWorkspaceBackup}>
            <Download size={14} />
            <span>Export Full Backup</span>
          </button>

          <button className="btn-primary" onClick={onCreateNewOntology}>
            <Plus size={16} />
            <span>New Blank Ontology</span>
          </button>
        </div>
      </div>

      {importError && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem' }}>
          {importError}
        </div>
      )}

      {/* Grid of Saved Ontologies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {allOntologies.map(ont => {
          const isActive = ont.id === activeOntologyId;
          const classCount = (ont.classes || []).length;
          const individualCount = (ont.individuals || []).length;

          return (
            <div 
              key={ont.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                border: isActive ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(0, 242, 254, 0.05)' : 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isActive ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                    {ont.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>v{ont.version || '1.0.0'}</div>
                </div>

                {isActive && (
                  <span className="badge badge-iof" style={{ fontSize: '0.65rem' }}>ACTIVE</span>
                )}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, minHeight: 36 }}>
                {ont.description || 'No description provided.'}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
                <div>Classes: <strong style={{ color: 'var(--accent-cyan)' }}>{classCount}</strong></div>
                <div>Relations: <strong style={{ color: 'var(--accent-violet)' }}>{(ont.objectProperties || []).length}</strong></div>
                <div>Assets: <strong style={{ color: 'var(--accent-amber)' }}>{individualCount}</strong></div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                {!isActive && (
                  <button className="btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => onSelectOntology(ont.id)}>
                    Open Workspace
                  </button>
                )}
                {allOntologies.length > 1 && (
                  <button className="btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => onDeleteOntology(ont.id)} title="Delete Project">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
