<?php

namespace App\Actions\Ledger;

use App\Events\LedgerEventIngested;
use App\Models\LedgerEvent;
use App\Models\User;
use App\Rules\AllowedMetadataKeys;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class IngestLedgerEvent
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(array $validated, ?User $user): IngestLedgerEventResult
    {
        $tenantId = (int) $validated['tenant_id'];
        $accountId = $validated['account_id'] ?? null;

        if (! $user?->isSuperAdmin() && $user?->tenant_id !== $tenantId) {
            abort(403);
        }

        if ($user?->account_id !== null && $user->account_id !== $accountId) {
            abort(403);
        }

        return DB::transaction(function () use ($validated, $tenantId, $accountId, $user): IngestLedgerEventResult {
            $existing = LedgerEvent::query()
                ->where('tenant_id', $tenantId)
                ->when($accountId !== null, function ($query) use ($accountId): void {
                    $query->where('account_id', $accountId);
                }, function ($query): void {
                    $query->whereNull('account_id');
                })
                ->where('external_reference_id', $validated['external_reference_id'])
                ->first();

            if ($existing) {
                return new IngestLedgerEventResult($existing, false);
            }

            $metadata = Arr::only($validated['metadata'] ?? [], AllowedMetadataKeys::keys());

            $ledgerEvent = LedgerEvent::create([
                'tenant_id' => $tenantId,
                'account_id' => $accountId,
                'program_id' => $validated['program_id'] ?? null,
                'event_type' => $validated['event_type'],
                'external_reference_id' => $validated['external_reference_id'],
                'metadata' => $metadata,
                'occurred_at' => $validated['occurred_at'],
            ]);

            event(new LedgerEventIngested($ledgerEvent, $user?->id));

            return new IngestLedgerEventResult($ledgerEvent, true);
        });
    }
}
