<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePricingRuleRequest;
use App\Models\PricingRule;
use Illuminate\Http\RedirectResponse;

class PricingRuleController extends Controller
{
    public function store(StorePricingRuleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        PricingRule::create([
            'tenant_id' => $user->tenant_id,
            'pricing_module_id' => (int) $validated['pricing_module_id'],
            'rule_type' => $validated['rule_type'],
            'amount' => $validated['amount'],
            'currency' => 'USD',
            'event_type' => $validated['event_type'] ?? null,
            'tier_definition' => null,
            'effective_from' => now()->startOfMonth()->toDateString(),
            'effective_to' => null,
        ]);

        return redirect()->back();
    }
}
