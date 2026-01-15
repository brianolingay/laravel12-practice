<?php

use App\Models\Account;
use App\Models\LedgerEvent;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\RatedTransaction;
use App\Models\Tenant;
use App\Services\RatingEngine;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('rating engine creates rated transactions once', function () {
    $tenant = Tenant::factory()->create();
    $account = Account::factory()->for($tenant)->create();
    $module = PricingModule::factory()->create(['code' => 'WAREHOUSE_MANAGER']);

    PricingRule::factory()->create([
        'tenant_id' => $tenant->id,
        'pricing_module_id' => $module->id,
        'rule_type' => 'per_event',
        'event_type' => 'ShipmentCreated',
        'amount' => 2,
        'currency' => 'USD',
        'effective_from' => now()->startOfMonth()->toDateString(),
    ]);

    LedgerEvent::factory()->for($tenant)->for($account)->create([
        'event_type' => 'ShipmentCreated',
        'occurred_at' => now()->subDay(),
    ]);

    $engine = app(RatingEngine::class);
    $periodStart = CarbonImmutable::now()->startOfMonth();
    $periodEnd = CarbonImmutable::now()->endOfMonth();

    $created = $engine->rateForPeriod($tenant->id, $account->id, $periodStart, $periodEnd);

    expect($created)->toBe(1);
    expect(RatedTransaction::query()->count())->toBe(1);

    $createdAgain = $engine->rateForPeriod($tenant->id, $account->id, $periodStart, $periodEnd);

    expect($createdAgain)->toBe(0);
    expect(RatedTransaction::query()->count())->toBe(1);
});
