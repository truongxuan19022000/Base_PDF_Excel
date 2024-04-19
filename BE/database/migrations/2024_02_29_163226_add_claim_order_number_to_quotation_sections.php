<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddClaimOrderNumberToQuotationSections extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotation_sections', function (Blueprint $table) {
            $table->integer('order_number')->after('quotation_id')->change();
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
        Schema::table('quotation_sections', function (Blueprint $table) {
            $table->dropColumn('order_number', 'claim_order_number');
        });
    }
}
