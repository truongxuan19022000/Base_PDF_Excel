<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterProductItemTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('product_items', function (Blueprint $table) {
            $table->dropColumn(['item', 'size', 'unit', 'u_rate']);
            $table->integer('material_id')->unsigned()->after('product_id')->nullable();
            $table->integer('product_template_id')->after('material_id')->unsigned()->nullable();
            $table->integer('order_number')->after('product_template_id')->default(1);
            $table->string('title')->after('quantity');
            $table->integer('length')->after('title');
            $table->tinyInteger('length_unit')->after('length')->default(0);
            $table->integer('height')->after('length_unit');
            $table->tinyInteger('height_unit')->after('height')->default(0);
            $table->tinyInteger('service_type')->after('height_unit')->default(0);
            $table->unsignedDecimal('unit_price', 12, 2)->after('service_type')->default(null)->nullable();

            $table->foreign('material_id')->references('id')->on('materials');
            $table->foreign('product_template_id')->references('id')->on('product_templates');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_items', function (Blueprint $table) {
            $table->dropColumn([
                'material_id',
                'product_template_id',
                'order_number',
                'title',
                'length',
                'length_unit',
                'height',
                'height_unit',
                'service_type',
                'unit_price'
            ]);
        });
    }
}
