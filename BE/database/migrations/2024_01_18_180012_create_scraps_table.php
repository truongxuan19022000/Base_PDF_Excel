<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScrapsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('scraps', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('quotation_section_id')->unsigned();
            $table->integer('product_id')->unsigned();
            $table->unsignedDecimal('scrap_length', 10, 2)->default(null)->nullable();
            $table->unsignedDecimal('cost_of_scrap', 10, 2)->default(null)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('quotation_section_id')->references('id')->on('quotation_sections');
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('scraps', function (Blueprint $table) {
            Schema::dropIfExists('scraps');
        });
    }
}
