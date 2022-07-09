class NeuralNetwork
{

    input_nodes;
    hidden_nodes;
    output_nodes;

    model;

    constructor(a, b, c, d)
    {
        if (a instanceof tf.Sequential)
        {
            this.model = a;
            this.input_nodes = b;
            this.hidden_nodes = c;
            this.output_nodes = d;
        }
        else
        {
            this.input_nodes = a;
            this.hidden_nodes = b;
            this.output_nodes = c;
            this.model = this.createModel();
        }
    }

    getModel()
    {
        return this.model;
    }

    summary()
    {
        return this.model.summary();
    }

    copy()
    {
        return tf.tidy(() =>
        {
            const modelCopy = this.createModel();
            const weights = this.model.getWeights();
            const weightCopies = [];
            for (var i = 0; i < weights.length; i++)
                weightCopies[i] = weights[i].clone();
            modelCopy.setWeights(weightCopies);

            return new NeuralNetwork(
                modelCopy,
                this.input_nodes,
                this.hidden_nodes,
                this.output_nodes
            );
        });
    }

    random(min, max)
    {
        if (max === undefined)
            return Math.round(Math.random() * min);
        else
            return Math.round(min + (Math.random() * (max - 1)));
    }

    mutate()
    {
        tf.tidy(() =>
        {
            const weights = this.model.getWeights();
            const mutatedWeights = [];
            for (var i = 0; i < weights.length; i++)
            {
                var tensor = weights[i];
                var shape = weights[i].shape;
                var values = tensor.dataSync().slice();
                for (var j = 0; j < values.length; j++)
                {
                    var rand = this.random(1,10); // 1 out of 10 chance of a mutation of a weight
                    // console.log("random", rand);
                    if (rand === 5)
                    {
                        var w = values[j];
                        // console.log("current weight", w);
                        var mod = (this.random(10) / 10) * (this.random(1,2) == 2 ? -1 : 1); //TODO: may not work, github said randomGaussian(); which is a method i dont know
                        // console.log("setting current weight", w, "to", mod);
                        values[j] = mod;
                        // console.log("modified weight", values[j]);
                    }
                }
                var newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }

    dispose()
    {
        this.model.dispose();
    }

    predict(inputs)
    {
        return tf.tidy(() =>
        {
            const xs = tf.tensor2d([inputs]);

            const ys = this.model.predict(xs);
            const outputs = ys.dataSync();
            // console.log(outputs);
            return outputs;
        });
    }

    createModel()
    {
        //create sequential model
        const model = tf.sequential();

        //first layer, hiddern layer
        const hidden = tf.layers.dense({
            units: this.hidden_nodes,
            inputShape: [this.input_nodes],
            activation: 'sigmoid'
        });
        model.add(hidden);

        //adding output layer
        const output = tf.layers.dense({
            units: this.output_nodes,
            activation: 'softmax'
        });
        model.add(output);
        return model;
    }
}