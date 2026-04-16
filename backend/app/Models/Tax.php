<?php

namespace App\Models;

use App\Enums\TaxTypeEnum;
use App\Http\Filters\Api\V1\Filters\TaxFilter;
use App\Traits\Api\HasCacheControl;
use Database\Factories\TaxFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tax extends Model
{
    /** @use HasFactory<TaxFactory> */
    use HasCacheControl, HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'name',
        'rate',
        'type',
        'is_compound',
        'is_inclusive',
        'enabled_by_default',
        'sort',
    ];

    protected $attributes = [
        'is_compound' => false,
        'is_inclusive' => false,
        'enabled_by_default' => false,
    ];

    protected $casts = [
        'type' => TaxTypeEnum::class,
        'is_compound' => 'boolean',
        'is_inclusive' => 'boolean',
        'enabled_by_default' => 'boolean',
        'rate' => 'decimal:4',
    ];

    /**
     * Apply filter to query
     */
    public function scopeFilter(Builder $query, TaxFilter $filters): void
    {
        $filters->apply($query);
    }

    public function timeFrames(): BelongsToMany
    {
        return $this->belongsToMany(TimeFrame::class)
            ->using(TimeFrameTax::class)
            ->withTimestamps();
    }
}
