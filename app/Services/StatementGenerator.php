<?php

namespace App\Services;

use App\Actions\Statements\GenerateStatement;
use App\BillingStatementStatus;
use App\Models\BillingStatement;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

class StatementGenerator
{
    public function __construct(private GenerateStatement $generateStatement) {}

    public function generate(
        int $tenantId,
        ?int $accountId,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): BillingStatement {
        return $this->generateStatement->execute(
            $tenantId,
            $accountId,
            $periodStart,
            $periodEnd
        );
    }

    public function transitionStatus(BillingStatement $statement, BillingStatementStatus $status): BillingStatement
    {
        $allowed = [
            BillingStatementStatus::Draft->value => BillingStatementStatus::Reviewed,
            BillingStatementStatus::Reviewed->value => BillingStatementStatus::Finalized,
        ];

        $current = $statement->status->value;

        if (! isset($allowed[$current]) || $allowed[$current] !== $status) {
            throw new InvalidArgumentException('Invalid billing statement status transition.');
        }

        $statement->update(['status' => $status]);

        return $statement;
    }
}
