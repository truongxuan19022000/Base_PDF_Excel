<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterProductTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['item', 'sty_area', 'size', 'unit', 'u_rate']);
            $table->integer('order_number')->after('product_code')->default(1);
            $table->tinyInteger('profile')->after('order_number')->default(0);
            $table->string('glass_type')->after('profile');
            $table->integer('storey')->after('glass_type');
            $table->integer('area')->after('storey');
            $table->integer('length')->after('area');
            $table->tinyInteger('length_unit')->after('length')->default(0);
            $table->integer('height')->after('length_unit');
            $table->tinyInteger('height_unit')->after('height')->default(0);
            $table->integer('quantity')->after('height_unit')->change();
            $table->unsignedDecimal('subtotal', 12, 2)->after('quantity')->default(null)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'order_number',
                'profile',
                'glass_type',
                'storey',
                'area',
                'length',
                'length_unit',
                'height',
                'height_unit',
                'subtotal'
            ]);
        });
    }
}
