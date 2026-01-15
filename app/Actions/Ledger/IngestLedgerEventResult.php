<?php

namespace App\Actions\Ledger;

use App\Models\LedgerEvent;

class IngestLedgerEventResult
{
    public function __construct(
        public LedgerEvent $ledgerEvent,
        public bool $wasCreated
    ) {}
}
