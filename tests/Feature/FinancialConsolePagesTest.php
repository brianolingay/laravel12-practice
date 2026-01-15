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
use Inertia\Testing\AssertableInertia as Assert;

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

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
        );
    $this->get(route('ledger.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('ledger/index')
        );
    $this->get(route('pricing.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('pricing/index')
        );
    $this->get(route('pricing.show', $pricingModule))
        ->assertInertia(fn (Assert $page) => $page
            ->component('pricing/show')
        );
    $this->get(route('statements.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('statements/index')
        );
    $this->get(route('audit-log.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit-log/index')
        );
    $this->get(route('statements.show', $statement))
        ->assertInertia(fn (Assert $page) => $page
            ->component('statements/show')
        );
});
