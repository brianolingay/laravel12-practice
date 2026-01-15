<?php

namespace App\Models;

use App\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PricingRule extends Model
{
    /** @use HasFactory<\Database\Factories\PricingRuleFactory> */
    use HasFactory;

    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'pricing_module_id',
        'rule_type',
        'amount',
        'currency',
        'event_type',
        'tier_definition',
        'effective_from',
        'effective_to',
    ];

    protected function casts(): array
    {
        return [
            'tier_definition' => 'array',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function pricingModule(): BelongsTo
    {
        return $this->belongsTo(PricingModule::class);
    }

    public function ratedTransactions(): HasMany
    {
        return $this->hasMany(RatedTransaction::class);
    }
}
