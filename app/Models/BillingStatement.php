<?php

namespace App\Models;

use App\BillingStatementStatus;
use App\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillingStatement extends Model
{
    /** @use HasFactory<\Database\Factories\BillingStatementFactory> */
    use HasFactory;

    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'account_id',
        'period_start',
        'period_end',
        'status',
        'total_amount',
        'currency',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'generated_at' => 'datetime',
            'status' => BillingStatementStatus::class,
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class);
    }
}
