<?php

namespace App;

enum BillingStatementStatus: string
{
    case Draft = 'draft';
    case Reviewed = 'reviewed';
    case Finalized = 'finalized';
}
