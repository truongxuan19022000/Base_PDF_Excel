<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EditProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('products')->update([
            'storey' => null,
            'area' => null,
        ]);

        Schema::table('products', function (Blueprint $table) {
            $table->integer('storey')->nullable()->default(null)->after('glass_type')->change();
            $table->integer('area')->nullable()->default(null)->after('storey')->change();
            $table->string('storey_text')->after('storey')->nullable();
            $table->string('area_text')->after('area')->nullable();
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
            $table->dropColumn(['storey', 'area', 'storey_text', 'area_text']);
        });
    }
}
