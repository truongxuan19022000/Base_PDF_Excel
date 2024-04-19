<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterCopiedClaimIdToClaimsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn('previous_claim_no');
            $table->integer('copied_claim_id')->unsigned()->nullable()->after('quotation_id');

            $table->foreign('copied_claim_id')->references('id')->on('claims');
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
            $table->dropColumn('copied_claim_id');
        });
    }
}
