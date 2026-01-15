<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingLineItem extends Model
{
    /** @use HasFactory<\Database\Factories\BillingLineItemFactory> */
    use HasFactory;

    protected $fillable = [
        'billing_statement_id',
        'pricing_rule_id',
        'pricing_module_id',
        'event_type',
        'description',
        'quantity',
        'unit_amount',
        'total_amount',
        'currency',
    ];

    public function billingStatement(): BelongsTo
    {
        return $this->belongsTo(BillingStatement::class);
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
