import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

export default function ClassEditorModal({ initialClass, parentClassId, ontology, onClose, onSave }) {
  const [label, setLabel] = useState(initialClass ? initialClass.label : '');
  const [iri, setIri] = useState(initialClass ? initialClass.iri : '');
  const [superclassId, setSuperclassId] = useState(
    initialClass ? initialClass.superclassId : (parentClassId || 'bfo_MaterialEntity')
  );
  const [bfoTier, setBfoTier] = useState(initialClass ? initialClass.bfoTier : 'Domain Level');
  const [definition, setDefinition] = useState(initialClass ? initialClass.definition : '');

  // Auto-generate IRI from label
  useEffect(() => {
    if (!initialClass && label && !iri) {
      const sanitized = label.replace(/[^a-zA-Z0-9]/g, '');
      const base = ontology.baseIri || 'https://example.org/ontology/';
      setIri(`${base}${sanitized}`);
    }
  }, [label, initialClass]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    const classData = {
      id: initialClass ? initialClass.id : 'cls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      label,
      iri: iri || `${ontology.baseIri || 'https://example.org/ontology/'}${label.replace(/\s+/g, '')}`,
      superclassId,
      bfoTier,
      definition
    };

    onSave(classData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel" style={{ width: 500, maxWidth: '95%', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {initialClass ? 'Edit Ontology Class' : 'Create New Ontology Class'}
          </h3>
          <button className="btn-secondary" style={{ padding: '0.3rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              CLASS LABEL *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. CNC Milling Machine, Spindle Bearing"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              FULL IRI / URI
            </label>
            <input 
              type="text" 
              placeholder="https://spec.industrialontologies.org/..."
              value={iri}
              onChange={(e) => setIri(e.target.value)}
              className="input-field"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                SUPERCLASS (subClassOf)
              </label>
              <select 
                value={superclassId} 
                onChange={(e) => setSuperclassId(e.target.value)}
                className="input-field"
              >
                <option value="">None (Root Entity)</option>
                {(ontology.classes || []).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.bfoTier || 'Class'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                BFO / IOF TIER
              </label>
              <select 
                value={bfoTier} 
                onChange={(e) => setBfoTier(e.target.value)}
                className="input-field"
              >
                <option value="Top-Level (BFO)">Top-Level (BFO)</option>
                <option value="Mid-Level (IOF Core)">Mid-Level (IOF Core)</option>
                <option value="Domain Level">Domain Level</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              NATURAL LANGUAGE DEFINITION
            </label>
            <textarea 
              rows={3}
              placeholder="Clear, computer-readable definition explaining what this class represents..."
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Save Class</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
