import datetime
from zoneinfo import ZoneInfo

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

def query_industrial_assets(asset_class: str = "all") -> str:
    """Queries industrial machinery and asset inventory aligned with IOF and BFO standards.

    Args:
        asset_class: Target class category e.g., 'machine', 'component', 'equipment', or 'all'.

    Returns:
        Structured JSON-like text summary of physical industrial assets.
    """
    assets = [
        {"id": "CNC_Milling_Machine_01", "class": "iof:Machine", "bfoTier": "Domain Level", "serial": "CNC-2026-X8912", "status": "Operational", "location": "Bay 3"},
        {"id": "Spindle_Bearing_A", "class": "iof:Component", "bfoTier": "Domain Level", "serial": "BRG-SP-4402", "status": "Operational", "parent": "CNC_Milling_Machine_01"},
        {"id": "Robotic_Arm_KUKA_01", "class": "iof:Equipment", "bfoTier": "Mid-Level (IOF Core)", "serial": "KUKA-ARM-990", "status": "Operational", "location": "Cell 2"}
    ]
    if asset_class.lower() != "all":
        filtered = [a for a in assets if asset_class.lower() in a["class"].lower()]
        return str(filtered if filtered else assets)
    return str(assets)


def query_maintenance_orders(machine_id: str = "") -> str:
    """Searches active maintenance work orders and failure modes for industrial machinery.

    Args:
        machine_id: Optional ID of machine e.g., 'CNC_Milling_Machine_01'.

    Returns:
        Summary of active work orders, priority, and failure modes.
    """
    orders = [
        {"workOrderId": "WO-2026-9941", "asset": "CNC_Milling_Machine_01", "type": "Preventive Bearing Inspection", "priority": "High", "triggerFailureMode": "Thermal Overheating Disposition"},
        {"workOrderId": "WO-2026-8812", "asset": "Robotic_Arm_KUKA_01", "type": "Joint Lubrication", "priority": "Medium", "triggerFailureMode": "Routine Maintenance"}
    ]
    if machine_id:
        filtered = [o for o in orders if machine_id.lower() in o["asset"].lower()]
        return str(filtered if filtered else orders)
    return str(orders)


def explain_bfo_tier(concept_name: str) -> str:
    """Explains Basic Formal Ontology (BFO 2020) top-level classification for industrial entities.

    Args:
        concept_name: Industrial concept e.g., 'machine', 'maintenance', 'temperature'.

    Returns:
        Explanation of BFO top-level mapping (Continuant vs Occurrent, Material Entity vs Disposition).
    """
    mapping = {
        "machine": "bfo:MaterialEntity (Independent Continuant) - Persists in space and time, made of matter.",
        "maintenance": "bfo:Process (Occurrent) - Unfolds over a temporal interval, bringing about physical change.",
        "failure": "bfo:Disposition (Specifically Dependent Continuant) - Inheres in an asset and manifests under stress."
    }
    for k, v in mapping.items():
        if k in concept_name.lower():
            return v
    return f"'{concept_name}' is mapped as a bfo:Continuant or bfo:Occurrent depending on temporal persistence."


root_agent = Agent(
    name="industrial_ontology_agent",
    model=Gemini(
        model="gemini-flash-latest",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an Industrial Ontology AI Assistant aligned with IOF (Industrial Ontologies Foundry), "
        "BFO (Basic Formal Ontology 2020), and ISO 15926 standards. You answer questions about industrial assets, "
        "machinery hierarchies, maintenance work orders, sensor telemetries, and semantic class structures."
    ),
    tools=[query_industrial_assets, query_maintenance_orders, explain_bfo_tier],
)

app = App(
    root_agent=root_agent,
    name="app",
)
