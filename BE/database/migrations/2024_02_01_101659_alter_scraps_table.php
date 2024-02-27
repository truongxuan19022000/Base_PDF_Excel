<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterScrapsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('scraps', function (Blueprint $table) {
            $table->dropForeign(['quotation_section_id']);
            $table->dropColumn('quotation_section_id');
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
            $table->dropForeign(['material_id']);
            $table->dropColumn('material_id');
            $table->unsignedDecimal('scrap_weight', 8, 2)->default(null)->nullable()->after('scrap_length');
            $table->integer('quotation_id')->unsigned()->after('cost_of_scrap');
            $table->integer('product_item_id')->unsigned()->after('quotation_id');
            $table->integer('product_template_material_id')->unsigned()->after('product_item_id');
            $table->tinyInteger('status')->after('product_template_material_id')->default(1)->comment('1: unused, 2: used');

            $table->foreign('quotation_id')->references('id')->on('quotations');
            $table->foreign('product_item_id')->references('id')->on('product_items');
            $table->foreign('product_template_material_id')->references('id')->on('product_template_materials');
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('scraps', function (Blueprint $table) {
            $table->dropColumn(['quotation_id', 'product_item_id', 'scrap_weight', 'status', 'product_template_material_id']);
        });
    }
}
