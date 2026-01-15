<?php

namespace App\Models;

use App\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RatedTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\RatedTransactionFactory> */
    use HasFactory;

    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'account_id',
        'ledger_event_id',
        'pricing_rule_id',
        'pricing_module_id',
        'event_type',
        'amount',
        'currency',
        'explanation',
        'rated_at',
    ];

    protected function casts(): array
    {
        return [
            'rated_at' => 'datetime',
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

    public function ledgerEvent(): BelongsTo
    {
        return $this->belongsTo(LedgerEvent::class);
    }

    public function pricingRule(): BelongsTo
    {
        return $this->belongsTo(PricingRule::class);
    }

    public function pricingModule(): BelongsTo
    {
        return $this->belongsTo(PricingModule::class);
    }
}
