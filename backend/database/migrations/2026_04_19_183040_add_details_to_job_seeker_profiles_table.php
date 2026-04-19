<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            // Cek satu-satu, tambahkan hanya jika kolomnya belum ada di database
            if (!Schema::hasColumn('job_seeker_profiles', 'full_name')) {
                $table->string('full_name')->nullable();
            }
            if (!Schema::hasColumn('job_seeker_profiles', 'phone')) {
                $table->string('phone')->nullable();
            }
            if (!Schema::hasColumn('job_seeker_profiles', 'location')) {
                $table->string('location')->nullable();
            }
            if (!Schema::hasColumn('job_seeker_profiles', 'education')) {
                $table->text('education')->nullable();
            }
            if (!Schema::hasColumn('job_seeker_profiles', 'experience')) {
                $table->text('experience')->nullable();
            }
            if (!Schema::hasColumn('job_seeker_profiles', 'cv_file')) {
                $table->string('cv_file')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $columns = ['full_name', 'phone', 'location', 'education', 'experience', 'cv_file'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('job_seeker_profiles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};