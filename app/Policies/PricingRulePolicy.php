<?php

namespace App\Policies;

use App\Models\PricingRule;
use App\Models\User;

class PricingRulePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('manage_pricing');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PricingRule $pricingRule): bool
    {
        return $user->hasPermission('manage_pricing')
            && $user->tenant_id === $pricingRule->tenant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('manage_pricing');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PricingRule $pricingRule): bool
    {
        return $user->hasPermission('manage_pricing')
            && $user->tenant_id === $pricingRule->tenant_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PricingRule $pricingRule): bool
    {
        return $user->hasPermission('manage_pricing')
            && $user->tenant_id === $pricingRule->tenant_id;
    }
}
