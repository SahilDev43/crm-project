from app.modules.leads.schema import LeadBase

class PublicLeadCreate(LeadBase):
    external_lead_id: str | None = None