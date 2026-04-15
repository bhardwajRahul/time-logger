<?php

namespace App\Http\Requests\TimeEntry;

use Illuminate\Foundation\Http\FormRequest;

class MergeTimeEntryRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:2'],
            'ids.*' => ['required', 'string', 'exists:time_entries,id'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'time_frame_id.required' => 'The time_frame_id field was not provided. Please contact support if this was not intentional.',
        ];
    }
}
