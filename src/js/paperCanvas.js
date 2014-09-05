// set up canvas
var     canvas = document.getElementById( "paperCanvas" ),
   canvasWidth = canvas.offsetWidth,
  canvasHeight = canvas.offsetHeight,
  canvasCenter = new Point( canvasWidth / 2, canvasHeight / 2 );

var scoreBox = document.getElementById( "score" );
var gameOverBox = document.getElementById( "game-over" );

// set orientation
var orientation = "";

if ( canvasWidth >= canvasHeight ) {
  orientation = "landscape";
} else {
  orientation = "portrait";
}

// colors
var color = {
  backGround: "#123",
  mapFill:    "#123",
  mapEdge:    "#f59",
  avatar:     "#0bF",
  enemy:      "#f30",
  bonus:      "#0fb",
};

// set size of map
var mapRadius = 250;

// set size of avatar & enemies
var avatarSize = 8,
     enemySize = 2.5;

// random number wrapper
function randNum ( min, max ) {
  return Math.floor( Math.random() * max + min );
}

// random point wrapper
function randPoint () {
  return new Point( randNum( 0, canvasWidth ), randNum( 0, canvasHeight ) );
}


// draw map background
var mapFill = new Path.Circle({
  center: canvasCenter,
  radius: mapRadius - avatarSize / 2,
  fillColor: color.mapFill
});

// draw edge of map
var mapEdge = new Path.Circle({
  center: canvasCenter,
  radius: mapRadius,
  strokeWidth: 1.5,
  strokeColor: color.mapEdge
});

// set hittest options
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: enemySize / 2
};

// draw enemy clip mask
var clipMask = new Path.Circle({
  center: canvasCenter,
  radius: mapRadius
});

// init enemies group
var enemies = new Group( clipMask );
enemies.clipped = true;

// add enemies to group
for ( var e = 0; e < 100; e++) {
  enemies.addChild(
    new Path.Circle({
      center: randPoint(),
      radius: enemySize / 2,
      fillColor: color.enemy
    })
  );
}

// init bonus
var bonuses = new Group( clipMask.clone() );
bonuses.clipped = true;

// add bonuses to group
for ( var e = 0; e < 25; e++) {
  bonuses.addChild(
    new Path.Circle({
      center: randPoint(),
      radius: enemySize / 2,
      fillColor: color.bonus
    })
  );
}

// init avatar
var avatar = new Path.Circle({
  radius: avatarSize / 2,
  fillColor: color.avatar
});

// make avatar to follow cursor
function onMouseMove( event ) {
  // if cursor leaves map stop follow & change cursor
  if ( mapFill.contains( event.point ) ) {
    avatar.position = event.point;
    canvas.style.cursor = "none";
  } else {
    canvas.style.cursor = "default";
  }
}

// init avatar flash timer
var avatarFlash = 0;

// init enemy speed
var enemySpeed = 0;

// init gameover
var gameOver = true;

// init score
var score = 0;

function onMouseDown(event) {
  gameOver = false;
  return gameOver;
}

function onFrame( event ) {
  enemySpeed = event.count / 750 + 0.75;

  if ( avatar.bounds.width > 200 ) {
    gameOver = true;
    gameOverBox.textContent = "GAME OVER";
    avatar.fillColor = "#fff";
  }

  if ( gameOver === false ) {
    // for all the enemies
    for ( var e = 1; e < enemies.children.length; e++ ) {
      // set current enemies
      var thisEnemy = enemies.children[ e ];

      // move current enemy
      thisEnemy.position += [ enemySpeed, enemySpeed ];

      // if there's a hit change colour and start flash timer
      if ( avatar.hitTest( thisEnemy.position, hitOptions ) ) {
        avatar.bounds.width += 2;
        avatar.bounds.height += 2;
        thisEnemy.remove();
        avatar.fillColor = "#f09";
        avatarFlash = event.count;

        enemies.addChild(
          new Path.Circle({
            center: randPoint(),
            radius: enemySize / 2,
            fillColor: color.enemy
          })
        );
      }

      // if current goes off page
      if ( thisEnemy.bounds.left > view.size.width ) {
        thisEnemy.position.x = - thisEnemy.bounds.width;
        thisEnemy.position.y = randNum( 0, canvasHeight );
      } else if ( thisEnemy.bounds.top > view.size.height ) {
        thisEnemy.position.y = - thisEnemy.bounds.height;
        thisEnemy.position.x = randNum( 0, canvasWidth );
      }
    }

    for ( var b = 1; b < bonuses.children.length; b++ ) {
      // set current bonus
      var thisBonus = bonuses.children[ b ];

      // move current bonus
      thisBonus.position += [ enemySpeed + 0.5, enemySpeed + 0.5 ];

      // if there's a hit change colour and start flash timer
      if ( avatar.hitTest( thisBonus.position, hitOptions ) ) {
        thisBonus.remove();
        avatar.fillColor = color.bonus;
        avatarFlash = event.count;
        score += 10;
        // console.log( "score: " + score );
        scoreBox.textContent = score;

        bonuses.addChild(
          new Path.Circle({
            center: randPoint(),
            radius: enemySize / 2,
            fillColor: color.bonus
          })
        );
      }

      // if current goes off page
      if ( thisBonus.bounds.left > view.size.width ) {
        thisBonus.position.x = - thisBonus.bounds.width;
        thisBonus.position.y = randNum( 0, canvasHeight );
      } else if ( thisBonus.bounds.top > view.size.height ) {
        thisBonus.position.y = - thisBonus.bounds.height;
        thisBonus.position.x = randNum( 0, canvasWidth );
      }
    }

    if ( avatarFlash + 15 < event.count ) {
      avatar.fillColor = color.avatar;
    }
  }
}