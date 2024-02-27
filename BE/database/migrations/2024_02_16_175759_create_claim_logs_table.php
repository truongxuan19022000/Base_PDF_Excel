<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClaimLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('claim_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('claim_id')->unsigned();
            $table->integer('claim_progress_id')->unsigned();

            $table->foreign('claim_id')->references('id')->on('claims');
            $table->foreign('claim_progress_id')->references('id')->on('claim_progress');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('claim_logs');
    }
}
