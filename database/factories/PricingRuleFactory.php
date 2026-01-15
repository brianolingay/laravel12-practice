<?php

namespace Database\Factories;

use App\Models\PricingModule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PricingRule>
 */
class PricingRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'pricing_module_id' => PricingModule::factory(),
            'rule_type' => 'per_event',
            'amount' => 2.00,
            'currency' => 'USD',
            'event_type' => 'ShipmentCreated',
            'tier_definition' => null,
            'effective_from' => now()->startOfMonth()->toDateString(),
            'effective_to' => null,
        ];
    }
}
