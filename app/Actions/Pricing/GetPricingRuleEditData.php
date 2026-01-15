<?php

namespace App\Actions\Pricing;

use App\Models\PricingModule;
use App\Models\PricingRule;
use Illuminate\Database\Eloquent\Collection;

class GetPricingRuleEditData
{
    /**
     * @return array{pricingRule: PricingRule, pricingModules: Collection<int, PricingModule>}
     */
    public function execute(PricingRule $pricingRule): array
    {
        return [
            'pricingRule' => $pricingRule->load('pricingModule'),
            'pricingModules' => PricingModule::query()
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ];
    }
}
