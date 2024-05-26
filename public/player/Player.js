class Player extends Locatable {
    name;
    yVelocity;
    dead;
    score;

    constructor()
    {
        super(0, 0, 40, 80);
        this.yVelocity = 0;
        this.dead = false;
        this.score = 0;
    }

    serializedAi()
    {
        return [
            this.getX(),
            this.getY(),
            this.getWidth(),
            this.getHeight(),
            this.getVelocity()
        ];
    }

    getScore()
    {
        return this.score;
    }

    setScore(s)
    {
        this.score = s;
    }

    getName() {
        return this.name;
    }

    setName(n) {
        this.name = n;
    }

    getVelocity() {
        return this.yVelocity;
    }

    setVelocity(v) {
        this.yVelocity = v;
    }

    jump() {
        if(this.getVelocity() === 0 && this.getY() === 0 && !this.isDead())
            this.setVelocity(75);
    }

    isDead()
    {
        return this.dead;
    }

    die()
    {
        this.dead = true;
    }

    respawn()
    {
        this.dead = false;
    }

}