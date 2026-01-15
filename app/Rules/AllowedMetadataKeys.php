<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AllowedMetadataKeys implements ValidationRule
{
    private const ALLOWED_KEYS = [
        'source',
        'counts',
        'types',
        'identifiers',
        'timestamps',
        'flags',
        'notes',
    ];

    /** @return array<int, string> */
    public static function keys(): array
    {
        return self::ALLOWED_KEYS;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        $invalidKeys = array_diff(array_keys($value), self::ALLOWED_KEYS);

        if ($invalidKeys !== []) {
            $fail('Metadata contains unsupported keys: '.implode(', ', $invalidKeys).'.');
        }
    }
}
