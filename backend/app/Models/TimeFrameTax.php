<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class TimeFrameTax extends Pivot
{
    use HasUlids;

    public $incrementing = false;

    protected $fillable = [
        'time_frame_id',
        'tax_id',
    ];

    public function timeFrame(): BelongsTo
    {
        return $this->belongsTo(TimeFrame::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }
}
