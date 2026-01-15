<?php

namespace App\Listeners;

use App\Events\LedgerEventIngested;
use App\Models\AuditLog;

class CreateLedgerEventAuditLog
{
    /**
     * Handle the event.
     */
    public function handle(LedgerEventIngested $event): void
    {
        $ledgerEvent = $event->ledgerEvent;

        AuditLog::create([
            'tenant_id' => $ledgerEvent->tenant_id,
            'account_id' => $ledgerEvent->account_id,
            'actor_id' => $event->actorId,
            'action' => 'ledger_event.ingested',
            'metadata' => [
                'ledger_event_id' => $ledgerEvent->id,
                'event_type' => $ledgerEvent->event_type,
                'external_reference_id' => $ledgerEvent->external_reference_id,
            ],
        ]);
    }
}
