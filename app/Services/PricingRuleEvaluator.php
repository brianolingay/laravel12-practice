<?php

namespace App\Services;

use App\Models\LedgerEvent;
use App\Models\PricingRule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class PricingRuleEvaluator
{
    /**
     * @param  Collection<int, PricingRule>  $rules
     * @return Collection<int, PricingRule>
     */
    public function matchingPerEventRules(LedgerEvent $event, Collection $rules): Collection
    {
        return $rules
            ->filter(fn (PricingRule $rule) => $rule->rule_type === 'per_event')
            ->filter(function (PricingRule $rule) use ($event): bool {
                return $rule->event_type === $event->event_type;
            })
            ->filter(function (PricingRule $rule) use ($event): bool {
                $occurredAt = CarbonImmutable::parse($event->occurred_at)->toDateString();

                if ($rule->effective_from->toDateString() > $occurredAt) {
                    return false;
                }

                if ($rule->effective_to && $rule->effective_to->toDateString() < $occurredAt) {
                    return false;
                }

                return true;
            });
    }

    /**
     * @param  Collection<int, PricingRule>  $rules
     * @return Collection<int, PricingRule>
     */
    public function matchingFlatRules(
        Collection $rules,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): Collection {
        return $rules
            ->filter(fn (PricingRule $rule) => $rule->rule_type === 'flat')
            ->filter(function (PricingRule $rule) use ($periodStart, $periodEnd): bool {
                if ($rule->effective_from->greaterThan($periodEnd)) {
                    return false;
                }

                if ($rule->effective_to && $rule->effective_to->lessThan($periodStart)) {
                    return false;
                }

                return true;
            });
    }
}
