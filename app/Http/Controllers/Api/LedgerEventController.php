<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLedgerEventRequest;
use App\Models\AuditLog;
use App\Models\LedgerEvent;
use App\Rules\AllowedMetadataKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class LedgerEventController extends Controller
{
    public function store(StoreLedgerEventRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $tenantId = (int) $validated['tenant_id'];
        $accountId = $validated['account_id'] ?? null;

        $user = $request->user();

        if (! $user?->isSuperAdmin() && $user?->tenant_id !== $tenantId) {
            abort(403);
        }

        if ($user?->account_id !== null && $user->account_id !== $accountId) {
            abort(403);
        }

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
            return response()->json($existing, 200);
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

        AuditLog::create([
            'tenant_id' => $tenantId,
            'account_id' => $accountId,
            'actor_id' => $request->user()?->id,
            'action' => 'ledger_event.ingested',
            'metadata' => [
                'ledger_event_id' => $ledgerEvent->id,
                'event_type' => $ledgerEvent->event_type,
                'external_reference_id' => $ledgerEvent->external_reference_id,
            ],
        ]);

        return response()->json($ledgerEvent, 201);
    }
}
