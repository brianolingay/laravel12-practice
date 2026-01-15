<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rated_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id');
            $table->foreignId('account_id')->nullable();
            $table->foreignId('ledger_event_id');
            $table->foreignId('pricing_rule_id');
            $table->foreignId('pricing_module_id');
            $table->string('event_type')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->text('explanation');
            $table->timestampTz('rated_at');
            $table->timestamps();

            $table->unique('ledger_event_id');
            $table->index(['tenant_id', 'account_id', 'rated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rated_transactions');
    }
};
