<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
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
    public function view(User $user, AuditLog $auditLog): bool
    {
        return $user->hasPermission('view_ledger')
            && $this->matchesTenant($user, $auditLog->tenant_id, $auditLog->account_id);
    }

    private function matchesTenant(User $user, ?int $tenantId, ?int $accountId): bool
    {
        if ($tenantId === null || $user->tenant_id !== $tenantId) {
            return false;
        }

        if ($user->account_id === null) {
            return true;
        }

        return $user->account_id === $accountId;
    }
}
