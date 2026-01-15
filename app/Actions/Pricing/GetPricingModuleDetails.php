<?php

namespace App\Actions\Pricing;

use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetPricingModuleDetails
{
    /**
     * @return array{pricingModuleId: int, pricingModule: array{id: int, code: string, name: string, description: string|null}, pricingRules: Collection<int, PricingRule>}
     */
    public function execute(User $user, PricingModule $pricingModule): array
    {
        return [
            'pricingModuleId' => $pricingModule->id,
            'pricingModule' => $pricingModule->only(['id', 'code', 'name', 'description']),
            'pricingRules' => PricingRule::query()
                ->with('pricingModule')
                ->forTenant($user->tenant_id)
                ->where('pricing_module_id', $pricingModule->id)
                ->latest('effective_from')
                ->get(),
        ];
    }
}
