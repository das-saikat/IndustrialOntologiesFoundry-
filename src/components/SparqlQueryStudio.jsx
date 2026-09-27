import React, { useState } from 'react';
import { Play, Sparkles, Database, FileText, CheckCircle, Code } from 'lucide-react';

export default function SparqlQueryStudio({ ontology }) {
  const PRESET_QUERIES = [
    {
      id: 'q1',
      title: 'Find All Equipment & Machines',
      sparql: `PREFIX iof: <https://spec.industrialontologies.org/ontology/core/Core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?asset ?label ?type WHERE {
  ?asset a/rdfs:subClassOf* iof:Asset ;
         rdfs:label ?label .
}`,
      execute: (ont) => {
        return (ont.individuals || [])
          .map(ind => ({
            asset: ind.iri,
            label: ind.label,
            type: (ont.classes || []).find(c => c.id === ind.classId)?.label || 'Asset'
          }));
      }
    },
    {
      id: 'q2',
      title: 'List All Maintenance Work Orders',
      sparql: `PREFIX iof_maint: <https://spec.industrialontologies.org/ontology/maintenance/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?workOrder ?label ?status WHERE {
  ?workOrder a iof_maint:MaintenanceWorkOrder ;
             rdfs:label ?label .
}`,
      execute: (ont) => {
        return (ont.individuals || [])
          .filter(ind => ind.classId === 'iof_MaintenanceWorkOrder')
          .map(ind => ({
            workOrder: ind.iri,
            label: ind.label,
            status: 'Authorized / Active'
          }));
      }
    },
    {
      id: 'q3',
      title: 'Class Hierarchy & BFO Top-Level Mapping',
      sparql: `PREFIX bfo: <http://purl.obolibrary.org/obo/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?class ?label ?bfoTier WHERE {
  ?class rdfs:subClassOf* bfo:Entity ;
         rdfs:label ?label .
}`,
      execute: (ont) => {
        return (ont.classes || []).map(cls => ({
          class: cls.iri,
          label: cls.label,
          bfoTier: cls.bfoTier || 'Domain Level'
        }));
      }
    }
  ];

  const [queryText, setQueryText] = useState(PRESET_QUERIES[0].sparql);
  const [activePreset, setActivePreset] = useState(PRESET_QUERIES[0].id);
  const [results, setResults] = useState(PRESET_QUERIES[0].execute(ontology));

  const handleRunQuery = () => {
    const preset = PRESET_QUERIES.find(q => q.id === activePreset);
    if (preset) {
      setResults(preset.execute(ontology));
    } else {
      // General fallback query over individuals/classes
      const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));
      const res = (ontology.individuals || []).map(ind => ({
        entity: ind.iri,
        label: ind.label,
        typeClass: classMap.get(ind.classId)?.label || 'Individual'
      }));
      setResults(res);
    }
  };

  const handleSelectPreset = (p) => {
    setActivePreset(p.id);
    setQueryText(p.sparql);
    setResults(p.execute(ontology));
  };

  return (
    <div style={{ padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Semantic SPARQL Query Engine</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Query industrial knowledge graph entities, maintenance logs, and BFO top-level relationships.</p>
      </div>

      {/* Preset Query Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {PRESET_QUERIES.map(p => (
          <div 
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className="glass-panel"
            style={{
              padding: '0.8rem 1rem',
              cursor: 'pointer',
              border: activePreset === p.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              background: activePreset === p.id ? 'rgba(0,242,254,0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: activePreset === p.id ? 'var(--accent-cyan)' : 'var(--text-main)', fontSize: '0.88rem' }}>
              <Database size={16} />
              <span>{p.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Query Console */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Code size={16} color="var(--accent-cyan)" />
            <span>SPARQL 1.1 QUERY CONSOLE</span>
          </div>
          <button className="btn-primary" onClick={handleRunQuery}>
            <Play size={14} />
            <span>Execute Query</span>
          </button>
        </div>

        <textarea 
          rows={6}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          className="input-field"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: '#070a14', color: '#38bdf8', lineHeight: 1.5 }}
        />
      </div>

      {/* Results Table */}
      <div className="glass-panel" style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>
          <CheckCircle size={16} />
          <span>QUERY RESULTS ({results.length} MATCHES)</span>
        </div>

        {results.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matching triples found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                {Object.keys(results[0]).map(key => (
                  <th key={key} style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>?{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} style={{ padding: '0.6rem 0.8rem', color: String(val).startsWith('http') ? 'var(--accent-cyan)' : 'var(--text-main)', fontFamily: String(val).startsWith('http') ? 'var(--font-mono)' : 'inherit' }}>
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
