<?php

namespace App\Http\Requests;

use App\Models\LedgerEvent;
use App\Rules\AllowedMetadataKeys;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLedgerEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', LedgerEvent::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->input('tenant_id');

        return [
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
            'account_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where('tenant_id', $tenantId),
            ],
            'program_id' => [
                'nullable',
                'integer',
                Rule::exists('programs', 'id')->where('tenant_id', $tenantId),
            ],
            'event_type' => [
                'required',
                'string',
                Rule::in([
                    'OrderPlaced',
                    'KitAssigned',
                    'ShipmentCreated',
                    'LabelPurchased',
                    'SpecimenReceived',
                    'ResultFinalized',
                    'ResultDelivered',
                    'PortalUserAdded',
                    'ModuleEnabled',
                    'TelehealthReferralCreated',
                ]),
            ],
            'external_reference_id' => ['required', 'string', 'max:255'],
            'occurred_at' => ['required', 'date'],
            'metadata' => ['nullable', 'array', new AllowedMetadataKeys],
        ];
    }
}
