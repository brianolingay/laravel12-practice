<?php

use App\Http\Controllers\Api\LedgerEventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('ledger/events', [LedgerEventController::class, 'store'])->name('ledger-events.store');
});
