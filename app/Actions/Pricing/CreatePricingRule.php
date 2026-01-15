<?php

namespace App\Actions\Pricing;

use App\Models\PricingRule;
use App\Models\User;

class CreatePricingRule
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(User $user, array $validated): PricingRule
    {
        return PricingRule::create([
            'tenant_id' => $user->tenant_id,
            'pricing_module_id' => (int) $validated['pricing_module_id'],
            'rule_type' => $validated['rule_type'],
            'amount' => $validated['amount'],
            'currency' => 'USD',
            'event_type' => $validated['event_type'] ?? null,
            'tier_definition' => null,
            'effective_from' => now()->startOfMonth()->toDateString(),
            'effective_to' => null,
        ]);
    }
}
