<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    /** @use HasFactory<\Database\Factories\AccountFactory> */
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function ledgerEvents(): HasMany
    {
        return $this->hasMany(LedgerEvent::class);
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
