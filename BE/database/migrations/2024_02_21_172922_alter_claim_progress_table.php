<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterClaimProgressTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('claim_progress', function (Blueprint $table) {
            $table->integer('quotation_section_id')->unsigned()->nullable()->change();
            $table->integer('product_id')->unsigned()->nullable()->change();
            $table->integer('other_fee_id')->unsigned()->nullable()->change();
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
            $table->dropColumn(['product_id', 'other_fee_id']);
        });
    }
}
