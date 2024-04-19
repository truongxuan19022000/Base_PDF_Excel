<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddClaimOrderNumberToOtherFees extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('other_fees', function (Blueprint $table) {
            $table->integer('claim_order_number')->nullable()->after('order_number');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('other_fees', function (Blueprint $table) {
            $table->dropColumn('claim_order_number');
        });
    }
}
