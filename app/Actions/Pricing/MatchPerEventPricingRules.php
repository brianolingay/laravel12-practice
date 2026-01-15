<?php

namespace App\Actions\Pricing;

use App\Models\LedgerEvent;
use App\Models\PricingRule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class MatchPerEventPricingRules
{
    /**
     * @param  Collection<int, PricingRule>  $rules
     * @return Collection<int, PricingRule>
     */
    public function execute(LedgerEvent $event, Collection $rules): Collection
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
}
