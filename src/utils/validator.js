/**
 * Industrial Ontology Validator & Quality Engine
 * Evaluates completeness, BFO 2020 alignment, orphan classes, missing definitions, and domain/range consistency.
 */

export function validateOntology(ontology) {
  const issues = [];
  let score = 100;

  const classes = ontology.classes || [];
  const objectProps = ontology.objectProperties || [];
  const dataProps = ontology.dataProperties || [];
  const individuals = ontology.individuals || [];

  const classMap = new Map(classes.map(c => [c.id, c]));
  const iriMap = new Map();

  // 1. IRI Uniqueness Check
  const checkIriUniqueness = (entities, type) => {
    entities.forEach(item => {
      if (!item.iri) return;
      if (iriMap.has(item.iri)) {
        issues.push({
          severity: 'error',
          code: 'DUPLICATE_IRI',
          entityId: item.id,
          entityLabel: item.label,
          type,
          message: `Duplicate IRI detected: "${item.iri}" used by both "${item.label}" and "${iriMap.get(item.iri).label}".`
        });
        score -= 10;
      } else {
        iriMap.set(item.iri, item);
      }
    });
  };

  checkIriUniqueness(classes, 'Class');
  checkIriUniqueness(objectProps, 'ObjectProperty');
  checkIriUniqueness(dataProps, 'DataProperty');
  checkIriUniqueness(individuals, 'Individual');

  // 2. Class Definitions & Superclass Checks
  classes.forEach(cls => {
    // Missing definition warning
    if (!cls.definition || cls.definition.trim().length === 0) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_DEFINITION',
        entityId: cls.id,
        entityLabel: cls.label,
        type: 'Class',
        message: `Class "${cls.label}" lacks a natural language definition.`
      });
      score -= 2;
    }

    // Orphan Class check (no superclass except root Entity)
    if (cls.id !== 'bfo_Entity' && !cls.superclassId) {
      issues.push({
        severity: 'warning',
        code: 'ORPHAN_CLASS',
        entityId: cls.id,
        entityLabel: cls.label,
        type: 'Class',
        message: `Class "${cls.label}" is orphaned (not attached to BFO or any superclass).`
      });
      score -= 5;
    }

    // Invalid superclass reference
    if (cls.superclassId && !classMap.has(cls.superclassId)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_SUPERCLASS',
        entityId: cls.id,
        entityLabel: cls.label,
        type: 'Class',
        message: `Class "${cls.label}" references missing superclass ID "${cls.superclassId}".`
      });
      score -= 8;
    }
  });

  // 3. Object Property Domain/Range Checks
  objectProps.forEach(op => {
    if (op.domainId && !classMap.has(op.domainId)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_DOMAIN',
        entityId: op.id,
        entityLabel: op.label,
        type: 'ObjectProperty',
        message: `Object property "${op.label}" references unknown domain class ID "${op.domainId}".`
      });
      score -= 5;
    }

    if (op.rangeId && !classMap.has(op.rangeId)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_RANGE',
        entityId: op.id,
        entityLabel: op.label,
        type: 'ObjectProperty',
        message: `Object property "${op.label}" references unknown range class ID "${op.rangeId}".`
      });
      score -= 5;
    }
  });

  // 4. BFO Alignment Score
  const nonBfoClasses = classes.filter(c => !c.id.startsWith('bfo_'));
  const alignedCount = nonBfoClasses.filter(c => {
    let curr = c;
    while (curr && curr.superclassId) {
      if (curr.superclassId.startsWith('bfo_')) return true;
      curr = classMap.get(curr.superclassId);
    }
    return false;
  }).length;

  if (nonBfoClasses.length > 0 && alignedCount < nonBfoClasses.length) {
    const unalignedCount = nonBfoClasses.length - alignedCount;
    issues.push({
      severity: 'info',
      code: 'BFO_ALIGNMENT_PARTIAL',
      type: 'Ontology',
      message: `${unalignedCount} custom class(es) are not aligned with BFO top-level classes.`
    });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues,
    summary: {
      totalClasses: classes.length,
      totalObjectProps: objectProps.length,
      totalDataProps: dataProps.length,
      totalIndividuals: individuals.length,
      bfoAlignedClasses: alignedCount,
      errorsCount: issues.filter(i => i.severity === 'error').length,
      warningsCount: issues.filter(i => i.severity === 'warning').length
    }
  };
}
