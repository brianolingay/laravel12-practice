<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['code' => 'DIAGNOSTICALLY'],
            ['name' => 'Diagnostically']
        );

        $account = Account::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'LAB_PARTNER'],
            ['name' => 'Lab Partner']
        );

        $roles = Role::query()->pluck('id', 'name');

        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@diagnostically.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('secret'),
                'tenant_id' => $tenant->id,
                'account_id' => null,
                'email_verified_at' => now(),
            ]
        );
        if (isset($roles['super_admin'])) {
            $superAdmin->roles()->sync([$roles['super_admin']]);
        }

        $tenantAdmin = User::firstOrCreate(
            ['email' => 'tenant@lab.test'],
            [
                'name' => 'Tenant Admin',
                'password' => Hash::make('secret'),
                'tenant_id' => $tenant->id,
                'account_id' => null,
                'email_verified_at' => now(),
            ]
        );
        if (isset($roles['tenant_admin'])) {
            $tenantAdmin->roles()->sync([$roles['tenant_admin']]);
        }

        $accountAdmin = User::firstOrCreate(
            ['email' => 'account@client.test'],
            [
                'name' => 'Account Admin',
                'password' => Hash::make('secret'),
                'tenant_id' => $tenant->id,
                'account_id' => $account->id,
                'email_verified_at' => now(),
            ]
        );

        if (isset($roles['account_admin'])) {
            $accountAdmin->roles()->sync([$roles['account_admin']]);
        }

        $modules = [
            ['code' => 'CORE_PLATFORM', 'name' => 'Core Platform'],
            ['code' => 'WAREHOUSE_MANAGER', 'name' => 'Warehouse Manager'],
            ['code' => 'PROVIDER_PORTAL', 'name' => 'Provider Portal'],
            ['code' => 'CASE_MANAGEMENT', 'name' => 'Case Management'],
            ['code' => 'DIRECT_MAIL', 'name' => 'Direct Mail'],
            ['code' => 'TELEHEALTH_INTEGRATION', 'name' => 'Telehealth Integration'],
        ];

        $moduleRecords = collect($modules)->mapWithKeys(function (array $module): array {
            return [$module['code'] => PricingModule::firstOrCreate(['code' => $module['code']], $module)];
        });

        PricingRule::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'pricing_module_id' => $moduleRecords['CORE_PLATFORM']->id,
                'rule_type' => 'flat',
                'amount' => 5000,
            ],
            [
                'currency' => 'USD',
                'event_type' => null,
                'tier_definition' => null,
                'effective_from' => now()->startOfMonth()->toDateString(),
                'effective_to' => null,
            ]
        );

        PricingRule::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'pricing_module_id' => $moduleRecords['WAREHOUSE_MANAGER']->id,
                'rule_type' => 'per_event',
                'amount' => 2,
                'event_type' => 'ShipmentCreated',
            ],
            [
                'currency' => 'USD',
                'tier_definition' => null,
                'effective_from' => now()->startOfMonth()->toDateString(),
                'effective_to' => null,
            ]
        );

        PricingRule::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'pricing_module_id' => $moduleRecords['TELEHEALTH_INTEGRATION']->id,
                'rule_type' => 'flat',
                'amount' => 0,
            ],
            [
                'currency' => 'USD',
                'event_type' => null,
                'tier_definition' => null,
                'effective_from' => now()->startOfMonth()->toDateString(),
                'effective_to' => null,
            ]
        );
    }
}
