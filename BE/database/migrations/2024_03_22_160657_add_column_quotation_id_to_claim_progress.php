<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnQuotationIdToClaimProgress extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('claim_progress', function (Blueprint $table) {
            $table->integer('quotation_id')->unsigned()->nullable()->after('other_fee_id');

            $table->foreign('quotation_id')->references('id')->on('quotations');
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
            $table->dropColumn('quotation_id');
        });
    }
}
