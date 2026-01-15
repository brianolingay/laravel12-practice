<?php

use App\Models\Account;
use App\Models\AuditLog;
use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\Permission;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;

function userWithPermissions(array $permissions, Tenant $tenant, ?Account $account = null): User
{
    $permissionModels = collect($permissions)->map(fn (string $permission) => Permission::factory()->create(['name' => $permission])
    );
    $role = Role::factory()->create(['name' => 'financial-console-role']);
    $role->permissions()->sync($permissionModels->pluck('id'));

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'account_id' => $account?->id,
    ]);

    $user->roles()->sync([$role->id]);

    return $user;
}

test('authorized users can view financial console pages', function () {
    $tenant = Tenant::factory()->create();
    $account = Account::factory()->for($tenant)->create();

    $user = userWithPermissions([
        'view_ledger',
        'manage_pricing',
        'generate_statements',
    ], $tenant, $account);

    LedgerEvent::factory()->for($tenant)->for($account)->create();
    $pricingModule = PricingModule::factory()->create();
    PricingRule::factory()->for($tenant)->for($pricingModule)->create();
    AuditLog::factory()->for($tenant)->for($account)->create();

    $statement = BillingStatement::factory()->for($tenant)->for($account)->create();
    BillingLineItem::factory()->for($statement)->create();

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
    $this->get(route('ledger.index'))->assertOk();
    $this->get(route('pricing-rules.index'))->assertOk();
    $this->get(route('statements.index'))->assertOk();
    $this->get(route('audit-log.index'))->assertOk();
    $this->get(route('statements.show', $statement))->assertOk();
});
