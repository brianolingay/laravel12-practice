<?php

namespace App\Policies;

use App\Models\LedgerEvent;
use App\Models\User;

class LedgerEventPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_ledger');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LedgerEvent $ledgerEvent): bool
    {
        return $user->hasPermission('view_ledger')
            && $this->matchesTenant($user, $ledgerEvent->tenant_id, $ledgerEvent->account_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('view_ledger');
    }

    /**
     * Ledger events are immutable.
     */
    public function update(User $user, LedgerEvent $ledgerEvent): bool
    {
        return false;
    }

    /**
     * Ledger events are immutable.
     */
    public function delete(User $user, LedgerEvent $ledgerEvent): bool
    {
        return false;
    }

    private function matchesTenant(User $user, int $tenantId, ?int $accountId): bool
    {
        if ($user->tenant_id !== $tenantId) {
            return false;
        }

        if ($user->account_id === null) {
            return true;
        }

        return $user->account_id === $accountId;
    }
}
