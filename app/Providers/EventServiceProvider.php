<?php

namespace App\Providers;

use App\Events\LedgerEventIngested;
use App\Listeners\CreateLedgerEventAuditLog;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        LedgerEventIngested::class => [
            CreateLedgerEventAuditLog::class,
        ],
    ];
}
