<?php

namespace Database\Seeders;

use App\BillingStatementStatus;
use App\Models\Account;
use App\Models\AuditLog;
use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\Program;
use App\Models\RatedTransaction;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoBulkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = Tenant::factory()->count(50)->create();

        $accounts = Account::factory()
            ->count(50)
            ->state(fn () => [
                'tenant_id' => $tenants->random()->id,
            ])
            ->create();

        $programs = Program::factory()
            ->count(50)
            ->state(function () use ($accounts): array {
                $account = $accounts->random();

                return [
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                ];
            })
            ->create();

        $pricingModules = PricingModule::factory()->count(50)->create();

        $pricingRules = PricingRule::factory()
            ->count(50)
            ->state(function () use ($tenants, $pricingModules): array {
                return [
                    'tenant_id' => $tenants->random()->id,
                    'pricing_module_id' => $pricingModules->random()->id,
                ];
            })
            ->create();

        $primaryTenant = $tenants->first();
        $primaryAccount = $accounts->firstWhere('tenant_id', $primaryTenant->id);

        if (! $primaryAccount) {
            $primaryAccount = Account::factory()->create([
                'tenant_id' => $primaryTenant->id,
            ]);

            $accounts->push($primaryAccount);
        }

        $primaryTenantAccounts = $accounts->where('tenant_id', $primaryTenant->id)->values();

        if ($primaryTenantAccounts->count() < 2) {
            $secondaryAccount = Account::factory()->create([
                'tenant_id' => $primaryTenant->id,
            ]);

            $accounts->push($secondaryAccount);
            $primaryTenantAccounts = $primaryTenantAccounts->push($secondaryAccount)->values();
        }

        $heavyRules = PricingRule::factory()
            ->count(15)
            ->state(function () use ($primaryTenant, $pricingModules): array {
                return [
                    'tenant_id' => $primaryTenant->id,
                    'pricing_module_id' => $pricingModules->random()->id,
                ];
            })
            ->create();

        $pricingRules = $pricingRules->concat($heavyRules);

        $ledgerEvents = LedgerEvent::factory()
            ->count(50)
            ->state(function () use ($accounts, $programs): array {
                $account = $accounts->random();
                $program = $programs->where('account_id', $account->id)->first();

                return [
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                    'program_id' => $program?->id,
                ];
            })
            ->create();

        $primaryTenantAccounts->each(function (Account $account): void {
            LedgerEvent::factory()
                ->count(3)
                ->create([
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                ]);
        });

        $ledgerEvents->take(50)->each(function (LedgerEvent $event) use ($pricingRules): void {
            $rule = $pricingRules->random();

            RatedTransaction::factory()->create([
                'tenant_id' => $event->tenant_id,
                'account_id' => $event->account_id,
                'ledger_event_id' => $event->id,
                'pricing_rule_id' => $rule->id,
                'pricing_module_id' => $rule->pricing_module_id,
                'event_type' => $event->event_type,
            ]);
        });

        $roles = Role::query()->pluck('id');
        $assignRole = function (User $user) use ($roles): void {
            if ($roles->isNotEmpty()) {
                $user->roles()->sync([$roles->random()]);
            }
        };

        $demoAdmin = User::factory()->create([
            'name' => 'Demo Admin',
            'email' => 'demo.admin@example.com',
            'tenant_id' => $primaryTenant->id,
            'account_id' => null,
        ]);

        $tenantAdminRole = Role::query()->where('name', 'tenant_admin')->first();
        if ($tenantAdminRole) {
            $demoAdmin->roles()->sync([$tenantAdminRole->id]);
        } else {
            $assignRole($demoAdmin);
        }

        $primaryUser = User::factory()->create([
            'tenant_id' => $primaryTenant->id,
            'account_id' => $primaryAccount->id,
        ]);
        $assignRole($primaryUser);

        $tenants->each(function (Tenant $tenant) use ($accounts, $assignRole): void {
            $tenantUsers = User::factory()->count(2)->create([
                'tenant_id' => $tenant->id,
                'account_id' => null,
            ]);

            $tenantUsers->each($assignRole);

            $account = $accounts->firstWhere('tenant_id', $tenant->id);

            if ($account) {
                $accountUser = User::factory()->create([
                    'tenant_id' => $tenant->id,
                    'account_id' => $account->id,
                ]);

                $assignRole($accountUser);
            }
        });

        $otherUsers = User::query()->whereKeyNot($primaryUser->id)->get();

        if ($otherUsers->isNotEmpty()) {
            collect(range(1, 20))->each(function () use ($otherUsers): void {
                $actor = $otherUsers->random();

                AuditLog::factory()->create([
                    'tenant_id' => $actor->tenant_id,
                    'account_id' => $actor->account_id,
                    'actor_id' => $actor->id,
                ]);
            });
        }

        collect(range(1, 40))->each(function () use ($primaryUser): void {
            AuditLog::factory()->create([
                'tenant_id' => $primaryUser->tenant_id,
                'account_id' => $primaryUser->account_id,
                'actor_id' => $primaryUser->id,
                'action' => 'billing.statement.generated',
                'metadata' => [
                    'note' => 'Primary user activity spike',
                ],
            ]);
        });

        $primaryTenantAccounts->take(3)->each(function (Account $account) use ($demoAdmin): void {
            collect(range(1, 4))->each(function () use ($account, $demoAdmin): void {
                AuditLog::factory()->create([
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                    'actor_id' => $demoAdmin->id,
                    'action' => 'ledger_event.ingested',
                ]);
            });
        });

        $primaryTenantAccounts->take(2)->each(function (Account $account) use ($demoAdmin): void {
            collect(range(1, 3))->each(function () use ($account, $demoAdmin): void {
                AuditLog::factory()->create([
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                    'actor_id' => $demoAdmin->id,
                    'action' => 'billing.statement.generated',
                    'metadata' => [
                        'note' => 'Demo admin statement generation',
                    ],
                ]);
            });
        });

        $statementPeriods = collect(range(0, 5));

        $statementPeriods->each(function (int $offset) use ($accounts, $pricingRules): void {
            $account = $accounts->random();
            $periodStart = now()->subMonths($offset)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();

            $statement = BillingStatement::create([
                'tenant_id' => $account->tenant_id,
                'account_id' => $account->id,
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'status' => BillingStatementStatus::Draft,
                'total_amount' => 0,
                'currency' => 'USD',
                'generated_at' => now(),
            ]);

            $lineItems = collect(range(1, 2))->map(function () use ($statement, $pricingRules) {
                $rule = $pricingRules->random();
                $quantity = random_int(1, 5);
                $unitAmount = (float) $rule->amount;

                return BillingLineItem::create([
                    'billing_statement_id' => $statement->id,
                    'pricing_rule_id' => $rule->id,
                    'pricing_module_id' => $rule->pricing_module_id,
                    'event_type' => $rule->event_type,
                    'description' => 'Usage charges',
                    'quantity' => $quantity,
                    'unit_amount' => $unitAmount,
                    'total_amount' => $unitAmount * $quantity,
                    'currency' => $rule->currency,
                ]);
            });

            $statement->update([
                'total_amount' => $lineItems->sum('total_amount'),
            ]);
        });

        collect(range(1, 8))->each(function (int $offset) use ($primaryAccount, $pricingRules): void {
            $periodStart = now()->subMonths($offset)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();

            $statement = BillingStatement::create([
                'tenant_id' => $primaryAccount->tenant_id,
                'account_id' => $primaryAccount->id,
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'status' => BillingStatementStatus::Reviewed,
                'total_amount' => 0,
                'currency' => 'USD',
                'generated_at' => now(),
            ]);

            $lineItems = collect(range(1, 4))->map(function () use ($statement, $pricingRules) {
                $rule = $pricingRules->random();
                $quantity = random_int(5, 12);
                $unitAmount = (float) $rule->amount;

                return BillingLineItem::create([
                    'billing_statement_id' => $statement->id,
                    'pricing_rule_id' => $rule->id,
                    'pricing_module_id' => $rule->pricing_module_id,
                    'event_type' => $rule->event_type,
                    'description' => 'Primary account usage charges',
                    'quantity' => $quantity,
                    'unit_amount' => $unitAmount,
                    'total_amount' => $unitAmount * $quantity,
                    'currency' => $rule->currency,
                ]);
            });

            $statement->update([
                'total_amount' => $lineItems->sum('total_amount'),
            ]);
        });

        $primaryTenantAccounts->take(2)->each(function (Account $account) use ($pricingRules, $demoAdmin): void {
            collect(range(0, 2))->each(function (int $offset) use ($account, $pricingRules): void {
                $periodStart = now()->subMonths($offset)->startOfMonth();
                $periodEnd = $periodStart->copy()->endOfMonth();

                $statement = BillingStatement::create([
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                    'period_start' => $periodStart->toDateString(),
                    'period_end' => $periodEnd->toDateString(),
                    'status' => BillingStatementStatus::Draft,
                    'total_amount' => 0,
                    'currency' => 'USD',
                    'generated_at' => now(),
                ]);

                $lineItems = collect(range(1, 2))->map(function () use ($statement, $pricingRules) {
                    $rule = $pricingRules->random();
                    $quantity = random_int(1, 4);
                    $unitAmount = (float) $rule->amount;

                    return BillingLineItem::create([
                        'billing_statement_id' => $statement->id,
                        'pricing_rule_id' => $rule->id,
                        'pricing_module_id' => $rule->pricing_module_id,
                        'event_type' => $rule->event_type,
                        'description' => 'Tenant account usage charges',
                        'quantity' => $quantity,
                        'unit_amount' => $unitAmount,
                        'total_amount' => $unitAmount * $quantity,
                        'currency' => $rule->currency,
                    ]);
                });

                $statement->update([
                    'total_amount' => $lineItems->sum('total_amount'),
                ]);
            });

            collect(range(1, 2))->each(function () use ($account, $demoAdmin): void {
                AuditLog::factory()->create([
                    'tenant_id' => $account->tenant_id,
                    'account_id' => $account->id,
                    'actor_id' => $demoAdmin->id,
                    'action' => 'billing.statement.generated',
                    'metadata' => [
                        'note' => 'Demo admin statement activity',
                    ],
                ]);
            });
        });
    }
}
