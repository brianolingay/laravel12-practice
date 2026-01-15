import { USE_MOCKS } from '@/lib/config';
import {
    mockAuditLogs,
    mockDashboard,
    mockLedgerEvents,
    mockPricingModules,
    mockPricingRules,
    mockStatementDetail,
    mockStatements,
} from '@/mocks/financial-console';
import {
    type AuditLogEntry,
    type DashboardSnapshot,
    type LedgerEvent,
    type PricingModule,
    type PricingRule,
    type StatementDetail,
    type StatementSummary,
} from '@/types/financial-console';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }

    return (await response.json()) as T;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    if (USE_MOCKS) {
        await delay(400);
        return mockDashboard;
    }

    return fetchJson<DashboardSnapshot>('/dashboard');
}

export async function getLedgerEvents(): Promise<LedgerEvent[]> {
    if (USE_MOCKS) {
        await delay(400);
        return mockLedgerEvents;
    }

    return fetchJson<LedgerEvent[]>('/ledger/events');
}

export async function getPricingModules(): Promise<PricingModule[]> {
    if (USE_MOCKS) {
        await delay(300);
        return mockPricingModules;
    }

    return fetchJson<PricingModule[]>('/pricing/modules');
}

export async function getPricingRules(
    moduleId?: number,
): Promise<PricingRule[]> {
    if (USE_MOCKS) {
        await delay(300);
        return moduleId
            ? mockPricingRules.filter((rule) => rule.module_id === moduleId)
            : mockPricingRules;
    }

    const query = moduleId ? `?module=${moduleId}` : '';
    return fetchJson<PricingRule[]>(`/pricing/rules${query}`);
}

export async function getStatements(): Promise<StatementSummary[]> {
    if (USE_MOCKS) {
        await delay(400);
        return mockStatements;
    }

    return fetchJson<StatementSummary[]>('/billing/statements');
}

export async function getStatementDetail(
    statementId: number,
): Promise<StatementDetail> {
    if (USE_MOCKS) {
        await delay(300);
        return mockStatementDetail;
    }

    return fetchJson<StatementDetail>(`/billing/statements/${statementId}`);
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
    if (USE_MOCKS) {
        await delay(400);
        return mockAuditLogs;
    }

    return fetchJson<AuditLogEntry[]>('/audit/logs');
}

export async function generateStatement(payload: {
    period_start: string;
    period_end: string;
}): Promise<void> {
    if (USE_MOCKS) {
        await delay(300);
        return;
    }

    await fetchJson<void>('/billing/statements/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function reviewStatement(statementId: number): Promise<void> {
    if (USE_MOCKS) {
        await delay(200);
        return;
    }

    await fetchJson<void>(`/billing/statements/${statementId}/review`, {
        method: 'POST',
    });
}

export async function finalizeStatement(statementId: number): Promise<void> {
    if (USE_MOCKS) {
        await delay(200);
        return;
    }

    await fetchJson<void>(`/billing/statements/${statementId}/finalize`, {
        method: 'POST',
    });
}
