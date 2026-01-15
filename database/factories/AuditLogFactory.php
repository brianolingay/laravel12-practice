<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
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
            'actor_id' => User::factory()->for($tenant)->for($account),
            'action' => 'ledger_event.ingested',
            'metadata' => [
                'source' => 'factory',
            ],
        ];
    }
}
