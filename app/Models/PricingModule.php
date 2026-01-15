<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PricingModule extends Model
{
    /** @use HasFactory<\Database\Factories\PricingModuleFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
    ];

    public function pricingRules(): HasMany
    {
        return $this->hasMany(PricingRule::class);
    }
}
