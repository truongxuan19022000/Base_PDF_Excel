<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnOffsetPreviousToClaims extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->renameColumn('total_from_claim', 'subtotal_from_claim');
            $table->unsignedDecimal('accumulative_from_claim', 12, 2)->default(null)->nullable()->after('copied_claim_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->renameColumn('subtotal_from_claim', 'total_from_claim');
            $table->dropColumn('accumulative_from_claim');
        });
    }
}
