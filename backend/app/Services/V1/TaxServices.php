<?php

declare(strict_types=1);

namespace App\Services\V1;

use App\Enums\CacheTagEnum;
use App\Helpers\C;
use App\Http\Filters\Api\V1\Filters\TaxFilter;
use App\Models\Tax;
use App\Models\User;
use App\Traits\Api\CacheRequest;

class TaxServices
{
    use CacheRequest;

    private string $TYPE = CacheTagEnum::TAX->value;

    private int $TTL = C::TWELVE_HOURS;

    /**
     * Get all Taxes with pagination and filtering
     *
     * @param  TaxFilter  $filters  Filters to apply
     * @param  int|null  $ttl  Optional TTL in seconds (null = forever)
     */
    public function getTaxes(TaxFilter $filters, ?int $ttl = null): mixed
    {
        $cacheKey = $this->getItemsCacheKey($this->TYPE, $filters);
        $tags = $this->getCacheTags($this->TYPE);

        return $this->cacheRemember($cacheKey, $tags, function () use ($filters) {
            return Tax::filter($filters)->jsonPaginate();
        }, $ttl ?? $this->TTL);
    }

    /**
     * Create a new Tax
     */
    public function createTax(array $data): Tax
    {
        // TODO: Replace with authenticated user ID when auth is implemented
        $data['user_id'] = User::first()->id;

        return Tax::create($data);
    }

    /**
     * Get Tax with filtering
     *
     * @param  string  $id  Tax ID
     * @param  TaxFilter  $filters  Filters to apply
     * @param  int|null  $ttl  Optional TTL in seconds (null = forever)
     */
    public function getTax(string $id, TaxFilter $filters, ?int $ttl = null): Tax
    {
        $cacheKey = $this->getItemCacheKey($this->TYPE, $id, $filters);
        $tags = $this->getCacheTags($this->TYPE, $id);

        return $this->cacheRemember($cacheKey, $tags, function () use ($id, $filters) {
            return Tax::filter($filters)->findOrFail($id);
        }, $ttl ?? $this->TTL);
    }

    /**
     * Get Tax by ID without filtering
     *
     * @param  string  $id  Tax ID
     * @param  int|null  $ttl  Optional TTL in seconds (null = forever)
     */
    public function getTaxById(string $id, ?int $ttl = null): Tax
    {
        $cacheKey = $this->getItemCacheKey($this->TYPE, $id);
        $tags = $this->getCacheTags($this->TYPE, $id);

        return $this->cacheRemember($cacheKey, $tags, function () use ($id) {
            return Tax::findOrFail($id);
        }, $ttl ?? $this->TTL);
    }

    /**
     * Update Tax
     */
    public function updateTax(Tax $tax, array $data): Tax
    {
        $tax->update($data);

        return $tax;
    }

    /**
     * Delete Tax
     */
    public function deleteTax(Tax $tax): void
    {
        $tax->delete();

        \Cache::tags([$this->TYPE])->flush();
    }

    /**
     * Rearrange the sort order of taxes
     */
    public function rearrangeTaxes(array $data): void
    {
        foreach ($data['taxes'] as $item) {
            Tax::where('id', $item['id'])->update(['sort' => $item['sort']]);
        }

        \Cache::tags([$this->TYPE])->flush();
    }
}
