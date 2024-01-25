<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('quotation_section_id')->unsigned();
            $table->string('product_code');
            $table->string('item');
            $table->string('sty_area');
            $table->string('size');
            $table->string('unit');
            $table->unsignedDecimal('quantity', 8, 2);
            $table->unsignedDecimal('u_rate', 8, 2);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('quotation_section_id')->references('id')->on('quotation_sections');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
}
