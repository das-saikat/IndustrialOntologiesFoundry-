import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function IndividualEditorModal({ initialIndividual, ontology, onClose, onSave }) {
  const [label, setLabel] = useState(initialIndividual ? initialIndividual.label : '');
  const [iri, setIri] = useState(initialIndividual ? initialIndividual.iri : '');
  const [classId, setClassId] = useState(initialIndividual ? initialIndividual.classId : '');
  
  // Property assertions
  const [propertyValues, setPropertyValues] = useState(
    initialIndividual ? (initialIndividual.propertyValues || []) : []
  );

  // Relationships
  const [relationships, setRelationships] = useState(
    initialIndividual ? (initialIndividual.relationships || []) : []
  );

  const addPropertyValue = () => {
    const defaultDp = (ontology.dataProperties || [])[0];
    if (defaultDp) {
      setPropertyValues([...propertyValues, { propertyId: defaultDp.id, value: '' }]);
    }
  };

  const removePropertyValue = (idx) => {
    setPropertyValues(propertyValues.filter((_, i) => i !== idx));
  };

  const addRelationship = () => {
    const defaultOp = (ontology.objectProperties || [])[0];
    const defaultTarget = (ontology.individuals || [])[0];
    if (defaultOp) {
      setRelationships([...relationships, { propertyId: defaultOp.id, targetIndividualId: defaultTarget ? defaultTarget.id : '' }]);
    }
  };

  const removeRelationship = (idx) => {
    setRelationships(relationships.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    const baseIri = ontology.baseIri || 'https://example.org/ontology/';
    const computedIri = iri || `${baseIri}${label.replace(/\s+/g, '_')}`;

    onSave({
      id: initialIndividual ? initialIndividual.id : 'ind_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      label,
      iri: computedIri,
      classId,
      propertyValues,
      relationships,
      entityType: 'individual'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel" style={{ width: 560, maxWidth: '95%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {initialIndividual ? 'Edit Asset Individual' : 'Instantiate Industrial Asset'}
          </h3>
          <button className="btn-secondary" style={{ padding: '0.3rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              ASSET / INDIVIDUAL LABEL *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. CNC_Milling_Machine_01, Spindle_Bearing_A"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              CLASSIFICATION (rdf:type Class)
            </label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="input-field">
              <option value="">Select Target Class...</option>
              {(ontology.classes || []).map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              FULL IRI
            </label>
            <input 
              type="text" 
              placeholder="https://example.org/asset/..."
              value={iri}
              onChange={(e) => setIri(e.target.value)}
              className="input-field"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
          </div>

          {/* Data Property Values */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                DATA PROPERTY ASSERTIONS
              </label>
              <button type="button" className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={addPropertyValue}>
                <Plus size={12} />
                <span>Add Value</span>
              </button>
            </div>

            {propertyValues.map((pv, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <select 
                  value={pv.propertyId} 
                  onChange={(e) => {
                    const next = [...propertyValues];
                    next[idx].propertyId = e.target.value;
                    setPropertyValues(next);
                  }}
                  className="input-field"
                  style={{ flex: 1 }}
                >
                  {(ontology.dataProperties || []).map(dp => (
                    <option key={dp.id} value={dp.id}>{dp.label}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Value..." 
                  value={pv.value}
                  onChange={(e) => {
                    const next = [...propertyValues];
                    next[idx].value = e.target.value;
                    setPropertyValues(next);
                  }}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-danger" onClick={() => removePropertyValue(idx)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Relationships */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                RELATIONSHIP LINKS
              </label>
              <button type="button" className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={addRelationship}>
                <Plus size={12} />
                <span>Add Relationship</span>
              </button>
            </div>

            {relationships.map((rel, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <select 
                  value={rel.propertyId} 
                  onChange={(e) => {
                    const next = [...relationships];
                    next[idx].propertyId = e.target.value;
                    setRelationships(next);
                  }}
                  className="input-field"
                  style={{ flex: 1 }}
                >
                  {(ontology.objectProperties || []).map(op => (
                    <option key={op.id} value={op.id}>{op.label}</option>
                  ))}
                </select>
                <select 
                  value={rel.targetIndividualId} 
                  onChange={(e) => {
                    const next = [...relationships];
                    next[idx].targetIndividualId = e.target.value;
                    setRelationships(next);
                  }}
                  className="input-field"
                  style={{ flex: 1 }}
                >
                  <option value="">Target Asset...</option>
                  {(ontology.individuals || []).map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.label}</option>
                  ))}
                </select>
                <button type="button" className="btn-danger" onClick={() => removeRelationship(idx)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Save Individual</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
