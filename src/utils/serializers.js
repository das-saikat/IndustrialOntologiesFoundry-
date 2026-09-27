/**
 * Industrial Ontology Serializers
 * Exports internal ontology graph data to Turtle (.ttl), RDF/XML (.owl), JSON-LD (.jsonld), and N-Triples (.nt)
 */

export function exportToTurtle(ontology) {
  let output = '';
  
  // 1. Prefixes
  const prefixes = ontology.namespaces || {
    bfo: 'http://purl.obolibrary.org/obo/',
    iof: 'https://spec.industrialontologies.org/ontology/core/Core/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    owl: 'http://www.w3.org/2002/07/owl#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  };

  if (!prefixes.rdf) prefixes.rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  if (!prefixes.rdfs) prefixes.rdfs = 'http://www.w3.org/2000/01/rdf-schema#';
  if (!prefixes.owl) prefixes.owl = 'http://www.w3.org/2002/07/owl#';
  if (!prefixes.xsd) prefixes.xsd = 'http://www.w3.org/2001/XMLSchema#';

  for (const [prefix, uri] of Object.entries(prefixes)) {
    output += `@prefix ${prefix}: <${uri}> .\n`;
  }
  output += `@prefix : <${ontology.baseIri || 'https://example.org/ontology/'}> .\n\n`;

  // 2. Ontology Header
  output += `<${ontology.baseIri || 'https://example.org/ontology/'}> a owl:Ontology ;\n`;
  output += `    rdfs:label "${escapeString(ontology.name || 'Industrial Ontology')}" ;\n`;
  output += `    rdfs:comment "${escapeString(ontology.description || '')}" ;\n`;
  output += `    owl:versionInfo "${escapeString(ontology.version || '1.0.0')}" .\n\n`;

  // 3. Helper for IRI compacting
  const formatIri = (iri) => {
    if (!iri) return 'owl:Thing';
    for (const [prefix, uri] of Object.entries(prefixes)) {
      if (iri.startsWith(uri)) {
        return `${prefix}:${iri.substring(uri.length)}`;
      }
    }
    return `<${iri}>`;
  };

  const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));

  // 4. Classes
  output += `# ==========================================\n`;
  output += `# CLASSES (${(ontology.classes || []).length})\n`;
  output += `# ==========================================\n\n`;

  (ontology.classes || []).forEach(cls => {
    const formattedIri = formatIri(cls.iri);
    output += `${formattedIri} a owl:Class ;\n`;
    output += `    rdfs:label "${escapeString(cls.label)}" ;\n`;
    
    if (cls.superclassId && classMap.has(cls.superclassId)) {
      const parentClass = classMap.get(cls.superclassId);
      output += `    rdfs:subClassOf ${formatIri(parentClass.iri)} ;\n`;
    }

    if (cls.definition) {
      output += `    rdfs:comment "${escapeString(cls.definition)}" ;\n`;
    }

    if (cls.annotations) {
      for (const [key, val] of Object.entries(cls.annotations)) {
        if (val) output += `    ${key} "${escapeString(val)}" ;\n`;
      }
    }

    output = output.replace(/ ;\n$/, ' .\n\n');
  });

  // 5. Object Properties
  output += `# ==========================================\n`;
  output += `# OBJECT PROPERTIES (${(ontology.objectProperties || []).length})\n`;
  output += `# ==========================================\n\n`;

  (ontology.objectProperties || []).forEach(op => {
    const formattedIri = formatIri(op.iri);
    const types = ['owl:ObjectProperty'];
    if (op.isTransitive) types.push('owl:TransitiveProperty');
    if (op.isSymmetric) types.push('owl:SymmetricProperty');
    if (op.isFunctional) types.push('owl:FunctionalProperty');

    output += `${formattedIri} a ${types.join(', ')} ;\n`;
    output += `    rdfs:label "${escapeString(op.label)}" ;\n`;

    if (op.domainId && classMap.has(op.domainId)) {
      output += `    rdfs:domain ${formatIri(classMap.get(op.domainId).iri)} ;\n`;
    }
    if (op.rangeId && classMap.has(op.rangeId)) {
      output += `    rdfs:range ${formatIri(classMap.get(op.rangeId).iri)} ;\n`;
    }
    if (op.definition) {
      output += `    rdfs:comment "${escapeString(op.definition)}" ;\n`;
    }

    output = output.replace(/ ;\n$/, ' .\n\n');
  });

  // 6. Data Properties
  output += `# ==========================================\n`;
  output += `# DATA PROPERTIES (${(ontology.dataProperties || []).length})\n`;
  output += `# ==========================================\n\n`;

  (ontology.dataProperties || []).forEach(dp => {
    const formattedIri = formatIri(dp.iri);
    output += `${formattedIri} a owl:DatatypeProperty ;\n`;
    output += `    rdfs:label "${escapeString(dp.label)}" ;\n`;

    if (dp.domainId && classMap.has(dp.domainId)) {
      output += `    rdfs:domain ${formatIri(classMap.get(dp.domainId).iri)} ;\n`;
    }
    if (dp.datatype) {
      output += `    rdfs:range ${dp.datatype.includes(':') ? dp.datatype : 'xsd:' + dp.datatype} ;\n`;
    }
    if (dp.definition) {
      output += `    rdfs:comment "${escapeString(dp.definition)}" ;\n`;
    }

    output = output.replace(/ ;\n$/, ' .\n\n');
  });

  // 7. Asset Individuals
  output += `# ==========================================\n`;
  output += `# INDIVIDUALS & ASSETS (${(ontology.individuals || []).length})\n`;
  output += `# ==========================================\n\n`;

  const indMap = new Map((ontology.individuals || []).map(ind => [ind.id, ind]));

  (ontology.individuals || []).forEach(ind => {
    const formattedIri = formatIri(ind.iri);
    output += `${formattedIri} a owl:NamedIndividual `;

    if (ind.classId && classMap.has(ind.classId)) {
      output += `, ${formatIri(classMap.get(ind.classId).iri)} ;\n`;
    } else {
      output += `;\n`;
    }

    output += `    rdfs:label "${escapeString(ind.label)}" ;\n`;

    // Data property assertions
    if (ind.propertyValues) {
      ind.propertyValues.forEach(pv => {
        const dp = (ontology.dataProperties || []).find(p => p.id === pv.propertyId);
        if (dp) {
          const formattedVal = typeof pv.value === 'boolean' ? pv.value : `"${escapeString(String(pv.value))}"`;
          output += `    ${formatIri(dp.iri)} ${formattedVal} ;\n`;
        }
      });
    }

    // Object property relationships
    if (ind.relationships) {
      ind.relationships.forEach(rel => {
        const op = (ontology.objectProperties || []).find(p => p.id === rel.propertyId);
        const targetInd = indMap.get(rel.targetIndividualId);
        if (op && targetInd) {
          output += `    ${formatIri(op.iri)} ${formatIri(targetInd.iri)} ;\n`;
        }
      });
    }

    output = output.replace(/ ;\n$/, ' .\n\n');
  });

  return output;
}

export function exportToOwlXml(ontology) {
  let xml = `<?xml version="1.0"?>\n`;
  xml += `<rdf:RDF xmlns="${ontology.baseIri || 'https://example.org/ontology/'}"\n`;
  xml += `     xml:base="${ontology.baseIri || 'https://example.org/ontology/'}"\n`;

  const prefixes = ontology.namespaces || {};
  for (const [prefix, uri] of Object.entries(prefixes)) {
    xml += `     xmlns:${prefix}="${uri}"\n`;
  }
  xml += `     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n`;
  xml += `     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"\n`;
  xml += `     xmlns:owl="http://www.w3.org/2002/07/owl#"\n`;
  xml += `     xmlns:xsd="http://www.w3.org/2001/XMLSchema#">\n\n`;

  xml += `  <owl:Ontology rdf:about="${ontology.baseIri || 'https://example.org/ontology/'}">\n`;
  xml += `    <rdfs:label>${escapeXml(ontology.name || 'Industrial Ontology')}</rdfs:label>\n`;
  xml += `    <rdfs:comment>${escapeXml(ontology.description || '')}</rdfs:comment>\n`;
  xml += `    <owl:versionInfo>${escapeXml(ontology.version || '1.0.0')}</owl:versionInfo>\n`;
  xml += `  </owl:Ontology>\n\n`;

  const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));

  // Classes
  (ontology.classes || []).forEach(cls => {
    xml += `  <owl:Class rdf:about="${escapeXml(cls.iri)}">\n`;
    xml += `    <rdfs:label>${escapeXml(cls.label)}</rdfs:label>\n`;
    if (cls.superclassId && classMap.has(cls.superclassId)) {
      xml += `    <rdfs:subClassOf rdf:resource="${escapeXml(classMap.get(cls.superclassId).iri)}"/>\n`;
    }
    if (cls.definition) {
      xml += `    <rdfs:comment>${escapeXml(cls.definition)}</rdfs:comment>\n`;
    }
    xml += `  </owl:Class>\n\n`;
  });

  // Object Properties
  (ontology.objectProperties || []).forEach(op => {
    xml += `  <owl:ObjectProperty rdf:about="${escapeXml(op.iri)}">\n`;
    xml += `    <rdfs:label>${escapeXml(op.label)}</rdfs:label>\n`;
    if (op.domainId && classMap.has(op.domainId)) {
      xml += `    <rdfs:domain rdf:resource="${escapeXml(classMap.get(op.domainId).iri)}"/>\n`;
    }
    if (op.rangeId && classMap.has(op.rangeId)) {
      xml += `    <rdfs:range rdf:resource="${escapeXml(classMap.get(op.rangeId).iri)}"/>\n`;
    }
    xml += `  </owl:ObjectProperty>\n\n`;
  });

  // Data Properties
  (ontology.dataProperties || []).forEach(dp => {
    xml += `  <owl:DatatypeProperty rdf:about="${escapeXml(dp.iri)}">\n`;
    xml += `    <rdfs:label>${escapeXml(dp.label)}</rdfs:label>\n`;
    if (dp.domainId && classMap.has(dp.domainId)) {
      xml += `    <rdfs:domain rdf:resource="${escapeXml(classMap.get(dp.domainId).iri)}"/>\n`;
    }
    xml += `  </owl:DatatypeProperty>\n\n`;
  });

  // Individuals
  const indMap = new Map((ontology.individuals || []).map(ind => [ind.id, ind]));

  (ontology.individuals || []).forEach(ind => {
    xml += `  <owl:NamedIndividual rdf:about="${escapeXml(ind.iri)}">\n`;
    xml += `    <rdfs:label>${escapeXml(ind.label)}</rdfs:label>\n`;
    if (ind.classId && classMap.has(ind.classId)) {
      xml += `    <rdf:type rdf:resource="${escapeXml(classMap.get(ind.classId).iri)}"/>\n`;
    }

    if (ind.relationships) {
      ind.relationships.forEach(rel => {
        const op = (ontology.objectProperties || []).find(p => p.id === rel.propertyId);
        const targetInd = indMap.get(rel.targetIndividualId);
        if (op && targetInd) {
          xml += `    <ns:${op.id} xmlns:ns="${op.iri}" rdf:resource="${escapeXml(targetInd.iri)}"/>\n`;
        }
      });
    }

    xml += `  </owl:NamedIndividual>\n\n`;
  });

  xml += `</rdf:RDF>`;
  return xml;
}

export function exportToJsonLd(ontology) {
  const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));

  const context = {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    owl: 'http://www.w3.org/2002/07/owl#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    label: 'rdfs:label',
    comment: 'rdfs:comment',
    subClassOf: { '@id': 'rdfs:subClassOf', '@type': '@id' },
    domain: { '@id': 'rdfs:domain', '@type': '@id' },
    range: { '@id': 'rdfs:range', '@type': '@id' },
    ...ontology.namespaces
  };

  const graph = [];

  // Ontology node
  graph.push({
    '@id': ontology.baseIri || 'https://example.org/ontology/',
    '@type': 'owl:Ontology',
    label: ontology.name,
    comment: ontology.description,
    'owl:versionInfo': ontology.version
  });

  // Classes
  (ontology.classes || []).forEach(cls => {
    const item = {
      '@id': cls.iri,
      '@type': 'owl:Class',
      label: cls.label
    };
    if (cls.superclassId && classMap.has(cls.superclassId)) {
      item.subClassOf = classMap.get(cls.superclassId).iri;
    }
    if (cls.definition) item.comment = cls.definition;
    graph.push(item);
  });

  // Object Properties
  (ontology.objectProperties || []).forEach(op => {
    const item = {
      '@id': op.iri,
      '@type': 'owl:ObjectProperty',
      label: op.label
    };
    if (op.domainId && classMap.has(op.domainId)) {
      item.domain = classMap.get(op.domainId).iri;
    }
    if (op.rangeId && classMap.has(op.rangeId)) {
      item.range = classMap.get(op.rangeId).iri;
    }
    graph.push(item);
  });

  // Data Properties
  (ontology.dataProperties || []).forEach(dp => {
    const item = {
      '@id': dp.iri,
      '@type': 'owl:DatatypeProperty',
      label: dp.label
    };
    if (dp.domainId && classMap.has(dp.domainId)) {
      item.domain = classMap.get(dp.domainId).iri;
    }
    graph.push(item);
  });

  // Individuals
  const indMap = new Map((ontology.individuals || []).map(ind => [ind.id, ind]));

  (ontology.individuals || []).forEach(ind => {
    const item = {
      '@id': ind.iri,
      '@type': ['owl:NamedIndividual'],
      label: ind.label
    };

    if (ind.classId && classMap.has(ind.classId)) {
      item['@type'].push(classMap.get(ind.classId).iri);
    }

    if (ind.propertyValues) {
      ind.propertyValues.forEach(pv => {
        const dp = (ontology.dataProperties || []).find(p => p.id === pv.propertyId);
        if (dp) {
          item[dp.iri] = pv.value;
        }
      });
    }

    if (ind.relationships) {
      ind.relationships.forEach(rel => {
        const op = (ontology.objectProperties || []).find(p => p.id === rel.propertyId);
        const targetInd = indMap.get(rel.targetIndividualId);
        if (op && targetInd) {
          item[op.iri] = { '@id': targetInd.iri };
        }
      });
    }

    graph.push(item);
  });

  return JSON.stringify({ '@context': context, '@graph': graph }, null, 2);
}

export function exportToNTriples(ontology) {
  let output = '';
  const classMap = new Map((ontology.classes || []).map(c => [c.id, c]));

  (ontology.classes || []).forEach(cls => {
    output += `<${cls.iri}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .\n`;
    output += `<${cls.iri}> <http://www.w3.org/2000/01/rdf-schema#label> "${escapeString(cls.label)}" .\n`;
    if (cls.superclassId && classMap.has(cls.superclassId)) {
      output += `<${cls.iri}> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <${classMap.get(cls.superclassId).iri}> .\n`;
    }
  });

  return output;
}

function escapeString(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
