<?php

namespace App\Http\Controllers;

use App\Actions\AuditLog\ListAuditLogs;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(private ListAuditLogs $listAuditLogs) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', AuditLog::class);

        /** @var User $user */
        $user = request()->user();

        return Inertia::render('audit-log/index', [
            'auditLogs' => $this->listAuditLogs->execute($user),
        ]);
    }
}
