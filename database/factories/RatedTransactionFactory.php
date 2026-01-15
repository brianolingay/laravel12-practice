<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\LedgerEvent;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RatedTransaction>
 */
class RatedTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory();
        $account = Account::factory()->for($tenant);
        $ledgerEvent = LedgerEvent::factory()->for($tenant)->for($account);
        $pricingModule = PricingModule::factory();
        $pricingRule = PricingRule::factory()->for($tenant)->for($pricingModule);

        return [
            'tenant_id' => $tenant,
            'account_id' => $account,
            'ledger_event_id' => $ledgerEvent,
            'pricing_rule_id' => $pricingRule,
            'pricing_module_id' => $pricingModule,
            'event_type' => 'ShipmentCreated',
            'amount' => 2.00,
            'currency' => 'USD',
            'explanation' => 'Pricing rule applied for ShipmentCreated.',
            'rated_at' => now(),
        ];
    }
}
