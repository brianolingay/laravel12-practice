<?php

namespace App\Actions\AuditLog;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListAuditLogs
{
    /**
     * @return Collection<int, AuditLog>
     */
    public function execute(User $user, int $limit = 50): Collection
    {
        return AuditLog::query()
            ->forTenantAccount($user->tenant_id, $user->account_id)
            ->latest('created_at')
            ->take($limit)
            ->get();
    }
}
