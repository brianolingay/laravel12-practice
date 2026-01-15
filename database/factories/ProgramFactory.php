<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
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
            'name' => fake()->words(2, true),
            'code' => strtoupper(fake()->unique()->bothify('PRG-####')),
        ];
    }
}
