<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait TenantScoped
{
    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForTenantAccount(Builder $query, int $tenantId, ?int $accountId): Builder
    {
        return $query->where('tenant_id', $tenantId)
            ->when($accountId !== null, function (Builder $query) use ($accountId): void {
                $query->where('account_id', $accountId);
            });
    }
}
