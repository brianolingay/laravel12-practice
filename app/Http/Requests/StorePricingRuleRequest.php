<?php

namespace App\Http\Requests;

use App\Models\PricingRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePricingRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', PricingRule::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pricing_module_id' => ['required', 'integer', 'exists:pricing_modules,id'],
            'rule_type' => ['required', 'string', Rule::in(['flat', 'per_event'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'event_type' => [
                'nullable',
                'string',
                Rule::requiredIf($this->input('rule_type') === 'per_event'),
            ],
        ];
    }
}
