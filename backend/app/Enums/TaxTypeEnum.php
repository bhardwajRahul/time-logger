<?php

declare(strict_types=1);

namespace App\Enums;

enum TaxTypeEnum: string
{
    case Percentage = 'percentage';
    case Fixed = 'fixed';
}
