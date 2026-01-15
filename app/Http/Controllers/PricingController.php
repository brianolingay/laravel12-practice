<?php

namespace App\Http\Controllers;

use App\Actions\Pricing\GetPricingModuleDetails;
use App\Actions\Pricing\GetPricingModulesIndexData;
use App\Models\PricingModule;
use App\Models\PricingRule;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function __construct(
        private GetPricingModulesIndexData $getPricingModulesIndexData,
        private GetPricingModuleDetails $getPricingModuleDetails
    ) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', PricingRule::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('pricing/index', $this->getPricingModulesIndexData->execute($user));
    }

    public function show(PricingModule $pricingModule): Response
    {
        Gate::authorize('viewAny', PricingRule::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('pricing/show', $this->getPricingModuleDetails->execute($user, $pricingModule));
    }
}
