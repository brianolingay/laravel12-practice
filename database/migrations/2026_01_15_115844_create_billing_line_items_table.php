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
        Schema::create('billing_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_statement_id');
            $table->foreignId('pricing_rule_id')->nullable();
            $table->foreignId('pricing_module_id')->nullable();
            $table->string('event_type')->nullable();
            $table->string('description');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->timestamps();

            $table->index(['billing_statement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_line_items');
    }
};
