class Game extends Renderer
{

    renderer;
    players;
    obstacles;
    gameTickClock;

    currentBestBot;

    obstaclesCrossed;

    pressureplateInstance;

    drawGame = true;

    died = []; //throwing each robot obj in here to track who will die last
    generation = 0;

    animationPlayerTable = {
        "idle": document.getElementById("personimg"),
        "jump": document.getElementById("personjumpimg")
    };

    hz = 100;

    constructor(canvasId, cWidth, cHeight)
    {
        super(canvasId, cWidth, cHeight);
        this.init();
    }

    init()
    {
        if (this.gameTickClock !== undefined)
            this.stopGameClock();
        this.players = this.players ? this.players : [];
        this.obstacles = [];
        this.obstaclesCrossed = 0;
        console.log("game initialized");
        this.createPressurePlate();
        this.createObstacles();
        this.startGameClock(this.hz);
        // this.gameTick();
    }

    restart()
    {
        this.generation++;
        this.died = [];
        this.init();
        this.players.forEach(p =>
        {
            p.setX(Math.round(this.cWidth / 4));
            p.setY(0);
            p.setVelocity(0);
            p.setScore(0);
            p.respawn();
        });
        console.log("generation", this.generation);
    }

    setHz(newHz)
    {
        console.log("setting new to", newHz);
        this.hz = newHz;
        this.stopGameClock()
        this.startGameClock(newHz);
    }

    setDrawGame(bool)
    {
        this.drawGame = bool;
    }

    getLocalPlayer()
    {
        var players = this.players;
        if (!players)
            return null;
        var filtered = this.players.filter(p => p instanceof HumanPlayer);
        return filtered.length > 0 ? filtered[0] : null;
    }

    createPressurePlate()
    {
        this.pressureplateInstance = new PressurePlate(Math.round(Math.round(this.cWidth) + Math.floor(this.cWidth / 2) + Math.floor(Math.random() * this.cWidth)));
    }

    createObstacles()
    {
        //starting obstacles
        for (var i = 0; i < 3; i++)
        {
            this.obstacles.push(new Obstacle(this.getObstacleGap(i)));
        }

    }

    addPlayer(player)
    {
        player.setName("" + this.players.length);
        player.setX(Math.round(this.cWidth / 4));
        // player.setY(150);
        // player.setVelocity(50);
        this.players.push(player);
    }

    addPlayers(players)
    {
        players.forEach(p => this.addPlayer(p));
    }

    startGameClock(hz)
    {
        var ms = Math.round(1000 / hz);
        console.log(`starting game clock with ${ms} ms`);
        this.gameTickClock = setInterval(() => this.gameTick(), ms);
    }

    stopGameClock()
    {
        clearInterval(this.gameTickClock);
        this.gameTickClock = undefined;
    }

    gameTick()
    {
        //ai handling
        this.handleAiStuff();

        //rendering
        if (this.drawGame)
        {
            super.drawScene();
            this.drawPlayers();
            this.drawObstacles();
            this.drawObstaclesCrossedCounter();
            this.drawGenerationsCounter();
            this.drawAliveAmountCounter()
            this.drawPressurePlate();
        }

        //handling
        this.handlePhysics();
        this.handleObstacles();
        this.handleCollision();
        this.handlePressurePlate();
    }

    buildAiInput(robot)
    {
        var inputs = [];
        inputs[0] = robot.getX()
        inputs[1] = robot.getY()
        inputs[2] = robot.getVelocity()

        var plate = this.pressureplateInstance;
        inputs[3] = plate.getX();
        inputs[4] = plate.getWidth();
        inputs[5] = plate.getHeight();

        for (var i = 0; i < this.obstacles.length; i++)
        {
            var o = this.obstacles[i];
            inputs.push(o.getX(), o.getWidth(), o.getHeight());
        }
        return inputs;
    }

    getCurrentBestRobotModel()
    {
        return this.currentBestBot;
    }

    handleAiStuff()
    {

        var robots = this.players.filter(p => p instanceof RobotPlayer);

        if (this.died.length === robots.length)
        {
            this.stopGameClock();

            var lastRobotAlive = this.died[this.died.length - 1];

            console.log("analyze all the ais in here");
            var bestrobots = robots.map((p, i) => ({ "index": i, "name": p.getName(), "score": p.getScore() }));
            console.log(bestrobots);

            var bestRobot = bestrobots[0];
            for (var i = 0 ; i < bestrobots.length ; i++)
                if(bestrobots[i].score > bestRobot.score)
                    bestRobot = bestrobots[i];
            bestRobot = robots[bestRobot.index];
            this.currentBestBot = bestRobot;

            console.log("best robot", this.currentBestBot);

            // console.log("last robot score out of all", lastRobotAlive);

            

            for (var i = 0; i < robots.length; i++)
            {
                var r = robots[i];

                if (r.getName() === bestRobot.getName())
                    continue;

                // console.log(r.getName() + " is now a clone of " + bestRobot.getName());

                // console.log(`disposing ${r.getName()}'s brain`);
                r.dispose();
                // console.log(`recyciling ${r.getName()} by putting a clone of ${lastRobotAlive.getName()}'s brain into it`);
                r.setBrain(bestRobot.getBrain());
                // console.log(`mutating ${r.getName()}'s brain a tad bit`);
                r.mutate();
            }

            console.log("everyone has now cloned " + bestRobot.getName() + "\'s brain and has been slightly mutated.");


            this.restart();

            return;
        }

        for (var i = 0; i < this.players.length; i++)
        {
            var player = this.players[i];
            if (player instanceof HumanPlayer || player.isDead()) // alive robots only
                continue;

            if (!player.getDeathCallback())
                player.setDeathCallback((playerCallback) =>
                {
                    this.died.push(playerCallback);
                    // console.log(`pushed ${playerCallback.getName()} to died array`);
                });

            player.think(this.buildAiInput(player));
            // console.log("ai shit", player);
        }
    }

    drawPressurePlate()
    {
        var ctx = this.cContext;
        ctx.fillStyle = '#fc8403';

        var plate = this.pressureplateInstance;

        var ground = ((this.cHeight / 10) * 9);

        ctx.fillRect(plate.getX(), ground, 40, -10);
    }

    handlePressurePlate()
    {
        var plate = this.pressureplateInstance;

        if (plate.getX() + plate.getWidth() < 0)
            plate.setX(Math.round(Math.round(this.cWidth) + Math.floor(this.cWidth / 2) + Math.floor(Math.random() * this.cWidth)));

        plate.setX(plate.getX() - 3);
    }

    handleCollision()
    {
        for (var i = 0; i < this.players.length; i++)
        {
            var player = this.players[i];
            if (player.isDead())
                continue;

            for (var j = 0; j < this.obstacles.length; j++)
            {
                var obstacle = this.obstacles[j];

                if (player.isCollidingWith(obstacle))
                {
                    // console.log(`player ${player.getName()} collided! dying with ${player.getScore()} score`);
                    player.die();
                }

            }

            var plate = this.pressureplateInstance;
            if (player.isCollidingWith(plate) && player.getVelocity() < 0)
                player.setVelocity(Math.abs(Math.round(player.getVelocity() + player.getVelocity() * 1)));

        }
    }

    getObstacleGap(obstacleIndex)
    {
        return obstacleIndex === 0 ?
            (Math.round(Math.round(this.cWidth) + Math.floor(this.cWidth / 2) + Math.floor(Math.random() * this.cWidth)))
            :
            (Math.round(this.obstacles[obstacleIndex - 1].getX() + 400 + Math.round(Math.random() * this.cWidth)));
    }

    handleObstacles()
    {

        for (var i = 0; i < this.obstacles.length; i++)
        {
            var o = this.obstacles[i];
            if (o.getX() + o.getWidth() < 0)
            {
                o.setX(this.getObstacleGap(i));
                this.incrementObstaclesCrossed();
                this.players.filter(p => !p.isDead()).forEach(p => p.setScore(p.getScore() + 1));
            }

            o.setX(o.getX() - 3);
        }

        // this.obstacles.forEach(o =>
        // {
        //     if (o.getX() + o.getWidth() < 0)
        //     {
        //         o.setX(Math.round(Math.round(this.cWidth) + Math.floor(this.cWidth / 2) + Math.floor(Math.random() * this.cWidth)));
        //         this.incrementObstaclesCrossed();
        //         this.players.filter(p => !p.isDead()).forEach(p => p.setScore(p.getScore() + 1));
        //     }

        //     o.setX(o.getX() - 3);
        // });
    }

    handlePhysics()
    {
        //handle player physics
        this.players.forEach(p =>
        {
            if (p.isDead())
                return;

            if ((p.getY() > 0 && p.getVelocity() < 1) || (p.getVelocity() > 0))
            { //going up or down
                p.setVelocity(p.getVelocity() - 1);
                p.setY(Math.round(p.getY() + (p.getVelocity() * 0.11)));
            }
            else if (p.getY() < 1)
            { //resetting if its on or under the ground
                p.setVelocity(0);
                p.setY(0);
            }
        });
    }

    drawPlayers()
    {
        this.players.filter(p => p.getX() + p.getWidth() > 0).forEach(p => this.drawPlayer(p));
    }

    drawPlayer(player)
    {
        var ctx = this.cContext;
        var playerRelativeToGround = ((this.cHeight / 10) * 9) + (player.getY() * -1);

        var imageToUse = this.animationPlayerTable[player.getY() === 0 ? "idle" : "jump"];

        if (player.isDead())
            player.setX(player.getX() - 3);

        ctx.drawImage(imageToUse, player.getX(), playerRelativeToGround, player.width, player.height * -1);

        ctx.fillStyle = 'black';
        ctx.fillText(player.getName(), Math.round(player.getX() + (player.getWidth() / 2)) - 10, Math.round(playerRelativeToGround - 60));

        // x/y corner
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(player.getX(), playerRelativeToGround, 6, -6); //bottom left
        // ctx.fillRect(player.getX() + player.getWidth(), playerRelativeToGround + (player.getHeight() * -1), -6, 6); //top right
    }

    drawObstacles()
    {
        this.obstacles.forEach(o => this.drawObstacle(o));
    }

    drawObstacle(obstacle)
    {
        var ctx = this.cContext;
        var ground = ((this.cHeight / 10) * 9);

        ctx.fillStyle = '#402200';
        ctx.fillRect(obstacle.getX(), ground, obstacle.width, obstacle.height * -1);
    }

    debug()
    {
        console.log("debug");
        this.players.forEach(p => console.log("player", { "x": p.getX(), "xp": p.getX() + p.getWidth(), "y": p.getY(), "yp": p.getY() + p.getHeight() }));
        this.obstacles.forEach(p => console.log("obstacle", { "x": p.getX(), "xp": p.getX() + p.getWidth(), "y": p.getY(), "yp": p.getY() + p.getHeight() }));
    }

    incrementObstaclesCrossed()
    {
        this.obstaclesCrossed++;
        // if (this.obstaclesCrossed % 10 === 0)
        // {
        //     console.log("adding another obstacle!");
        //     this.obstacles.push(new Obstacle(Math.round(Math.round(this.cWidth) + Math.floor(this.cWidth / 2) + Math.floor(Math.random() * this.cWidth))));
        // }

    }

    drawObstaclesCrossedCounter()
    {
        var ctx = this.cContext;
        var width = this.cWidth;

        ctx.fillStyle = 'black';
        ctx.fillText("crossed " + this.obstaclesCrossed, width - 50, 45);
    }

    drawGenerationsCounter()
    {
        var ctx = this.cContext;
        var width = this.cWidth;

        ctx.fillStyle = 'black';
        ctx.fillText("gen " + this.generation, width - 50, 60);
    }

    drawAliveAmountCounter()
    {
        var ctx = this.cContext;
        var width = this.cWidth;

        ctx.fillStyle = 'black';
        ctx.fillText("alive " + this.players.filter(p => !p.isDead()).length, width - 50, 75);
    }

}