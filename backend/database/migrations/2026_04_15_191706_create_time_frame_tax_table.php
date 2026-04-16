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
        Schema::create('tax_time_frame', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('time_frame_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('tax_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['time_frame_id', 'tax_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_time_frame');
    }
};
