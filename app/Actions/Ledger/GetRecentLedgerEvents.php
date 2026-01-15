<?php

namespace App\Actions\Ledger;

use App\Models\LedgerEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetRecentLedgerEvents
{
    /**
     * @return Collection<int, LedgerEvent>
     */
    public function execute(User $user, int $limit = 50): Collection
    {
        return LedgerEvent::query()
            ->forTenantAccount($user->tenant_id, $user->account_id)
            ->latest('occurred_at')
            ->take($limit)
            ->get();
    }
}
