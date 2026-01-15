<?php

namespace App\Actions\Pricing;

use App\Models\PricingModule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetPricingModulesIndexData
{
    /**
     * @return array{pricingModules: Collection<int, PricingModule>}
     */
    public function execute(User $user): array
    {
        return [
            'pricingModules' => PricingModule::query()
                ->withCount([
                    'pricingRules as rules_count' => fn ($query) => $query->forTenant($user->tenant_id),
                ])
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'description']),
        ];
    }
}
