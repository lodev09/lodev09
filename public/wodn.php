<?php

require_once 'init.php';

?>

<!DOCTYPE html>
<html lang="en">

  <head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Production Rank Calculator</title>

    <!-- Bootstrap core CSS -->
    <link href="<?= ASSETS_URL ?>/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom fonts for this template -->
    <link href="https://fonts.googleapis.com/css?family=Saira+Extra+Condensed:500,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Muli:400,400i,800,800i" rel="stylesheet">
    <link href="<?= ASSETS_URL ?>/vendor/fontawesome-free/css/all.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="<?= ASSETS_URL ?>/css/resume.min.css" rel="stylesheet">

  </head>

  <body id="page-top">

    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="sideNav">

      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">

      </div>
    </nav>

    <div class="container-fluid p-0">
      <section class="resume-section p-3 p-lg-5">
        <form method="GET">
          <div class="row">
            <?php

            $gears = ['theano', 'coma', 'cornu', 'felis'];

            $stones = [
              'theano' => get('theano', $_GET, 0),
              'coma' => get('coma', $_GET, 0),
              'cornu' => get('cornu', $_GET, 0),
              'felis' => get('felis', $_GET, 0)
            ];

            $crafts = [
              'theano' => [
                'rss' => [
                  'palladium' => 33,
                  'pasus' => 27
                ],
                'stones' => 13,
                'points' => 70830,
                'ftg' => 350,
                'gold' => 88000
              ],
              'coma' => [
                'rss' => [
                  'garnierite' => 32,
                  'potencia' => 34
                ],
                'stones' => 13,
                'points' => 54460,
                'ftg' => 310,
                'gold' => 85000
              ],
              'cornu' => [
                'rss' => [
                  'garnierite' => 28,
                  'potencia' => 30
                ],
                'stones' => 10,
                'points' => 40320,
                'ftg' => 270,
                'gold' => 72000
              ],
              'felis' => [
                'rss' => [
                  'gemstone' => 24,
                  'darkness' => 15
                ],
                'stones' => 4,
                'points' => 28390,
                'ftg' => 230,
                'gold' => 59000
              ]
            ];

            $total_points = 0;
            $total_ftg = 0;
            $total_gold = 0;
            $requirements = [];

            foreach ($gears as $gear) {

              $ftg = 0;
              $points = 0;
              $gold = 0;

              $available_stones = $stones[$gear];
              $craft = $crafts[$gear];

              // requirements
              $can_craft = $available_stones / $craft['stones'];
              $ftg = $craft['ftg'] * $can_craft;
              $gold = $craft['gold'] * $can_craft;
              $points = $can_craft * $craft['points'];

              echo '<div class="col-md-6 col-lg-3">';
              echo '<div class="form-group">
                  <label class="" for="input-'.$gear.'"><h3>'.$gear.'</h3></label>
                  <input type="number" id="input-'.$gear.'" name="'.$gear.'" class="form-control" placeholder="Soul Stones" value="'.$available_stones.'">
                </div>';

              echo '<p>';
              echo '<div><small>FTG </small> <strong class="float-right">'.number_format($ftg).'</strong></div>';
              echo '<div><small>GOLD </small> <strong class="float-right">'.number_format($gold).'</strong></div>';
              echo '<div><small>POINTS </small> <strong class="float-right">'.number_format($points).'</strong></div>';
              echo '</p>';
              echo '</div>';

              $rss = $craft['rss'];
              foreach ($rss as $name => $amount) {
                if (!isset($requirements[$name])) {
                  $requirements[$name] = 0;
                }

                $requirements[$name] += $amount * $can_craft;
              }

              $total_points += $points;
              $total_ftg += $ftg;
              $total_gold += $gold;
            }


            ?>
          </div>

          <hr>
          <h4>Requirements</h4>
          <div class="row">
            <?php foreach($requirements as $name => $amount): ?>
              <div class="col">
                <small><?= $name ?></small>
                <h4><?= number_format($amount) ?></h4>
              </div>
            <?php endforeach; ?>
          </div>

          <hr>
          <small>Total honor</small>
          <h2><?= number_format($total_points) ?></h2>

          <small>Total FTG</small>
          <h3><?= number_format($total_ftg) ?></h3>

          <small>Total GOLD</small>
          <h3><?= number_format($total_gold) ?></h3>

          <hr>
          <button type="submit" class="btn btn-success">Update</button>
        </form>
      </section>
    </div>

    <!-- Bootstrap core JavaScript -->
    <script src="<?= ASSETS_URL ?>/vendor/jquery/jquery.min.js"></script>
    <script src="<?= ASSETS_URL ?>/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- Plugin JavaScript -->
    <script src="<?= ASSETS_URL ?>/vendor/jquery-easing/jquery.easing.min.js"></script>

    <!-- Custom scripts for this template -->
    <script src="<?= ASSETS_URL ?>/js/resume.min.js"></script>

  </body>

</html>
