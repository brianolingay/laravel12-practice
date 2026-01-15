<?php

namespace App\Actions\Statements;

use App\Actions\Pricing\MatchFlatPricingRules;
use App\Actions\Pricing\RateLedgerEventsForPeriod;
use App\BillingStatementStatus;
use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use App\Models\PricingRule;
use App\Models\RatedTransaction;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GenerateStatement
{
    public function __construct(
        private RateLedgerEventsForPeriod $rateLedgerEventsForPeriod,
        private MatchFlatPricingRules $matchFlatPricingRules
    ) {}

    public function execute(
        int $tenantId,
        ?int $accountId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): BillingStatement {
        $this->rateLedgerEventsForPeriod->execute($tenantId, $accountId, $periodStart, $periodEnd);

        $rules = PricingRule::query()
            ->with('pricingModule')
            ->forTenant($tenantId)
            ->get();

        $ratedTransactions = RatedTransaction::query()
            ->with('pricingRule', 'pricingModule')
            ->forTenantAccount($tenantId, $accountId)
            ->whereBetween('rated_at', [$periodStart->startOfDay(), $periodEnd->endOfDay()])
            ->get();

        return DB::transaction(function () use ($tenantId, $accountId, $periodStart, $periodEnd, $rules, $ratedTransactions): BillingStatement {
            $statement = BillingStatement::create([
                'tenant_id' => $tenantId,
                'account_id' => $accountId,
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'status' => BillingStatementStatus::Draft,
                'total_amount' => 0,
                'currency' => 'USD',
                'generated_at' => now(),
            ]);

            $lineItems = collect();

            $ratedTransactions
                ->groupBy(fn (RatedTransaction $transaction) => $transaction->pricing_rule_id.'|'.$transaction->event_type)
                ->each(function (Collection $transactions) use ($statement, &$lineItems): void {
                    $sample = $transactions->first();
                    $quantity = $transactions->count();
                    $unitAmount = $sample->amount;
                    $moduleCode = $sample->pricingModule?->code ?? 'UNKNOWN_MODULE';
                    $eventType = $sample->event_type ?? 'Event';

                    $lineItems->push(BillingLineItem::create([
                        'billing_statement_id' => $statement->id,
                        'pricing_rule_id' => $sample->pricing_rule_id,
                        'pricing_module_id' => $sample->pricing_module_id,
                        'event_type' => $sample->event_type,
                        'description' => sprintf('%s - %s charges', $moduleCode, $eventType),
                        'quantity' => $quantity,
                        'unit_amount' => $unitAmount,
                        'total_amount' => $quantity * $unitAmount,
                        'currency' => $sample->currency,
                    ]));
                });

            $flatRules = $this->matchFlatPricingRules->execute($rules, $periodStart, $periodEnd);

            $flatRules->each(function (PricingRule $rule) use ($statement, &$lineItems): void {
                $moduleCode = $rule->pricingModule?->code ?? 'UNKNOWN_MODULE';

                $lineItems->push(BillingLineItem::create([
                    'billing_statement_id' => $statement->id,
                    'pricing_rule_id' => $rule->id,
                    'pricing_module_id' => $rule->pricing_module_id,
                    'event_type' => null,
                    'description' => sprintf('%s - flat monthly charge', $moduleCode),
                    'quantity' => 1,
                    'unit_amount' => $rule->amount,
                    'total_amount' => $rule->amount,
                    'currency' => $rule->currency,
                ]));
            });

            $statement->update([
                'total_amount' => $lineItems->sum('total_amount'),
            ]);

            return $statement;
        });
    }
}
