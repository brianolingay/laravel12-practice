<?php

namespace App\Actions\Statements;

use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use Illuminate\Database\Eloquent\Collection;

class GetStatementDetails
{
    /**
     * @return array{statement: BillingStatement, lineItems: Collection<int, BillingLineItem>}
     */
    public function execute(BillingStatement $statement): array
    {
        $statement->load('lineItems');

        return [
            'statement' => $statement,
            'lineItems' => $statement->lineItems,
        ];
    }
}
