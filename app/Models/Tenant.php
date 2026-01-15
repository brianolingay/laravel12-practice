<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    /** @use HasFactory<\Database\Factories\TenantFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function ledgerEvents(): HasMany
    {
        return $this->hasMany(LedgerEvent::class);
    }

    public function pricingRules(): HasMany
    {
        return $this->hasMany(PricingRule::class);
    }

    public function billingStatements(): HasMany
    {
        return $this->hasMany(BillingStatement::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
