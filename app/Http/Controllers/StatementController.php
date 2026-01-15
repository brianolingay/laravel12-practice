<?php

namespace App\Http\Controllers;

use App\Actions\Statements\GetStatementDetails;
use App\Actions\Statements\ListStatements;
use App\Models\BillingStatement;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StatementController extends Controller
{
    public function __construct(
        private ListStatements $listStatements,
        private GetStatementDetails $getStatementDetails
    ) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', BillingStatement::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('statements/index', [
            'statements' => $this->listStatements->execute($user),
        ]);
    }

    public function show(BillingStatement $statement): Response
    {
        Gate::authorize('view', $statement);

        return Inertia::render('statements/show', $this->getStatementDetails->execute($statement));
    }
}
