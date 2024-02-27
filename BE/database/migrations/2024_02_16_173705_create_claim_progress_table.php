<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClaimProgressTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('claim_progress', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('quotation_section_id')->unsigned();
            $table->integer('product_id')->unsigned();
            $table->integer('other_fee_id')->unsigned();
            $table->integer('claim_number');
            $table->integer('claim_percent');
            $table->unsignedDecimal('current_amount', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('previous_amount', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('accumulative_amount', 12, 2)->default(null)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('quotation_section_id')->references('id')->on('quotation_sections');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('other_fee_id')->references('id')->on('other_fees');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('claim_progress');
    }
}
