<?php

namespace App\Services;

use App\Actions\Pricing\RateLedgerEventsForPeriod;
use Carbon\CarbonImmutable;

class RatingEngine
{
    public function __construct(private RateLedgerEventsForPeriod $rateLedgerEventsForPeriod) {}

    public function rateForPeriod(
        int $tenantId,
        ?int $accountId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): int {
        return $this->rateLedgerEventsForPeriod->execute(
            $tenantId,
            $accountId,
            $periodStart,
            $periodEnd
        );
    }
}
