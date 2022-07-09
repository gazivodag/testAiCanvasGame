class Renderer {

    canvasId;
    cWidth;
    cHeight;

    cElement;
    cContext;

    sceneDrawnTimes = 0;

    constructor(canvasId, cWidth, cHeight)
    {
        this.canvasId = canvasId;
        this.cWidth = cWidth;
        this.cHeight = cHeight;
        this.cElement = document.getElementById(canvasId);
        this.cContext = this.cElement.getContext("2d");
        console.log("renderer initialized");
    }


    drawScene()
    {
        var ctx = this.cContext;
        var width = this.cWidth;
        var height = this.cHeight;

        //draw sky
        ctx.fillStyle = '#07f1f5';
        ctx.fillRect(0, 0, width, height);

        //draw ground
        ctx.fillStyle = 'green';
        var heightTenth = height / 10;
        ctx.fillRect(0, heightTenth * 9, width, heightTenth);

        //draw counter
        this.drawSceneDrawnTimesCounter();

        this.sceneDrawnTimes++;
    }

    drawSceneDrawnTimesCounter()
    {
        var ctx = this.cContext;
        var width = this.cWidth;
        
        ctx.fillStyle = 'black';
        ctx.fillText(this.sceneDrawnTimes, width - 30, 15);
    }



}