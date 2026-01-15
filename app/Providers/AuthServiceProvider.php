<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\BillingStatement;
use App\Models\LedgerEvent;
use App\Models\PricingRule;
use App\Models\User;
use App\Policies\AuditLogPolicy;
use App\Policies\BillingStatementPolicy;
use App\Policies\LedgerEventPolicy;
use App\Policies\PricingRulePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Gate::policy(AuditLog::class, AuditLogPolicy::class);
        Gate::policy(LedgerEvent::class, LedgerEventPolicy::class);
        Gate::policy(PricingRule::class, PricingRulePolicy::class);
        Gate::policy(BillingStatement::class, BillingStatementPolicy::class);

        Gate::before(function (?User $user): ?bool {
            return $user?->isSuperAdmin() ? true : null;
        });
    }
}
