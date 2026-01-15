import {
    type AuditLogEntry,
    type DashboardSnapshot,
    type LedgerEvent,
    type PricingModule,
    type PricingRule,
    type StatementDetail,
    type StatementSummary,
} from '@/types/financial-console';

export const mockDashboard: DashboardSnapshot = {
    metrics: {
        events_mtd: 1248,
        rated_amount_mtd: '$128,430.00',
        statements_draft: 3,
        active_accounts: 12,
    },
    recent_events: Array.from({ length: 10 }).map((_, index) => ({
        id: index + 1,
        occurred_at: new Date(Date.now() - index * 3600 * 1000).toISOString(),
        event_type: index % 2 === 0 ? 'ShipmentCreated' : 'ResultFinalized',
        tenant: 'Diagnostically',
        account: `Account ${index + 1}`,
        program: index % 2 === 0 ? 'Core' : 'Telehealth',
        external_reference_id: `EVT-${1000 + index}`,
        status: index % 3 === 0 ? 'Pending' : 'Processed',
        metadata: {
            shipment_id: `SHIP-${900 + index}`,
            location: 'CA-West',
        },
    })),
    billing_status: Array.from({ length: 5 }).map((_, index) => ({
        id: index + 21,
        period_start: '2026-01-01',
        period_end: '2026-01-31',
        account: `Account ${index + 1}`,
        total_amount: `$${(4200 + index * 320).toLocaleString()}`,
        currency: 'USD',
        status: index % 2 === 0 ? 'draft' : 'reviewed',
    })),
};

export const mockLedgerEvents: LedgerEvent[] = mockDashboard.recent_events.map(
    (event) => ({
        ...event,
        status: event.status ?? 'Processed',
    }),
);

export const mockPricingModules: PricingModule[] = [
    {
        id: 1,
        code: 'CORE_PLATFORM',
        name: 'Core Platform',
        description: 'Core platform access and baseline automation.',
    },
    {
        id: 2,
        code: 'WAREHOUSE_MANAGER',
        name: 'Warehouse Manager',
        description: 'Fulfillment, shipping, and inventory services.',
    },
    {
        id: 3,
        code: 'PROVIDER_PORTAL',
        name: 'Provider Portal',
        description: 'Provider account workflows and reporting.',
    },
    {
        id: 4,
        code: 'CASE_MANAGEMENT',
        name: 'Case Management',
        description: 'End-to-end case tracking and automation.',
    },
    {
        id: 5,
        code: 'DIRECT_MAIL',
        name: 'Direct Mail',
        description: 'Direct mail fulfillment and tracking.',
    },
    {
        id: 6,
        code: 'TELEHEALTH_INTEGRATION',
        name: 'Telehealth Integration',
        description: 'Telehealth routing and services.',
    },
];

export const mockPricingRules: PricingRule[] = [
    {
        id: 11,
        rule_type: 'flat',
        amount: '5,000.00',
        currency: 'USD',
        effective_from: '2026-01-01',
        effective_to: null,
        status: 'active',
        event_type: null,
        module_id: 1,
    },
    {
        id: 12,
        rule_type: 'per_event',
        amount: '2.00',
        currency: 'USD',
        effective_from: '2026-01-01',
        effective_to: null,
        status: 'active',
        event_type: 'ShipmentCreated',
        module_id: 2,
    },
    {
        id: 13,
        rule_type: 'flat',
        amount: '0.00',
        currency: 'USD',
        effective_from: '2026-01-01',
        effective_to: null,
        status: 'inactive',
        event_type: null,
        module_id: 6,
    },
];

export const mockStatements: StatementSummary[] = [
    {
        id: 201,
        period_start: '2026-01-01',
        period_end: '2026-01-31',
        account: 'Acme Labs',
        total_amount: '24,950.00',
        currency: 'USD',
        status: 'draft',
    },
    {
        id: 202,
        period_start: '2026-01-01',
        period_end: '2026-01-31',
        account: 'Northern Diagnostics',
        total_amount: '18,320.00',
        currency: 'USD',
        status: 'reviewed',
    },
    {
        id: 203,
        period_start: '2025-12-01',
        period_end: '2025-12-31',
        account: 'Metro Health',
        total_amount: '31,120.00',
        currency: 'USD',
        status: 'finalized',
    },
];

export const mockStatementDetail: StatementDetail = {
    id: 201,
    account: 'Acme Labs',
    period_start: '2026-01-01',
    period_end: '2026-01-31',
    status: 'draft',
    total_amount: '24,950.00',
    currency: 'USD',
    line_items: [
        {
            id: 1,
            description: 'Shipment Created',
            quantity: 240,
            unit_amount: '2.00',
            total_amount: '480.00',
            currency: 'USD',
        },
        {
            id: 2,
            description: 'Core Platform Access',
            quantity: 1,
            unit_amount: '5,000.00',
            total_amount: '5,000.00',
            currency: 'USD',
        },
        {
            id: 3,
            description: 'Telehealth Integration',
            quantity: 1,
            unit_amount: '0.00',
            total_amount: '0.00',
            currency: 'USD',
        },
    ],
};

export const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 8 }).map(
    (_, index) => ({
        id: index + 1,
        actor: index % 2 === 0 ? 'Alex Chen' : 'Morgan Lee',
        action:
            index % 2 === 0
                ? 'Updated pricing rule'
                : 'Generated billing statement',
        created_at: new Date(Date.now() - index * 7200 * 1000).toISOString(),
        metadata: {
            module: index % 2 === 0 ? 'CORE_PLATFORM' : 'BILLING',
            statement_id: index % 2 === 0 ? null : 200 + index,
        },
    }),
);
