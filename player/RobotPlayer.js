class RobotPlayer extends Player
{
    brain;

    fitness;

    deathCallback;

    constructor(brain)
    {
        super();

        this.score = 0;
        this.fitness = 0;

        if (brain)
            this.brain = brain.copy();
        else
            this.brain = new NeuralNetwork(15, 8, 2);
    }

    dispose()
    {
        this.brain.dispose();
    }

    getBrain()
    {
        return this.brain;
    }

    setBrain(brain)
    {
        // this.brain.dispose();
        if (brain)
            this.brain = brain.copy();
        else
            this.brain = new NeuralNetwork(15, 8, 2);
    }

    mutate()
    {
        this.brain.mutate();
    }

    think(gameData)
    {
        // console.log("im about to think with input", gameData);

        var prediction = this.brain.predict(gameData);

        if (prediction[0] > prediction[1])
        {
            this.jump();
        }


    }

    getDeathCallback()
    {
        return this.deathCallback;
    }

    setDeathCallback(callback)
    {
        this.deathCallback = callback;
    }

    die()
    {
        super.die();
        if (this.deathCallback)
        {
            this.deathCallback(this);
            this.deathCallback = null;
        }

    }



}