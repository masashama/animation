/**
 * Created by aleksandr on 02.11.15.
 */
/**
 * Represent a molecule
 * @constructor
 * @param {int} startX - molecule start x position
 * @param {int} startY - molecule start Y position
 * @param {int} height - molecule height
 * @param {int} width - molecule width
 *
 * @property {object} container - container for molecule
 * @property {int} containerHeight - container height
 * @property {int} containerWidth - container width
 * @property {object} region - shape of region(for mouseOver event)
 * @property {string} regionColor - color of container region(for mouseOver event)
 * @property {object} bitmap - object of molecule image
 * @property {object} circles - array of circles around molecule
 * @property {object} tween - object of animation container
 * @property {int} circleRadius - represent circle radius
 * @property {boolean} mouseOver - represent mouseOverEvent state
 * @property {int} MAX_CIRCLE_RADIUS - max radius of circle
 * @property {int} MIN_CIRCLE_RADIUS - min radius of circle
 * @property {int} ANIMATION_SPEED - animation speed
 *
 * */
function Molecule(startX, startY, height, width){
    var self = this;
    this.container = new createjs.Container();
    this.containerHeight = height;
    this.containerWidth = width;
    this.container.x = startX;
    this.container.y = startY;

    this.region = new createjs.Shape();
    this.regionColor = "rgba(255,255,255,0.01)";
    this.bitmap = null;

    this.circles = [];

    this.tween = createjs.Tween.get(this.container, {loop: true});
    this.circleRadius = 0;

    this.mouseOver = false;

    this.MAX_CIRCLE_RADIUS = 30;
    this.MIN_CIRCLE_RADIUS = 0;
    this.ANIMATION_SPEED = 7000;

    function resizeCircle(circle, radius){
        self.container.removeChild(circle.shape);
        circle.shape = new createjs.Shape();
        circle.shape.graphics
            .beginFill(circle.options.color)
            .drawCircle(circle.options.x,circle.options.y,radius);
        self.container.addChild(circle.shape);
    }

    this.region.addEventListener('mouseover',function(){
        self.mouseOver = true;
    });

    this.region.addEventListener('mouseout',function(){
        self.mouseOver = false;
    });


    /**
     * @method circleAnimation
     * Если мышь на малекуле то увеличить радиус
     * кругов до 30. Если нет то уменьшить до 0;
     * Даную функцию нужно использовать внутри функции отрисовки кадра объекта Tiker
     * */
    this.circleAnimation = function(){
        if(this.mouseOver && this.circleRadius < this.MAX_CIRCLE_RADIUS){
            this.circleRadius++;
            console.log(this.circleRadius);
            for(var i = 0; i < this.circles.length; i++){
                resizeCircle(this.circles[i], this.circleRadius);
            }
        }

        if(!this.mouseOver && this.circleRadius > this.MIN_CIRCLE_RADIUS){
            this.circleRadius--;
            console.log(this.circleRadius);
            for(i = 0; i < this.circles.length; i++){
                resizeCircle(this.circles[i], this.circleRadius);
            }
        }
    };


    /**
     * @method draw
     *
     * Добавляет в контейнер все установленные
     * объекты (круги, картинки), возвращает
     * собранный конейнер.
     * Как раз данный метод позволяет получить объект молекулы
     * для добавления на канву
     *
     * @param {boolean} border - если true то отрисует рамку вокруг контейнера
     * @return {object} createjs.Container()
     * */
    this.draw = function(border){
        this.region.graphics.beginFill(this.regionColor);
        if (border == true)
            this.region.graphics.beginStroke("brown");
        this.region.graphics.drawRect(0,0,this.containerHeight,this.containerWidth);

        this.container.addChild(this.region);

        if (this.bitmap !== null)
            this.container.addChild(this.bitmap);

        if(this.circles.length > 0)
            for(var i = 0; i < this.circles.length; i++)
                this.container.addChild(this.circles[i].shape);

        return this.container;
    };


    /**
     * @method addBitmap
     *
     * Добавляет в контейнер картинку
     *
     * @param {string} url Путь к картинке
     * @param {int}  [startX=0] Начальное положение по X картинки относительно контейнера
     * @param {int}  [startY=0] Начальное положение по Y картинки относительно контейнера
     * @return {object} this
     * */
    this.addBitmap = function(url, startX, startY){
        this.bitmap = new createjs.Bitmap(url);
        this.bitmap.x = startX || 0;
        this.bitmap.y = startY || 0;
        return this;
    };


    /**
     * @method setGuide
     *
     * Устанавливает путь анимации для конейнера
     * Правильный формат массива
     * [x,y, x,y, ..., x,y]
     * !!!ВСЕ!!! точки устанавливаются относительно начала координат контейнера
     * Если координаты менять не надо то оставить 0
     * Пример:
     *  есть конейтенр в точке 10,10
     *  Сдвинуть влево на 10 и вверх на 15
     *  Свдинуть вправо на 5(относительно точки 10,10) не менять вверху
     *  Вернуть на исходную позицию
     *  [-10,-15, -5,-15, 0,0]
     *
     * @param {object} path - массив  с точками пути
     * @return {object} this
     * */
    this.setGuide = function(path){
        var pathCoordinates = [];
        for(var i = 0; i < path.length; i+=2){
            pathCoordinates[i] = this.container.x + path[i];
            pathCoordinates[i+1] = this.container.y + path[i+1];
        }
        pathCoordinates.unshift(this.container.x, this.container.y);
        pathCoordinates.push(this.container.x, this.container.y);
        this.tween.to({guide: { path: pathCoordinates}}, this.ANIMATION_SPEED);
        return this;
    };


    /**
     * @method addCirlces
     *
     * Добавляет круги в контейнер
     *
     * @param {object} circles - {color: csscolor, x: int, y: int, r: int}
     * @return {object} this
     * */
    this.addCircles = function(circles){
        for(var i = 0; i < circles.length; i++){
            var shape = new createjs.Shape();
            shape.graphics
                .beginFill(circles[i].color)
                .drawCircle(circles[i].x, circles[i].y, circles[i].r);
            this.circles.push({
                shape: shape,
                options: circles[i]
            });
        }
        return this;
    }

}