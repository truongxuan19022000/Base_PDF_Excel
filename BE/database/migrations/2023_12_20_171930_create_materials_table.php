<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMaterialsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $descriptions = [
            '1: Swing Door (SWD)',
            '2: Sliding Door / Window (SLD)',
            '3: Top Hung / Fixed Panel (FTC)',
            '4: Slide & Fold Door (S&F)',
            '5: Fixed / Hung Window (FTC-70\'s)',
            '6: Sliding Door / Window (SLD-80\'s)',
            '7: Sliding Door (SLD-80\'s)',
            '8: Sliding Window (SLD-80\'s)',
            '9: Flush Door',
            '10: Louvre Insert',
            '11: Substation Door',
            '12: Slide & Fold Door (S&F-DR)',
            '13: Adj. Glass Louvre Window',
            '14: BF-TH & Fixed'
        ];
        Schema::create('materials', function (Blueprint $table) use ($descriptions) {
            $table->increments('id');
            $table->string('item');
            $table->string('code');
            $table->string('category');
            $table->tinyInteger('profile')->nullable()->comment('1: Euro, 1: Local');
            $table->integer('door_window_type')->nullable()->comment(implode(PHP_EOL, $descriptions));
            $table->integer('service_type')->nullable()->comment('1: Aluminium, 2: Glass, 3: Hardware, 4: Services');
            $table->tinyInteger('inner_side')->nullable()->comment('1: Checked, 2: unChecked');
            $table->tinyInteger('outer_side')->nullable()->comment('1: Checked, 2: unChecked');
            $table->unsignedDecimal('weight', 8, 2)->default(null)->nullable();
            $table->unsignedDecimal('raw_length', 8, 2)->default(null)->nullable();
            $table->unsignedDecimal('min_size', 8, 2)->default(null)->nullable();
            $table->unsignedDecimal('price', 12, 2)->default(null)->nullable();
            $table->tinyInteger('price_unit')->nullable()->comment('1: pc, 2: m2');
            $table->tinyInteger('coating_price_status')->nullable()->comment('1: Checked, 2: unChecked');
            $table->unsignedDecimal('coating_price', 8, 2)->default(null)->nullable();
            $table->tinyInteger('coating_price_unit')->nullable()->comment('1: m2');
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
        Schema::dropIfExists('materials');
    }
}
