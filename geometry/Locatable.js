class Locatable {
    x;
    y;
    width;
    height;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    serializedAi()
    {
        return [
            this.getX(),
            this.getY(),
            this.getWidth(),
            this.getHeight()
        ];
    }

    isCollidingWith(otherLocatable)
    {
        var ourBoundsX = this.x + this.width;
        var ourBoundsY = this.y + this.height;

        var theirBoundsX = otherLocatable.getX() + otherLocatable.getWidth();
        var theirBoundsY = otherLocatable.getY() + otherLocatable.getHeight();


        var check1 = ourBoundsX > otherLocatable.getX();
        var check2 = theirBoundsY > this.y;
        var check3 = this.x < theirBoundsX;

        return check1 && check2 && check3;
        //i know this can be reduced
    }

    isInCanvas(cWidth, cHeight)
    {
        return this.x < cWidth && this.x >= 0 && this.y < cHeight && this.y >= 0;
    }

    getX()
    {
        return this.x;
    }

    setX(x)
    {
        this.x = x;
    }

    getY()
    {
        return this.y;
    }

    setY(y)
    {
        this.y = y;
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
    }
}