<?php

namespace App\Http\Controllers;

use App\Actions\Pricing\CreatePricingRule;
use App\Http\Requests\StorePricingRuleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class PricingRuleController extends Controller
{
    public function __construct(private CreatePricingRule $createPricingRule) {}

    public function store(StorePricingRuleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        /** @var User $user */
        $user = $request->user();

        $this->createPricingRule->execute($user, $validated);

        return redirect()->back();
    }
}
