//
const game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update}); 

let ball;
let paddle;
let bricks;
let newBrick;
let brickInfo;
let scoreText;
let score = 0;
let lives = 3;
let livesText;
let lifeLostText;
let playing = false;
let startButton;

//负责预加载资产
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;  //设置游戏的缩放模式为SHOW_ALL。这意味着无论游戏窗口的大小如何，游戏都将保持原始比例并完整显示在窗口中。
    game.scale.pageAlignHorizontally = true;     //将游戏水平居中对齐到浏览器窗口。
    game.scale.pageAlignVertically = true;      //将游戏垂直居中对齐到浏览器窗口。
    game.stage.backgroundColor = '#eee';        //设置游戏舞台的背景颜色为淡灰色（#eee）
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}
//create在所有内容都加载并准备就绪时执行一次
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);  //初始化 Arcade Physics 引擎
    game.physics.arcade.checkCollision.down = false;
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    paddle.anchor.set(0.5,1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.immovable = true;

    initBricks();

    textStyle = { font: '18px Arial', fill: '#0095DD' };
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, tap to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
}

//update在每一帧上执行。
function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);  //检测球和桨之间的碰撞，并在发生碰撞时调用ballHitPaddle函数。
    game.physics.arcade.collide(ball, bricks, ballHitBrick);   //检测球和砖块之间的碰撞，并在发生碰撞时调用ballHitBrick函数。
    if(playing) {    //游戏是否正在播放
        paddle.x = game.input.x || game.world.width*0.5;      //根据输入更新桨的位置，如果没有输入，则将桨保持在屏幕中心。
    }
}

// 定义一个名为initBricks的函数，用于初始化砖块。
function initBricks() {

    //定义一个包含砖块尺寸、数量、偏移量和填充信息的brickInfo对象。
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 7,
            col: 3
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    }

    bricks = game.add.group(); //创建一个Phaser组bricks来存储所有的砖块。

    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

//球（ball）与砖块（brick）发生碰撞时被调用
function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);  //创建一个补间动画killTween，使砖块缩放到看不见的大小。
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    //
    killTween.onComplete.addOnce(function(){
        brick.kill();     //从游戏中移除砖块
    }, this);
    killTween.start();
    score += 10;  //增加分数，每次球击中砖块时，分数增加10。
    scoreText.setText('Points: '+score);  //更新分数文本，将当前分数显示在屏幕上。
    if(score === brickInfo.count.row*brickInfo.count.col*10) {  //检查分数是否等于所有砖块的总分数
        alert('You won the game, congratulations!');    //如果分数相等，弹出一个对话框，告诉玩家他们赢得了游戏。
        location.reload();    // 重新加载页面，开始新的一局游戏。
    }
}

//球（ball）离开屏幕时被调用
function ballLeaveScreen() {
    lives--;   // 将玩家的生命值减1。

    // 检查玩家是否还有剩余生命。
    if(lives) {  
        livesText.setText('Lives: '+lives);  // 更新生命值文本，显示剩余的生命。
        lifeLostText.visible = true;   //显示“生命已失去”的提示。
        ball.reset(game.world.width*0.5, game.world.height-25);   //重置球位置到初始状态。为屏幕的中央稍上方
        paddle.reset(game.world.width*0.5, game.world.height-5);  //重置桨位置到初始状态。为屏幕的底部中央
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;      //// 将“生命已失去”的提示设置为不可见。
            ball.body.velocity.set(150, -150);
        }, this);
    }
    else {
        alert('You lost, game over!');   //显示一个对话框告诉玩家游戏结束。
        location.reload();     //重新加载页面以开始新游戏。
    }
}

//当球与桨发生碰撞时，调用此函数
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');  //播放球的“wobble”动画。当球撞击到桨时，会有一个轻微的抖动效果
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);  //用于根据球与桨的相对位置来改变球的速度。
}

//
function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}