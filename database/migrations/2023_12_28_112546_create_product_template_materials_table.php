<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductTemplateMaterialsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_template_materials', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('product_template_id')->unsigned();
            $table->integer('material_id')->unsigned();
            $table->integer('quantity')->default(0);
            $table->foreign('product_template_id')->references('id')->on('product_templates');
            $table->foreign('material_id')->references('id')->on('materials');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_template_materials');
    }
}
