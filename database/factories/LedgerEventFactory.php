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
        $tenant = Tenant::factory()->create();
        $account = Account::factory()->for($tenant)->create();
        $program = Program::factory()->for($tenant)->for($account)->create();

        return [
            'tenant_id' => $tenant->id,
            'account_id' => $account->id,
            'program_id' => $program->id,
            'event_type' => 'ShipmentCreated',
            'external_reference_id' => strtoupper(fake()->unique()->bothify('EVT-######')),
            'metadata' => [
                'source' => 'factory',
            ],
            'occurred_at' => now(),
        ];
    }
}
