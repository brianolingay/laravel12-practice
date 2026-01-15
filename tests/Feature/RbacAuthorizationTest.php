<?php

use App\Models\Account;
use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\Permission;
use App\Models\PricingRule;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

function userWithPermission(string $permission, Tenant $tenant, ?Account $account = null): User
{
    $permissionModel = Permission::factory()->create(['name' => $permission]);
    $role = Role::factory()->create(['name' => $permission.'-role']);
    $role->permissions()->sync([$permissionModel->id]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'account_id' => $account?->id,
    ]);

    $user->roles()->sync([$role->id]);

    return $user;
}

test('cross-tenant access is blocked', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $accountA = Account::factory()->for($tenantA)->create();
    $accountB = Account::factory()->for($tenantB)->create();

    $user = userWithPermission('view_ledger', $tenantA, $accountA);
    $event = LedgerEvent::factory()->for($tenantB)->for($accountB)->create();

    expect(Gate::forUser($user)->allows('view', $event))->toBeFalse();
});

test('permissions gate pricing ledger and statement actions', function () {
    $tenant = Tenant::factory()->create();

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
    ]);

    expect(Gate::forUser($user)->allows('create', LedgerEvent::class))->toBeFalse();
    expect(Gate::forUser($user)->allows('create', PricingRule::class))->toBeFalse();
    expect(Gate::forUser($user)->allows('viewAny', BillingStatement::class))->toBeFalse();
});
