# Diagnosticly Financial Console

## Getting Started

### Migrations & Seeders

```bash
php artisan migrate
php artisan db:seed
```

Seeded demo users (password: `secret`):

- `admin@diagnostically.test`
- `tenant@lab.test`
- `account@client.test`

### Generate Statements

Use the statement generator service from Tinker:

```bash
php artisan tinker
```

```php
use App\Services\StatementGenerator;
use Carbon\CarbonImmutable;

app(StatementGenerator::class)->generate(
    tenantId: 1,
    accountId: 1,
    periodStart: CarbonImmutable::parse('2026-01-01'),
    periodEnd: CarbonImmutable::parse('2026-01-31')
);
```

### Test Idempotent Ingestion

POST the same `external_reference_id` twice to `/api/ledger/events`. The first call returns `201`, and repeats return `200` with the existing event.

```bash
curl -X POST http://localhost/api/ledger/events \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -b "laravel_session=..." \
  -d '{
    "tenant_id": 1,
    "account_id": 1,
    "event_type": "ShipmentCreated",
    "external_reference_id": "SHIP_123",
    "occurred_at": "2026-01-01T10:00:00Z",
    "metadata": {"source": "lab"}
  }'
```

## Notes

- Ledger events are immutable and append-only.
- Idempotency is enforced per tenant + account; when account is null, per tenant + external reference.
- The WAREHOUSE_MANAGER sample rule is per-event for `ShipmentCreated`.
