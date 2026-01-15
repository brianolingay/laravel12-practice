export interface LedgerEvent {
    id: number;
    occurred_at: string;
    event_type: string;
    tenant: string;
    account: string;
    program?: string | null;
    external_reference_id: string;
    status?: string | null;
    metadata: Record<string, unknown>;
}

export interface StatementSummary {
    id: number;
    period_start: string;
    period_end: string;
    account: string;
    total_amount: string;
    currency: string;
    status: string;
}

export interface StatementLineItem {
    id: number;
    description: string;
    quantity: number;
    unit_amount: string;
    total_amount: string;
    currency: string;
}

export interface StatementDetail {
    id: number;
    account: string;
    period_start: string;
    period_end: string;
    status: string;
    total_amount: string;
    currency: string;
    line_items: StatementLineItem[];
}

export interface PricingModule {
    id: number;
    code: string;
    name: string;
    description: string;
}

export interface PricingRule {
    id: number;
    rule_type: string;
    amount: string;
    currency: string;
    effective_from: string;
    effective_to: string | null;
    event_type?: string | null;
    status: string;
    module_id: number;
}

export interface AuditLogEntry {
    id: number;
    actor: string;
    action: string;
    created_at: string;
    metadata: Record<string, unknown>;
}

export interface DashboardMetrics {
    events_mtd: number;
    rated_amount_mtd: string;
    statements_draft: number;
    active_accounts: number;
}

export interface DashboardSnapshot {
    metrics: DashboardMetrics;
    recent_events: LedgerEvent[];
    billing_status: StatementSummary[];
}
