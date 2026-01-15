<?php

namespace App\Http\Controllers\Api;

use App\Actions\Ledger\IngestLedgerEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLedgerEventRequest;
use Illuminate\Http\JsonResponse;

class LedgerEventController extends Controller
{
    public function __construct(private IngestLedgerEvent $ingestLedgerEvent) {}

    public function store(StoreLedgerEventRequest $request): JsonResponse
    {
        $result = $this->ingestLedgerEvent->execute($request->validated(), $request->user());

        return response()->json(
            $result->ledgerEvent,
            $result->wasCreated ? 201 : 200
        );
    }
}
