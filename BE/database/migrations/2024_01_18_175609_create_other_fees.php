<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOtherFees extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('other_fees', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('order_number')->default(1);
            $table->integer('quotation_id')->unsigned();
            $table->text('description')->nullable();
            $table->unsignedDecimal('amount', 12, 2)->default(null)->nullable();
            $table->tinyInteger('status')->nullable();
            $table->softDeletes();
            $table->timestamps();

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
        Schema::table('other_fees', function (Blueprint $table) {
            Schema::dropIfExists('other_fees');
        });
    }
}
