<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableClaimProgress extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('claim_progress', function (Blueprint $table) {
            $table->decimal('current_amount', 12, 2)->default(null)->nullable()->change();
            $table->decimal('previous_amount', 12, 2)->default(null)->nullable()->change();
            $table->decimal('accumulative_amount', 12, 2)->default(null)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('claim_progress', function (Blueprint $table) {
            $table->dropColumn(['current_amount', 'previous_amount', 'accumulative_amount']);
        });
    }
}
