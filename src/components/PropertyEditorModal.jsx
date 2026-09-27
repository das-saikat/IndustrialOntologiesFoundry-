import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function PropertyEditorModal({ initialProperty, propertyType, ontology, onClose, onSave }) {
  const [type, setType] = useState(propertyType || (initialProperty?.datatype ? 'data' : 'object'));
  const [label, setLabel] = useState(initialProperty ? initialProperty.label : '');
  const [iri, setIri] = useState(initialProperty ? initialProperty.iri : '');
  const [domainId, setDomainId] = useState(initialProperty ? initialProperty.domainId : '');
  const [rangeId, setRangeId] = useState(initialProperty ? initialProperty.rangeId : '');
  const [datatype, setDatatype] = useState(initialProperty ? initialProperty.datatype : 'xsd:string');
  const [definition, setDefinition] = useState(initialProperty ? initialProperty.definition : '');
  const [isTransitive, setIsTransitive] = useState(initialProperty ? !!initialProperty.isTransitive : false);
  const [isSymmetric, setIsSymmetric] = useState(initialProperty ? !!initialProperty.isSymmetric : false);
  const [isFunctional, setIsFunctional] = useState(initialProperty ? !!initialProperty.isFunctional : false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    const baseIri = ontology.baseIri || 'https://example.org/ontology/';
    const computedIri = iri || `${baseIri}${label.replace(/\s+/g, '')}`;

    if (type === 'object') {
      onSave({
        id: initialProperty ? initialProperty.id : 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        label,
        iri: computedIri,
        domainId,
        rangeId,
        definition,
        isTransitive,
        isSymmetric,
        isFunctional,
        propertyKind: 'object'
      });
    } else {
      onSave({
        id: initialProperty ? initialProperty.id : 'dp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        label,
        iri: computedIri,
        domainId,
        datatype,
        definition,
        propertyKind: 'data'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel" style={{ width: 500, maxWidth: '95%', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {initialProperty ? 'Edit Property' : 'Create New Relationship Property'}
          </h3>
          <button className="btn-secondary" style={{ padding: '0.3rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!initialProperty && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                PROPERTY TYPE
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="radio" name="ptype" value="object" checked={type === 'object'} onChange={() => setType('object')} />
                  <span>Object Property (Links Class to Class)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="radio" name="ptype" value="data" checked={type === 'data'} onChange={() => setType('data')} />
                  <span>Data Property (Literal Attribute)</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              PROPERTY LABEL *
            </label>
            <input 
              type="text" 
              required
              placeholder={type === 'object' ? 'e.g. hasPart, isLocatedIn, triggersWorkOrder' : 'e.g. serialNumber, operatingHours'}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              FULL IRI
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
                DOMAIN CLASS (Source)
              </label>
              <select value={domainId} onChange={(e) => setDomainId(e.target.value)} className="input-field">
                <option value="">Any Class (owl:Thing)</option>
                {(ontology.classes || []).map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {type === 'object' ? (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  RANGE CLASS (Target)
                </label>
                <select value={rangeId} onChange={(e) => setRangeId(e.target.value)} className="input-field">
                  <option value="">Any Class (owl:Thing)</option>
                  {(ontology.classes || []).map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  DATATYPE RANGE
                </label>
                <select value={datatype} onChange={(e) => setDatatype(e.target.value)} className="input-field">
                  <option value="xsd:string">xsd:string (Text)</option>
                  <option value="xsd:float">xsd:float (Decimal)</option>
                  <option value="xsd:integer">xsd:integer (Whole Number)</option>
                  <option value="xsd:boolean">xsd:boolean (True/False)</option>
                  <option value="xsd:dateTime">xsd:dateTime (Timestamp)</option>
                </select>
              </div>
            )}
          </div>

          {type === 'object' && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isTransitive} onChange={(e) => setIsTransitive(e.target.checked)} />
                <span>Transitive</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isSymmetric} onChange={(e) => setIsSymmetric(e.target.checked)} />
                <span>Symmetric</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFunctional} onChange={(e) => setIsFunctional(e.target.checked)} />
                <span>Functional</span>
              </label>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              DEFINITION
            </label>
            <textarea 
              rows={2}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Save Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
