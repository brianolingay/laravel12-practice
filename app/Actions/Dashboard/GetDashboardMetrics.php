<?php

namespace App\Actions\Dashboard;

use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\PricingRule;
use App\Models\User;

class GetDashboardMetrics
{
    /**
     * @return array{ledgerEvents: int, pricingRules: int, statements: int}
     */
    public function execute(User $user): array
    {
        return [
            'ledgerEvents' => LedgerEvent::query()
                ->forTenantAccount($user->tenant_id, $user->account_id)
                ->count(),
            'pricingRules' => PricingRule::query()
                ->forTenant($user->tenant_id)
                ->count(),
            'statements' => BillingStatement::query()
                ->forTenantAccount($user->tenant_id, $user->account_id)
                ->count(),
        ];
    }
}
