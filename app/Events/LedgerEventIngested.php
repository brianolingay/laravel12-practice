<?php

namespace App\Events;

use App\Models\LedgerEvent;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LedgerEventIngested
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public LedgerEvent $ledgerEvent,
        public ?int $actorId
    ) {}
}
