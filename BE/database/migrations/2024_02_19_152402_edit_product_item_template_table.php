<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EditProductItemTemplateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('product_item_templates', function (Blueprint $table) {
            $table->integer('used_scrap_id')->unsigned()->nullable()->after('product_item_id');
            $table->foreign('used_scrap_id')->references('id')->on('scraps');
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
        Schema::table('product_item_templates', function (Blueprint $table) {
            $table->dropColumn('used_scrap_id');
        });
    }
}
