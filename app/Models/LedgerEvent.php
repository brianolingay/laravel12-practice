<?php

namespace App\Models;

use App\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use RuntimeException;

class LedgerEvent extends Model
{
    /** @use HasFactory<\Database\Factories\LedgerEventFactory> */
    use HasFactory;

    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'account_id',
        'program_id',
        'event_type',
        'external_reference_id',
        'metadata',
        'occurred_at',
    ];

    protected static function booted(): void
    {
        static::updating(function (): void {
            throw new RuntimeException('Ledger events are immutable.');
        });

        static::deleting(function (): void {
            throw new RuntimeException('Ledger events are immutable.');
        });
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function ratedTransaction(): HasOne
    {
        return $this->hasOne(RatedTransaction::class);
    }
}
