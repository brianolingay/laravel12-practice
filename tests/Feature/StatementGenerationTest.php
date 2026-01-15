<?php

use App\BillingStatementStatus;
use App\Models\Account;
use App\Models\LedgerEvent;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\Tenant;
use App\Services\StatementGenerator;
use Carbon\CarbonImmutable;

test('statement generation creates expected line items', function () {
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

    $generator = app(StatementGenerator::class);
    $periodStart = CarbonImmutable::now()->startOfMonth();
    $periodEnd = CarbonImmutable::now()->endOfMonth();

    $statement = $generator->generate($tenant->id, $account->id, $periodStart, $periodEnd);

    $statement->load('lineItems');

    expect($statement->lineItems)->toHaveCount(1);
    expect($statement->lineItems->first()->total_amount)->toBe(2);
});

test('statement status transitions are enforced', function () {
    $tenant = Tenant::factory()->create();
    $account = Account::factory()->for($tenant)->create();

    $statement = $account->billingStatements()->create([
        'tenant_id' => $tenant->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
        'status' => BillingStatementStatus::Draft,
        'total_amount' => 0,
        'currency' => 'USD',
        'generated_at' => now(),
    ]);

    $generator = app(StatementGenerator::class);

    $generator->transitionStatus($statement, BillingStatementStatus::Reviewed);

    expect($statement->refresh()->status)->toBe(BillingStatementStatus::Reviewed);

    $generator->transitionStatus($statement, BillingStatementStatus::Finalized);

    expect($statement->refresh()->status)->toBe(BillingStatementStatus::Finalized);
});
