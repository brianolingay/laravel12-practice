<?php

namespace App\Http\Controllers;

use App\Actions\Ledger\GetRecentLedgerEvents;
use App\Models\LedgerEvent;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function __construct(private GetRecentLedgerEvents $getRecentLedgerEvents) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', LedgerEvent::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('ledger/index', [
            'ledgerEvents' => $this->getRecentLedgerEvents->execute($user),
        ]);
    }
}
