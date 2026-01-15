<?php

use App\Models\Account;
use App\Models\LedgerEvent;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function createLedgerUser(Tenant $tenant, ?Account $account = null): User
{
    $permission = Permission::factory()->create(['name' => 'view_ledger']);
    $role = Role::factory()->create(['name' => 'ledger_user']);
    $role->permissions()->sync([$permission->id]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'account_id' => $account?->id,
    ]);

    $user->roles()->sync([$role->id]);

    return $user;
}

test('accepts valid ledger events', function () {
    $tenant = Tenant::factory()->create();
    $account = Account::factory()->for($tenant)->create();
    $user = createLedgerUser($tenant, $account);

    $payload = [
        'tenant_id' => $tenant->id,
        'account_id' => $account->id,
        'event_type' => 'ShipmentCreated',
        'external_reference_id' => 'SHIP_123',
        'occurred_at' => now()->toISOString(),
        'metadata' => [
            'source' => 'lab',
            'counts' => ['shipments' => 1],
        ],
    ];

    Sanctum::actingAs($user);

    $this->postJson(route('ledger-events.store'), $payload)
        ->assertCreated();

    expect(LedgerEvent::query()->count())->toBe(1);
});

test('rejects invalid ledger events', function () {
    $tenant = Tenant::factory()->create();
    $user = createLedgerUser($tenant);

    Sanctum::actingAs($user);

    $this->postJson(route('ledger-events.store'), [
        'tenant_id' => $tenant->id,
        'external_reference_id' => 'MISSING_FIELDS',
    ])
        ->assertUnprocessable();
});

test('returns existing event on idempotent ingestion', function () {
    $tenant = Tenant::factory()->create();
    $account = Account::factory()->for($tenant)->create();
    $user = createLedgerUser($tenant, $account);

    $payload = [
        'tenant_id' => $tenant->id,
        'account_id' => $account->id,
        'event_type' => 'ShipmentCreated',
        'external_reference_id' => 'SHIP_456',
        'occurred_at' => now()->toISOString(),
        'metadata' => [
            'source' => 'lab',
        ],
    ];

    Sanctum::actingAs($user);

    $firstResponse = $this->postJson(route('ledger-events.store'), $payload)
        ->assertCreated()
        ->json();

    $secondResponse = $this->postJson(route('ledger-events.store'), $payload)
        ->assertOk()
        ->json();

    expect($secondResponse['id'])->toBe($firstResponse['id']);
});
