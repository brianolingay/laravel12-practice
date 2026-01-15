<?php

use App\Http\Controllers\PricingRuleController;
use App\Models\AuditLog;
use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\PricingModule;
use App\Models\PricingRule;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();
        $tenantId = $user->tenant_id;
        $accountId = $user->account_id;

        return Inertia::render('dashboard', [
            'metrics' => [
                'ledgerEvents' => LedgerEvent::query()->forTenantAccount($tenantId, $accountId)->count(),
                'pricingRules' => PricingRule::query()->forTenant($tenantId)->count(),
                'statements' => BillingStatement::query()->forTenantAccount($tenantId, $accountId)->count(),
            ],
        ]);
    })->name('dashboard');

    Route::get('ledger', function () {
        Gate::authorize('viewAny', LedgerEvent::class);

        $user = request()->user();

        return Inertia::render('ledger/index', [
            'ledgerEvents' => LedgerEvent::query()
                ->forTenantAccount($user->tenant_id, $user->account_id)
                ->latest('occurred_at')
                ->take(50)
                ->get(),
        ]);
    })->name('ledger.index');

    Route::get('pricing', function () {
        Gate::authorize('viewAny', PricingRule::class);

        $user = request()->user();

        return Inertia::render('pricing/index', [
            'pricingModules' => PricingModule::query()
                ->withCount([
                    'pricingRules as rules_count' => fn ($query) => $query->forTenant($user->tenant_id),
                ])
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'description']),
        ]);
    })->name('pricing.index');

    Route::get('pricing/{pricingModule}', function (PricingModule $pricingModule) {
        Gate::authorize('viewAny', PricingRule::class);

        $user = request()->user();

        return Inertia::render('pricing/show', [
            'pricingModuleId' => $pricingModule->id,
            'pricingModule' => $pricingModule->only(['id', 'code', 'name', 'description']),
            'pricingRules' => PricingRule::query()
                ->with('pricingModule')
                ->forTenant($user->tenant_id)
                ->where('pricing_module_id', $pricingModule->id)
                ->latest('effective_from')
                ->get(),
        ]);
    })->name('pricing.show');

    Route::get('pricing-rules', function () {
        Gate::authorize('viewAny', PricingRule::class);

        $user = request()->user();

        return Inertia::render('pricing-rules/index', [
            'initialPricingRules' => PricingRule::query()
                ->with('pricingModule')
                ->forTenant($user->tenant_id)
                ->orderBy('pricing_module_id')
                ->get(),
            'pricingModules' => PricingModule::query()
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    })->name('pricing-rules.index');

    Route::post('pricing-rules', [PricingRuleController::class, 'store'])->name('pricing-rules.store');

    Route::get('pricing-rules/{pricingRule}/edit', function (PricingRule $pricingRule) {
        Gate::authorize('view', $pricingRule);

        return Inertia::render('pricing-rules/edit', [
            'pricingRule' => $pricingRule->load('pricingModule'),
            'pricingModules' => PricingModule::query()
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    })->name('pricing-rules.edit');

    Route::get('statements', function () {
        Gate::authorize('viewAny', BillingStatement::class);

        $user = request()->user();

        return Inertia::render('statements/index', [
            'statements' => BillingStatement::query()
                ->forTenantAccount($user->tenant_id, $user->account_id)
                ->latest('period_start')
                ->take(25)
                ->get(),
        ]);
    })->name('statements.index');

    Route::get('statements/{statement}', function (BillingStatement $statement) {
        Gate::authorize('view', $statement);

        $statement->load('lineItems');

        return Inertia::render('statements/show', [
            'statement' => $statement,
            'lineItems' => $statement->lineItems,
        ]);
    })->name('statements.show');

    Route::get('audit-log', function () {
        Gate::authorize('viewAny', AuditLog::class);

        $user = request()->user();

        return Inertia::render('audit-log/index', [
            'auditLogs' => AuditLog::query()
                ->forTenantAccount($user->tenant_id, $user->account_id)
                ->latest('created_at')
                ->take(50)
                ->get(),
        ]);
    })->name('audit-log.index');
});

require __DIR__.'/settings.php';
