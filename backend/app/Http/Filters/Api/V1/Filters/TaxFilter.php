<?php

namespace App\Http\Filters\Api\V1\Filters;

use App\Http\Filters\Api\V1\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class TaxFilter extends QueryFilter
{
    protected array $sortable = [
        'id',
        'name',
        'rate',
        'type',
        'isCompound' => 'is_compound',
        'isInclusive' => 'is_inclusive',
        'enabledByDefault' => 'enabled_by_default',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ];

    /*
     * Filter by ID
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function id($value): Builder
    {
        return $this->filterId($value, 'id');
    }

    /*
     * Filter by name
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function name($value): Builder
    {
        return $this->filterText($value, 'name');
    }

    /*
     * Filter by rate
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function rate($value): Builder
    {
        return $this->filterNumber($value, 'rate');
    }

    /*
     * Filter by type
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function type($value): Builder
    {
        return $this->filterEnum($value, 'type');
    }

    /*
     * Filter by is_compound
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function isCompound($value): Builder
    {
        return $this->filterBoolean($value, 'is_compound');
    }

    /*
     * Filter by is_inclusive
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function isInclusive($value): Builder
    {
        return $this->filterBoolean($value, 'is_inclusive');
    }

    /*
     * Filter by enabled_by_default
     * @param string $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function enabledByDefault($value): Builder
    {
        return $this->filterBoolean($value, 'enabled_by_default');
    }
}
