<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\GetDashboardMetrics;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private GetDashboardMetrics $getDashboardMetrics) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        return Inertia::render('dashboard', [
            'metrics' => $this->getDashboardMetrics->execute($user),
        ]);
    }
}
