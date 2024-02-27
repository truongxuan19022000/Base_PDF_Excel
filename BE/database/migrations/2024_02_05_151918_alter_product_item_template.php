<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterProductItemTemplate extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('product_item_templates', function (Blueprint $table) {
            $table->integer('quantity')->after('cost_of_scrap')->nullable();
            $table->unsignedDecimal('cost_of_item', 12, 2)->default(null)->nullable()->after('quantity');
            $table->integer('width_quantity')->nullable()->change();
            $table->integer('height_quantity')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_item_templates', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'cost_of_item']);
        });
    }
}
