<?php

namespace App\Actions\Pricing;

use App\Models\PricingRule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class MatchFlatPricingRules
{
    /**
     * @param  Collection<int, PricingRule>  $rules
     * @return Collection<int, PricingRule>
     */
    public function execute(
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
