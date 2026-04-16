<?php

namespace App\Http\Requests\Tax;

use App\Enums\TaxTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaxRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isPercentage = $this->input('type') === TaxTypeEnum::Percentage->value;

        return [
            'name' => ['required', 'string', 'max:255'],
            'rate' => ['required', 'numeric', 'min:0', ...($isPercentage ? ['max:1'] : [])],
            'type' => ['required', Rule::enum(TaxTypeEnum::class)],
            'is_compound' => 'boolean',
            'is_inclusive' => 'boolean',
            'enabled_by_default' => 'boolean',
        ];
    }
}
