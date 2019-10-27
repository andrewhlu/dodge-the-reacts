var socket = io();
var enemyTTL = 0;

var userPosition;

AFRAME.registerComponent('generate-enemies', {
    init: function() {
        var enemyElement = this.el;

        socket.on('generate-new-enemy', (msg) => {
            var direction = {
                x: 0,
                y: 0,
                z: 0
            };
    
            var position = {
                x: 0,
                y: 0.5,
                z: 0
            };
    
            var rotation = {
                x: 0,
                y: 0,
                z: 0
            };

            if (msg.location == "top") {
                direction.z = 1;
                position.z = -3.71;
                position.x = -2 + msg.pos;
                rotation.y = 90;
            }
            else if (msg.location == "right") {
                direction.x = -1;
                position.x = 3.71;
                position.z = -2 + msg.pos;
            }
            else if (msg.location == "bottom") {
                direction.z = -1;
                position.z = 3.71;
                position.x = 2 - msg.pos;
                rotation.y = 270;
            }
            else if (msg.location == "left") {
                direction.x = 1;
                position.x = -3.71;
                position.z = 2 - msg.pos;
                rotation.y = 180;
            }

            var base_delay = 1000;
            var after_delay = 1000;

            var actions = [
                {
                    xz: 0.71,
                    y: 0,
                    dur: 500
                },
                {
                    xz: 0.5,
                    y: -0.5,
                    dur: 500
                },
                {
                    xz: 5,
                    y: 0,
                    dur: 2500
                },
                {
                    xz: 0.5,
                    y: 0.5,
                    dur: 500
                },
                {
                    xz: 0.71,
                    y: 0,
                    dur: 500
                }
            ];

            // Create first animation
            var animations = [
                {
                    property: "position",
                    from: position,
                    to: {
                        x: position.x + actions[0].xz * direction.x,
                        y: position.y + actions[0].y,
                        z: position.z + actions[0].xz * direction.z
                    },
                    dur: actions[0].dur,
                    delay: base_delay,
                    easing: "linear"
                }
            ];
            
            // Create all other animations
            for(var i = 1; i < actions.length; i++) {
                animations.push({
                    property: "position",
                    from: {
                        x: animations[i-1].to.x,
                        y: animations[i-1].to.y,
                        z: animations[i-1].to.z
                    },
                    to: {
                        x: animations[i-1].to.x + actions[i].xz * direction.x,
                        y: animations[i-1].to.y + actions[i].y,
                        z: animations[i-1].to.z + actions[i].xz * direction.z,
                    },
                    dur: actions[i].dur,
                    delay: animations[i-1].delay + animations[i-1].dur,
                    easing: "linear"
                });
            }

            var newEnemy = document.getElementById('enemy').cloneNode(true);
            newEnemy.setAttribute('position', position);
            newEnemy.setAttribute('rotation', rotation);
            newEnemy.setAttribute('visible', true);
            newEnemy.setAttribute('enemy', true);
            for(var i = 0; i < animations.length; i++) {
                newEnemy.setAttribute('animation' + (i > 0 ? '__' + i : ''), animations[i]);
            }
            enemyElement.appendChild(newEnemy);

            enemyTTL = animations[animations.length - 1].delay + animations[animations.length - 1].dur + after_delay;

            setTimeout(() => {
                enemyElement.removeChild(newEnemy);
            }, enemyTTL);
        });
    }
});

AFRAME.registerComponent('enemy', {
    init: function() {
        var threshold = 0.5;

        var enemyElement = this.el;

        var enemyInterval = window.setInterval(() => {
            var enemyPosition = enemyElement.object3D.position;
            // console.log(enemyPosition, userPosition);

			if(Math.abs(enemyPosition.x - userPosition.x) < threshold && Math.abs(enemyPosition.z - userPosition.z) < threshold) {
                console.log("You got hit!");
                clearInterval(enemyInterval);

                socket.emit('user-hit', true);
				// skyElement.setAttribute('color', "red");
				// gameEnded = true;
				// died(); //firebase

				// var subTextElement = document.querySelector('#sub-text');
				// subTextElement.setAttribute('text', {value: "You exploded!"});
			}
		}, 100);

        setTimeout(() => {
            clearInterval(enemyInterval);
        }, enemyTTL - 300);
    }
});

// Continuously get the position of the user
AFRAME.registerComponent('camera-listener', {
    tick: function () {
      var cameraEl = this.el.sceneEl.camera.el;
      userPosition = cameraEl.getAttribute('position');
    }
  });