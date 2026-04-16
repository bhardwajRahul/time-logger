<?php

namespace App\Http\Requests\Tax;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RearrangeTaxRequest extends FormRequest
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
        return [
            'taxes' => ['required', 'array', 'min:2'],
            'taxes.*.id' => ['required', 'string', 'exists:taxes,id'],
            'taxes.*.sort' => ['required', 'integer', 'min:0', 'max:65535'],
        ];
    }
}
