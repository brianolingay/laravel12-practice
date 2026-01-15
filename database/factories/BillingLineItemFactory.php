<?php

namespace Database\Factories;

use App\Models\BillingStatement;
use App\Models\PricingModule;
use App\Models\PricingRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BillingLineItem>
 */
class BillingLineItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $unitAmount = fake()->randomFloat(2, 1, 10);

        return [
            'billing_statement_id' => BillingStatement::factory(),
            'pricing_rule_id' => PricingRule::factory(),
            'pricing_module_id' => PricingModule::factory(),
            'event_type' => 'ShipmentCreated',
            'description' => fake()->sentence(),
            'quantity' => $quantity,
            'unit_amount' => $unitAmount,
            'total_amount' => $quantity * $unitAmount,
            'currency' => 'USD',
        ];
    }
}
