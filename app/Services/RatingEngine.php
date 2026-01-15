<?php

namespace App\Services;

use App\Models\LedgerEvent;
use App\Models\PricingRule;
use App\Models\RatedTransaction;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class RatingEngine
{
    public function __construct(private PricingRuleEvaluator $pricingRuleEvaluator) {}

    public function rateForPeriod(
        int $tenantId,
        ?int $accountId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): int {
        $rules = PricingRule::query()
            ->with('pricingModule')
            ->forTenant($tenantId)
            ->get();

        $events = LedgerEvent::query()
            ->with('ratedTransaction')
            ->forTenantAccount($tenantId, $accountId)
            ->whereBetween('occurred_at', [$periodStart->startOfDay(), $periodEnd->endOfDay()])
            ->get();

        return DB::transaction(function () use ($events, $rules): int {
            $created = 0;

            $events->each(function (LedgerEvent $event) use ($rules, &$created): void {
                if ($event->ratedTransaction) {
                    return;
                }

                $matchingRules = $this->pricingRuleEvaluator->matchingPerEventRules($event, $rules);

                if ($matchingRules->isEmpty()) {
                    return;
                }

                $rule = $matchingRules->first();
                $moduleCode = $rule->pricingModule?->code ?? 'UNKNOWN_MODULE';

                RatedTransaction::create([
                    'tenant_id' => $event->tenant_id,
                    'account_id' => $event->account_id,
                    'ledger_event_id' => $event->id,
                    'pricing_rule_id' => $rule->id,
                    'pricing_module_id' => $rule->pricing_module_id,
                    'event_type' => $event->event_type,
                    'amount' => $rule->amount,
                    'currency' => $rule->currency,
                    'explanation' => sprintf(
                        'Matched %s rule for module %s at %s for event %s.',
                        $rule->rule_type,
                        $moduleCode,
                        number_format((float) $rule->amount, 2),
                        $event->event_type
                    ),
                    'rated_at' => now(),
                ]);

                $created++;
            });

            return $created;
        });
    }
}
