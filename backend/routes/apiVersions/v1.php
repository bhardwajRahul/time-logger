<?php

use App\Http\Controllers\Api\V1\PreferenceController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\TaxController;
use App\Http\Controllers\Api\V1\TimeEntryController;
use App\Http\Controllers\Api\V1\TimeFrameController;

Route::controller(PreferenceController::class)->group(function () {
    Route::get('/preferences', 'index')->name('preferences.index');
    Route::post('/preferences', 'store')->name('preferences.store');
    Route::put('/preferences/{id}', 'update')->name('preferences.update');
});

Route::controller(ProjectController::class)->group(function () {
    Route::get('/projects', 'index')->name('projects.index');
    Route::get('/projects/{id}', 'show')->name('projects.show');
    Route::post('/projects', 'store')->name('projects.store');
    Route::put('/projects/{id}', 'update')->name('projects.update');
    Route::delete('/projects/{id}', 'destroy')->name('projects.destroy');
});

Route::controller(TimeFrameController::class)->group(function () {
    Route::get('/time-frames', 'index')->name('time-frames.index');
    Route::get('/time-frames/{id}', 'show')->name('time-frames.show');
    Route::get('/time-frames/{id}/invoice', 'getInvoice')->name('time-frames.invoice');
    Route::post('/time-frames', 'store')->name('time-frames.store');
    Route::put('/time-frames/{id}', 'update')->name('time-frames.update');
    Route::delete('/time-frames/{id}', 'destroy')->name('time-frames.destroy');
});

Route::controller(TaxController::class)->group(function () {
    Route::get('/taxes', 'index')->name('taxes.index');
    Route::get('/taxes/{id}', 'show')->name('taxes.show');
    Route::post('/taxes', 'store')->name('taxes.store');
    Route::post('/taxes/rearrange', 'rearrange')->name('taxes.rearrange');
    Route::put('/taxes/{id}', 'update')->name('taxes.update');
    Route::delete('/taxes/{id}', 'destroy')->name('taxes.destroy');
});

Route::controller(TimeEntryController::class)->group(function () {
    Route::get('/time-entries', 'index')->name('time-entries.index');
    Route::get('/time-entries/{id}', 'show')->name('time-entries.show');
    Route::post('/time-entries/merge', 'merge')->name('time-entries.merge');
    Route::post('/time-entries', 'store')->name('time-entries.store');
    Route::put('/time-entries/{id}', 'update')->name('time-entries.update');
    Route::delete('/time-entries/{id}', 'destroy')->name('time-entries.destroy');
});
