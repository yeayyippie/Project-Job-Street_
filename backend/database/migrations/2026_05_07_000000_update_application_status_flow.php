<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY status ENUM('applied','reviewed','pending_review','interview','psychotest','accepted','rejected') NOT NULL DEFAULT 'pending_review'");
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check');
            DB::statement("ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'pending_review'");
        }

        DB::table('applications')->where('status', 'applied')->update(['status' => 'pending_review']);
        DB::table('applications')->where('status', 'reviewed')->update(['status' => 'interview']);

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY status ENUM('pending_review','interview','psychotest','accepted','rejected') NOT NULL DEFAULT 'pending_review'");
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('pending_review','interview','psychotest','accepted','rejected'))");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY status ENUM('applied','reviewed','pending_review','interview','psychotest','accepted','rejected') NOT NULL DEFAULT 'applied'");
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check');
            DB::statement("ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'applied'");
        }

        DB::table('applications')->where('status', 'pending_review')->update(['status' => 'applied']);
        DB::table('applications')->whereIn('status', ['interview', 'psychotest'])->update(['status' => 'reviewed']);

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY status ENUM('applied','reviewed','accepted','rejected') NOT NULL DEFAULT 'applied'");
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('applied','reviewed','accepted','rejected'))");
        }
    }
};
