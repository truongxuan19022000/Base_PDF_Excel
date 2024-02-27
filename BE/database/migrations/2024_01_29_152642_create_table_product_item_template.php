<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableProductItemTemplate extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_item_templates', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('product_template_material_id')->unsigned();
            $table->integer('product_item_id')->unsigned();
            $table->integer('width_quantity');
            $table->integer('height_quantity');
            $table->unsignedDecimal('cost_of_raw_aluminium', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('cost_of_powder_coating', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('cost_of_scrap', 12, 2)->default(null)->nullable();
            $table->tinyInteger('delete_status')->default(0);
            $table->timestamps();

            $table->foreign('product_template_material_id')->references('id')->on('product_template_materials');
            $table->foreign('product_item_id')->references('id')->on('product_items');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_item_templates');
    }
}
