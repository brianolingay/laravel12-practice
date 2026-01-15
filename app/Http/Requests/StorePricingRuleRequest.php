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
        $tenantId = $this->user()?->tenant_id;

        return [
            'pricing_module_id' => [
                'required',
                'integer',
                Rule::exists('pricing_modules', 'id')->where('tenant_id', $tenantId),
            ],
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
