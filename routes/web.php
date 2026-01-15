<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LedgerController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\PricingRuleController;
use App\Http\Controllers\PricingRulePageController;
use App\Http\Controllers\StatementController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('ledger', [LedgerController::class, 'index'])->name('ledger.index');
    Route::get('pricing', [PricingController::class, 'index'])->name('pricing.index');
    Route::get('pricing/{pricingModule}', [PricingController::class, 'show'])->name('pricing.show');
    Route::get('pricing-rules', [PricingRulePageController::class, 'index'])->name('pricing-rules.index');
    Route::post('pricing-rules', [PricingRuleController::class, 'store'])->name('pricing-rules.store');
    Route::get('pricing-rules/{pricingRule}/edit', [PricingRulePageController::class, 'edit'])->name('pricing-rules.edit');
    Route::get('statements', [StatementController::class, 'index'])->name('statements.index');
    Route::get('statements/{statement}', [StatementController::class, 'show'])->name('statements.show');
    Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
});

require __DIR__.'/settings.php';
