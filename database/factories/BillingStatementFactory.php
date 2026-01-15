<?php

namespace Database\Factories;

use App\BillingStatementStatus;
use App\Models\Account;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BillingStatement>
 */
class BillingStatementFactory extends Factory
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
        $periodStart = now()->startOfMonth();

        return [
            'tenant_id' => $tenant,
            'account_id' => $account,
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodStart->copy()->endOfMonth()->toDateString(),
            'status' => BillingStatementStatus::Draft,
            'total_amount' => 0,
            'currency' => 'USD',
            'generated_at' => now(),
        ];
    }
}
