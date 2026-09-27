export const BFO_CLASSES = [
  { id: 'bfo_Entity', iri: 'http://purl.obolibrary.org/obo/BFO_0000001', label: 'Entity', bfoTier: 'Top-Level (BFO)', definition: 'An entity is anything that exists or can be conceived.' },
  { id: 'bfo_Continuant', iri: 'http://purl.obolibrary.org/obo/BFO_0000002', superclassId: 'bfo_Entity', label: 'Continuant', bfoTier: 'Top-Level (BFO)', definition: 'An entity that persists, endures, or continues in time while maintaining its identity.' },
  { id: 'bfo_Occurrent', iri: 'http://purl.obolibrary.org/obo/BFO_0000003', superclassId: 'bfo_Entity', label: 'Occurrent', bfoTier: 'Top-Level (BFO)', definition: 'An entity that unfolds in time or has temporal parts (e.g., process, event).' },
  { id: 'bfo_IndependentContinuant', iri: 'http://purl.obolibrary.org/obo/BFO_0000004', superclassId: 'bfo_Continuant', label: 'Independent Continuant', bfoTier: 'Top-Level (BFO)', definition: 'A continuant that can exist by itself without depending on another entity.' },
  { id: 'bfo_MaterialEntity', iri: 'http://purl.obolibrary.org/obo/BFO_0000040', superclassId: 'bfo_IndependentContinuant', label: 'Material Entity', bfoTier: 'Top-Level (BFO)', definition: 'An independent continuant that has matter as a portion.' },
  { id: 'bfo_ImmaterialEntity', iri: 'http://purl.obolibrary.org/obo/BFO_0000141', superclassId: 'bfo_IndependentContinuant', label: 'Immaterial Entity', bfoTier: 'Top-Level (BFO)', definition: 'An independent continuant that has no material components (e.g., site, boundary, spatial region).' },
  { id: 'bfo_SpecificallyDependentContinuant', iri: 'http://purl.obolibrary.org/obo/BFO_0000020', superclassId: 'bfo_Continuant', label: 'Specifically Dependent Continuant', bfoTier: 'Top-Level (BFO)', definition: 'A continuant that inheres in a specific independent continuant.' },
  { id: 'bfo_Disposition', iri: 'http://purl.obolibrary.org/obo/BFO_0000016', superclassId: 'bfo_SpecificallyDependentContinuant', label: 'Disposition', bfoTier: 'Top-Level (BFO)', definition: 'A specifically dependent continuant that tends to manifest in certain processes when triggered.' },
  { id: 'bfo_Role', iri: 'http://purl.obolibrary.org/obo/BFO_0000023', superclassId: 'bfo_SpecificallyDependentContinuant', label: 'Role', bfoTier: 'Top-Level (BFO)', definition: 'A specifically dependent continuant that exists because the bearer is in some external context.' },
  { id: 'bfo_Process', iri: 'http://purl.obolibrary.org/obo/BFO_0000015', superclassId: 'bfo_Occurrent', label: 'Process', bfoTier: 'Top-Level (BFO)', definition: 'An occurrent that exists in time by bringing about change.' }
];

export const ONTOLOGY_TEMPLATES = [
  {
    id: 'iof-core-maintenance',
    name: 'IOF Core Maintenance & Asset Management',
    description: 'Standard IOF-aligned ontology for physical industrial assets, equipment hierarchy, maintenance work orders, sensor data, and failure dispositions.',
    version: '1.2.0',
    baseIri: 'https://spec.industrialontologies.org/ontology/core/Maintenance/',
    namespaces: {
      bfo: 'http://purl.obolibrary.org/obo/',
      iof: 'https://spec.industrialontologies.org/ontology/core/Core/',
      iof_maint: 'https://spec.industrialontologies.org/ontology/maintenance/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#'
    },
    classes: [
      ...BFO_CLASSES,
      // IOF Core Classes
      {
        id: 'iof_Asset',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/Asset',
        label: 'Industrial Asset',
        superclassId: 'bfo_MaterialEntity',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'A material entity owned or managed by an enterprise that holds value for industrial operations.',
        annotations: {
          'rdfs:comment': 'Base class for all physical machinery, tools, and industrial holdings.',
          'iof:semiFormalDefinition': 'every Asset is a MaterialEntity that has value to an Organization.'
        }
      },
      {
        id: 'iof_Equipment',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/Equipment',
        label: 'Industrial Equipment',
        superclassId: 'iof_Asset',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'An asset designed to perform specific mechanical, chemical, or operational processes.',
        annotations: {
          'rdfs:comment': 'Includes CNC machines, pumps, conveyors, and robotic arms.'
        }
      },
      {
        id: 'iof_Machine',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/Machine',
        label: 'Machine',
        superclassId: 'iof_Equipment',
        bfoTier: 'Domain Level',
        definition: 'An assembly of powered components designed to perform automated mechanical tasks.',
        annotations: {
          'rdfs:comment': 'e.g., 5-Axis CNC Milling Machine, Robotic Welder.'
        }
      },
      {
        id: 'iof_Component',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/Component',
        label: 'Equipment Component',
        superclassId: 'bfo_MaterialEntity',
        bfoTier: 'Domain Level',
        definition: 'A sub-part of an equipment assembly that fulfills a localized function.',
        annotations: {
          'rdfs:comment': 'e.g., Spindle Bearing, Hydraulic Valve, Sensor Module.'
        }
      },
      {
        id: 'iof_MaintenanceWorkOrder',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/MaintenanceWorkOrder',
        label: 'Maintenance Work Order',
        superclassId: 'bfo_SpecificallyDependentContinuant',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'An information content entity representing an authorized maintenance task directive.',
        annotations: {
          'rdfs:comment': 'Tracks scheduled, corrective, or predictive maintenance requests.'
        }
      },
      {
        id: 'iof_MaintenanceProcess',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/MaintenanceProcess',
        label: 'Maintenance Process',
        superclassId: 'bfo_Process',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'A process aimed at retaining an asset in, or restoring it to, an operational state.',
        annotations: {
          'rdfs:comment': 'Includes inspection, lubrication, bearing replacement, calibration.'
        }
      },
      {
        id: 'iof_FailureMode',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/FailureMode',
        label: 'Failure Mode Disposition',
        superclassId: 'bfo_Disposition',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'A disposition of an asset to fail under specific operational stress or degradation states.',
        annotations: {
          'rdfs:comment': 'e.g., Thermal Overheating, Bearing Spalling, Hydraulic Leakage.'
        }
      },
      {
        id: 'iof_Capability',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/Capability',
        label: 'Production Capability',
        superclassId: 'bfo_Disposition',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'The ability of an equipment asset to execute a specific industrial process under specified conditions.',
        annotations: {}
      },
      {
        id: 'iof_SensorObservation',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/SensorObservation',
        label: 'Sensor Observation Process',
        superclassId: 'bfo_Process',
        bfoTier: 'Domain Level',
        definition: 'An observation process executed by a physical sensor measuring asset telemetries.',
        annotations: {}
      }
    ],
    objectProperties: [
      {
        id: 'op_hasPart',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/hasPart',
        label: 'has Part',
        domainId: 'bfo_MaterialEntity',
        rangeId: 'bfo_MaterialEntity',
        definition: 'Relates a whole material entity to its constituent sub-component.',
        isTransitive: true,
        isSymmetric: false,
        isFunctional: false
      },
      {
        id: 'op_isPartOf',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/isPartOf',
        label: 'is Part Of',
        domainId: 'bfo_MaterialEntity',
        rangeId: 'bfo_MaterialEntity',
        definition: 'Relates a component to its parent assembly.',
        isTransitive: true,
        isSymmetric: false,
        isFunctional: false,
        inverseOfId: 'op_hasPart'
      },
      {
        id: 'op_hasCapability',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/hasCapability',
        label: 'has Capability',
        domainId: 'iof_Equipment',
        rangeId: 'iof_Capability',
        definition: 'Links equipment to its production capability disposition.'
      },
      {
        id: 'op_triggersWorkOrder',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/triggersWorkOrder',
        label: 'triggers Work Order',
        domainId: 'iof_FailureMode',
        rangeId: 'iof_MaintenanceWorkOrder',
        definition: 'Relates a detected failure mode or anomaly to an initiated maintenance work order.'
      },
      {
        id: 'op_restoresAsset',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/restoresAsset',
        label: 'restores Asset',
        domainId: 'iof_MaintenanceProcess',
        rangeId: 'iof_Asset',
        definition: 'Links a maintenance process execution to the target asset being serviced.'
      },
      {
        id: 'op_monitoredBy',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/monitoredBy',
        label: 'monitored By Process',
        domainId: 'iof_Asset',
        rangeId: 'iof_SensorObservation',
        definition: 'Associates an asset with real-time sensor observation processes.'
      }
    ],
    dataProperties: [
      {
        id: 'dp_serialNumber',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/hasSerialNumber',
        label: 'has Serial Number',
        domainId: 'iof_Asset',
        datatype: 'xsd:string',
        definition: 'Unique manufacturer serial identifier for physical equipment.'
      },
      {
        id: 'dp_operatingHours',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/operatingHours',
        label: 'operating Hours',
        domainId: 'iof_Equipment',
        datatype: 'xsd:integer',
        definition: 'Total cumulative machine runtime in hours.'
      },
      {
        id: 'dp_temperatureThreshold',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/temperatureThreshold',
        label: 'temperature Threshold (°C)',
        domainId: 'iof_Machine',
        datatype: 'xsd:float',
        definition: 'Maximum allowable bearing/motor temperature before triggering warning.'
      },
      {
        id: 'dp_isOperational',
        iri: 'https://spec.industrialontologies.org/ontology/core/Core/isOperational',
        label: 'is Operational',
        domainId: 'iof_Asset',
        datatype: 'xsd:boolean',
        definition: 'Boolean flag indicating current online health status.'
      },
      {
        id: 'dp_lastServiceDate',
        iri: 'https://spec.industrialontologies.org/ontology/maintenance/lastServiceDate',
        label: 'last Service Timestamp',
        domainId: 'iof_Asset',
        datatype: 'xsd:dateTime',
        definition: 'Timestamp when the last preventive maintenance was completed.'
      }
    ],
    individuals: [
      {
        id: 'ind_cnc_01',
        iri: 'https://spec.industrialontologies.org/ontology/demo/CNC_Milling_Machine_01',
        label: 'CNC Milling Machine 01',
        classId: 'iof_Machine',
        propertyValues: [
          { propertyId: 'dp_serialNumber', value: 'CNC-2026-X8912' },
          { propertyId: 'dp_operatingHours', value: 4320 },
          { propertyId: 'dp_temperatureThreshold', value: 85.5 },
          { propertyId: 'dp_isOperational', value: true },
          { propertyId: 'dp_lastServiceDate', value: '2026-08-15T10:00:00Z' }
        ],
        relationships: [
          { propertyId: 'op_hasPart', targetIndividualId: 'ind_spindle_01' },
          { propertyId: 'op_monitoredBy', targetIndividualId: 'ind_obs_temp_01' }
        ]
      },
      {
        id: 'ind_spindle_01',
        iri: 'https://spec.industrialontologies.org/ontology/demo/HighSpeed_Spindle_Bearing',
        label: 'HighSpeed Spindle Bearing',
        classId: 'iof_Component',
        propertyValues: [
          { propertyId: 'dp_serialNumber', value: 'BRG-SP-4402' },
          { propertyId: 'dp_isOperational', value: true }
        ],
        relationships: [
          { propertyId: 'op_isPartOf', targetIndividualId: 'ind_cnc_01' }
        ]
      },
      {
        id: 'ind_wo_9941',
        iri: 'https://spec.industrialontologies.org/ontology/demo/WO_2026_9941',
        label: 'Preventive Bearing Inspection WO-9941',
        classId: 'iof_MaintenanceWorkOrder',
        propertyValues: [
          { propertyId: 'dp_isOperational', value: false }
        ],
        relationships: []
      }
    ]
  },
  {
    id: 'industry40-smart-manufacturing',
    name: 'Industry 4.0 Smart Manufacturing',
    description: 'Ontology for smart factory automation, robotic assembly cells, production lots, and cyber-physical systems.',
    version: '1.0.0',
    baseIri: 'https://example.org/ontology/smart-factory/',
    namespaces: {
      bfo: 'http://purl.obolibrary.org/obo/',
      sf: 'https://example.org/ontology/smart-factory/',
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    },
    classes: [
      ...BFO_CLASSES,
      {
        id: 'sf_SmartFactoryCell',
        iri: 'https://example.org/ontology/smart-factory/SmartFactoryCell',
        label: 'Smart Factory Cell',
        superclassId: 'bfo_MaterialEntity',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'An automated physical workspace hosting connected robotic systems and IoT sensors.'
      },
      {
        id: 'sf_RoboticArm',
        iri: 'https://example.org/ontology/smart-factory/RoboticArm',
        label: '6-Axis Industrial Robot Arm',
        superclassId: 'sf_SmartFactoryCell',
        bfoTier: 'Domain Level',
        definition: 'Programmable articulated arm used for precision material handling and assembly.'
      },
      {
        id: 'sf_MaterialBatch',
        iri: 'https://example.org/ontology/smart-factory/MaterialBatch',
        label: 'Raw Material Lot',
        superclassId: 'bfo_MaterialEntity',
        bfoTier: 'Domain Level',
        definition: 'A batch of raw input materials assigned for production processing.'
      },
      {
        id: 'sf_AssemblyProcess',
        iri: 'https://example.org/ontology/smart-factory/AssemblyProcess',
        label: 'Robotic Assembly Process',
        superclassId: 'bfo_Process',
        bfoTier: 'Domain Level',
        definition: 'The process of joining discrete components into a finished product.'
      }
    ],
    objectProperties: [
      {
        id: 'op_processesBatch',
        iri: 'https://example.org/ontology/smart-factory/processesBatch',
        label: 'processes Batch',
        domainId: 'sf_RoboticArm',
        rangeId: 'sf_MaterialBatch',
        definition: 'Links a robot to the batch currently being processed.'
      }
    ],
    dataProperties: [
      {
        id: 'dp_cycleTimeSeconds',
        iri: 'https://example.org/ontology/smart-factory/cycleTimeSeconds',
        label: 'Cycle Time (Seconds)',
        domainId: 'sf_AssemblyProcess',
        datatype: 'xsd:float',
        definition: 'Time taken to execute one assembly cycle.'
      }
    ],
    individuals: [
      {
        id: 'ind_robot_cell_01',
        iri: 'https://example.org/ontology/smart-factory/Robot_Arm_KUKA_01',
        label: 'KUKA Assembly Robot Arm 01',
        classId: 'sf_RoboticArm',
        propertyValues: [
          { propertyId: 'dp_cycleTimeSeconds', value: 14.2 }
        ],
        relationships: []
      }
    ]
  },
  {
    id: 'iso15926-ido-asset-lifecycle',
    name: 'ISO 15926 Industrial Data Ontology (IDO)',
    description: 'Reference asset lifecycle model following ISO 15926 & W3C IDO guidelines for plant engineering and process asset lifecycle management.',
    version: '2.0.0',
    baseIri: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/',
    namespaces: {
      bfo: 'http://purl.obolibrary.org/obo/',
      ido: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/',
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    },
    classes: [
      ...BFO_CLASSES,
      {
        id: 'ido_PhysicalObject',
        iri: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/PhysicalObject',
        label: 'Physical Object (ISO 15926)',
        superclassId: 'bfo_MaterialEntity',
        bfoTier: 'Top-Level (BFO)',
        definition: 'An entity that exists in three-dimensional physical space.'
      },
      {
        id: 'ido_FunctionalObject',
        iri: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/FunctionalObject',
        label: 'Functional Object Tag',
        superclassId: 'bfo_SpecificallyDependentContinuant',
        bfoTier: 'Mid-Level (IOF Core)',
        definition: 'A functional specification or plant tag (e.g. Pump P-101A) that can be fulfilled by a physical object.'
      },
      {
        id: 'ido_PipelineSegment',
        iri: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/PipelineSegment',
        label: 'High Pressure Pipeline Segment',
        superclassId: 'ido_PhysicalObject',
        bfoTier: 'Domain Level',
        definition: 'Physical piping section transporting industrial fluid or gas.'
      }
    ],
    objectProperties: [
      {
        id: 'op_fulfillsTag',
        iri: 'http://rds.posccaesar.org/2008/02/OWL/ISO-15926-2_2003/fulfillsTag',
        label: 'fulfills Plant Tag',
        domainId: 'ido_PhysicalObject',
        rangeId: 'ido_FunctionalObject',
        definition: 'Relates a physical asset item to its engineering functional tag.'
      }
    ],
    dataProperties: [],
    individuals: []
  },
  {
    id: 'bfo-2020-starter',
    name: 'BFO 2020 Foundation Framework',
    description: 'Clean starter template containing the full Basic Formal Ontology (BFO 2020) top-level class hierarchy for custom industrial ontology building.',
    version: '2020.1',
    baseIri: 'http://purl.obolibrary.org/obo/bfo/',
    namespaces: {
      bfo: 'http://purl.obolibrary.org/obo/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
    },
    classes: BFO_CLASSES,
    objectProperties: [],
    dataProperties: [],
    individuals: []
  }
];
