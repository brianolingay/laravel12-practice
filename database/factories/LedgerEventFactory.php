<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Program;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LedgerEvent>
 */
class LedgerEventFactory extends Factory
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

        return [
            'tenant_id' => $tenant,
            'account_id' => $account,
            'program_id' => Program::factory()->for($tenant)->for($account),
            'event_type' => 'ShipmentCreated',
            'external_reference_id' => strtoupper(fake()->unique()->bothify('EVT-######')),
            'metadata' => [
                'source' => 'factory',
            ],
            'occurred_at' => now(),
        ];
    }
}
