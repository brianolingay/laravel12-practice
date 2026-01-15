<?php

namespace App\Http\Controllers;

use App\Actions\Pricing\GetPricingRuleEditData;
use App\Actions\Pricing\GetPricingRulesIndexData;
use App\Models\PricingRule;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PricingRulePageController extends Controller
{
    public function __construct(
        private GetPricingRulesIndexData $getPricingRulesIndexData,
        private GetPricingRuleEditData $getPricingRuleEditData
    ) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', PricingRule::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('pricing-rules/index', $this->getPricingRulesIndexData->execute($user));
    }

    public function edit(PricingRule $pricingRule): Response
    {
        Gate::authorize('view', $pricingRule);

        return Inertia::render('pricing-rules/edit', $this->getPricingRuleEditData->execute($pricingRule));
    }
}
