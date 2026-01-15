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
        Schema::table('accounts', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('programs', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('account_id')->references('id')->on('accounts')->cascadeOnDelete();
        });

        Schema::table('ledger_events', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('account_id')->references('id')->on('accounts')->nullOnDelete();
            $table->foreign('program_id')->references('id')->on('programs')->nullOnDelete();
        });

        Schema::table('pricing_rules', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('pricing_module_id')->references('id')->on('pricing_modules')->cascadeOnDelete();
        });

        Schema::table('rated_transactions', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('account_id')->references('id')->on('accounts')->nullOnDelete();
            $table->foreign('ledger_event_id')->references('id')->on('ledger_events')->cascadeOnDelete();
            $table->foreign('pricing_rule_id')->references('id')->on('pricing_rules')->nullOnDelete();
            $table->foreign('pricing_module_id')->references('id')->on('pricing_modules')->nullOnDelete();
        });

        Schema::table('billing_statements', function (Blueprint $table): void {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('account_id')->references('id')->on('accounts')->nullOnDelete();
        });

        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->foreign('billing_statement_id')
                ->references('id')
                ->on('billing_statements')
                ->cascadeOnDelete();
            $table->foreign('pricing_rule_id')->references('id')->on('pricing_rules')->nullOnDelete();
            $table->foreign('pricing_module_id')->references('id')->on('pricing_modules')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->dropForeign(['billing_statement_id']);
            $table->dropForeign(['pricing_rule_id']);
            $table->dropForeign(['pricing_module_id']);
        });

        Schema::table('billing_statements', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['account_id']);
        });

        Schema::table('rated_transactions', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['account_id']);
            $table->dropForeign(['ledger_event_id']);
            $table->dropForeign(['pricing_rule_id']);
            $table->dropForeign(['pricing_module_id']);
        });

        Schema::table('pricing_rules', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['pricing_module_id']);
        });

        Schema::table('ledger_events', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['account_id']);
            $table->dropForeign(['program_id']);
        });

        Schema::table('programs', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['account_id']);
        });

        Schema::table('accounts', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
        });
    }
};
