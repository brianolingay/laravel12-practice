<?php

namespace App\Actions\Statements;

use App\Models\BillingStatement;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListStatements
{
    /**
     * @return Collection<int, BillingStatement>
     */
    public function execute(User $user, int $limit = 25): Collection
    {
        return BillingStatement::query()
            ->forTenantAccount($user->tenant_id, $user->account_id)
            ->latest('period_start')
            ->take($limit)
            ->get();
    }
}
