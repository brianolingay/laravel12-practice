<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ledger_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id');
            $table->foreignId('account_id')->nullable();
            $table->foreignId('program_id')->nullable();
            $table->string('event_type');
            $table->string('external_reference_id');
            $table->jsonb('metadata')->default('{}');
            $table->timestampTz('occurred_at');
            $table->timestamps();

            $table->index(['tenant_id', 'account_id', 'occurred_at']);
            $table->unique(['tenant_id', 'account_id', 'external_reference_id']);
        });

        DB::statement(
            'CREATE UNIQUE INDEX ledger_events_tenant_external_reference_unique '
            .'ON ledger_events (tenant_id, external_reference_id) '
            .'WHERE account_id IS NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS ledger_events_tenant_external_reference_unique');
        Schema::dropIfExists('ledger_events');
    }
};
