var blocksize = 20;
var white = '#FFFFFF';
var black = '#000000';
var red = '#FF0000'

function part(next, prev, x, y) {
	this.next = next;
	this.prev = prev;
	this.x = x;
	this.y = y;
	this.color = white;
}

function drawPos(a, b) {
	document.getElementById("pos").innerHTML = a.x + ", " + a.y;
	document.getElementById("food").innerHTML = b.x + ", " + b.y;
}

function drawScore(score) {
	document.getElementById("score").innerHTML = "Score: " + score;
}


function foodBlock() {
	this.x = Math.floor(Math.random() * (canvas.width - 1)/blocksize)*blocksize;  //Get a random multiple of blocksize within the correct range
	this.y = Math.floor(Math.random() * (canvas.height - 1)/blocksize)*blocksize;
}

function drawBlock(posx, posy, sizex, sizey, food, color, context) {
	if(food == true) {
		context.fillStyle = black;
		context.fillRect(posx, posy, sizex, sizey);
	}
	else {
		context.beginPath();
        context.rect(posx, posy, sizex - 1, sizey - 1);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
	}
}


var dir = 1;
var play = 1;
var speed = 200;
var score = 0;
var canChange = 1; 

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var start;
var food;
var loop;
var listener;
restart();

function restart() {
	score = 0;
	dir = 1;
	context.clearRect(0, 0, canvas.width, canvas.height);
	start = new part(null, null, Math.floor(canvas.width/2), Math.floor(canvas.height/2));
	drawBlock(start.x, start.y, blocksize, blocksize, false, white, context);
	food = new foodBlock(canvas.width, canvas.height);
	drawBlock(food.x, food.y, blocksize, blocksize, true, black, context);
	drawPos(start, food);
}
function changeDirection(e) {
	switch(e.keyCode) {
		case 37:
			if(canChange && (dir != 1 || (score == 0))) {						//Make it so you can't change direction to move backwards onto your self, unless you are only 1 unit long.
				dir = 3;  //Left
			}
			break;
		case 38: 
			if(canChange && (dir != 2 || (score == 0))) {
				dir = 0;  //Up
			}
			break;
		case 39: 
			if(canChange && (dir != 3 || (score == 0))) {
				dir = 1; //Right
			}
			break;
		case 40: 
			if(canChange && (dir != 0 || (score == 0))) {
				dir = 2; //Down
			}
			break;
		case 32:     //Space
			if(play == 1) {
				canChange = 0; //make it so that you can't change the direction when paused
				clearInterval(loop);
				play = 0;
			}
			else {
				canChange = 1;
				loop = setInterval(function() { move(canvas, context); }, speed);
				play = 1;
			}
			break;
		case 16:     //Shift
			clearInterval(loop);
			restart();
//			loop = setInterval(function() { move(canvas, context); }, speed);
		default:
			break;
		
		removeEventListener(listener);				//Introduce a slight delay after each keyboard event, so you that you move in the intended direction at least once
		setTimout(function() {listener = addEventListener("keydown", changeDirection, false);}, speed*2);
	}
	document.getElementById("dir").innerHTML = dir;
	
}

loop = setInterval(function() { move(canvas, context); }, speed);
listener = addEventListener("keydown", changeDirection, false);


function move(canvas, context) {
	var localdir = dir;	// In case a key is pressed in the middle of movement
	var oldx = start.x;
	var oldy = start.y
	var gotFood = 0;
	var lost = 0;
	switch(localdir) {
		case 0:
			start.y -= blocksize;
			break;
		case 1:
			start.x += blocksize;
			break;
		case 2:
			start.y += blocksize;
			break;
		case 3:
			start.x -= blocksize;
			break;
	}	
	if(!play || start.x < 0 || start.y < 0 || start.x >= canvas.width - 1 || start.y >= canvas.height - 1) {
		alert("You lose");
		clearInterval(loop);
		restart();
		play = 0;
	}
	else {
		context.clearRect(0, 0, canvas.width, canvas.height);
		if(food.x == start.x && food.y == start.y) {
			gotFood = 1;
			//delete food;
			food = new foodBlock(canvas.width, canvas.height);
			var newBlock = new part(start.next, start, oldx, oldy);
			temp = start.next;
			start.next = newBlock;
			newBlock.next = temp;
			score ++;
		}
		var temp = start;			
		if(gotFood == 0) {
			temp = temp.next;
			var tempx;
			var tempy;
			if(temp != null) {
				tempx = temp.x;
				tempy = temp.y;
				temp.x = oldx;
				temp.y = oldy;
				oldx = tempx
				oldy = tempy;
				temp = temp.next;
			}
			while(temp != null) {
				tempx = temp.x;
				tempy = temp.y;
				temp.x = oldx
				
				temp.y = oldy;
				oldx = tempx;
				oldy = tempy;
				if(temp.x == start.x && temp.y == start.y) {					
					play = 0;  //Set it so we stop after the canvas is repainted
					temp.color = red;
					start.color = red;
				}
				temp = temp.next;
			}
			temp = start;
		}
		while(temp != null) {
			drawBlock(temp.x, temp.y, blocksize, blocksize, false, temp.color, context);
			temp = temp.next;
		}
		drawBlock(food.x, food.y, blocksize, blocksize, true, black, context);
		once = 0;
		
		drawPos(start, food);
		drawScore(score);
	}
}