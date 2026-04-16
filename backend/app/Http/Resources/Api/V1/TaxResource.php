<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Tax
 */
class TaxResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'tax',
            'attributes' => [
                'name' => $this->name,
                'rate' => $this->rate,
                'type' => $this->type,
                'isCompound' => $this->is_compound,
                'isInclusive' => $this->is_inclusive,
                'isEnabledByDefault' => $this->enabled_by_default,
                'createdAt' => $this->created_at,
                'updatedAt' => $this->updated_at,
            ],
            'links' => [
                'self' => route('taxes.show', ['id' => $this->id]),
            ],
        ];
    }
}
