<?php

namespace App\Policies;

use App\Models\BillingStatement;
use App\Models\User;

class BillingStatementPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('generate_statements') || $user->hasPermission('export_financials');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BillingStatement $billingStatement): bool
    {
        return ($user->hasPermission('generate_statements') || $user->hasPermission('export_financials'))
            && $this->matchesTenant($user, $billingStatement->tenant_id, $billingStatement->account_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('generate_statements');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BillingStatement $billingStatement): bool
    {
        return $user->hasPermission('approve_statements')
            && $this->matchesTenant($user, $billingStatement->tenant_id, $billingStatement->account_id);
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
