<?php

namespace App\Actions\Pricing;

use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetPricingRulesIndexData
{
    /**
     * @return array{initialPricingRules: Collection<int, PricingRule>, pricingModules: Collection<int, PricingModule>}
     */
    public function execute(User $user): array
    {
        return [
            'initialPricingRules' => PricingRule::query()
                ->with('pricingModule')
                ->forTenant($user->tenant_id)
                ->orderBy('pricing_module_id')
                ->get(),
            'pricingModules' => PricingModule::query()
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ];
    }
}
