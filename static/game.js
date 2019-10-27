AFRAME.registerComponent('generate-enemies', {
    init: function() {
        var enemyElement = this.el;

        var direction = {
            x: -1,
            y: 0,
            z: 0
        };

        var position = {
            x: 3.71,
            y: 0.5,
            z: 0
        };

        var base_delay = 15000;

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

        console.log(animations);

        var newEnemy = document.getElementById('enemy').cloneNode(true);
        newEnemy.setAttribute('position', position);
        newEnemy.setAttribute('visible', true);
        for(var i = 0; i < animations.length; i++) {
            newEnemy.setAttribute('animation' + (i > 0 ? '__' + i : ''), animations[i]);
        }
        enemyElement.appendChild(newEnemy);

        setTimeout(() => {
            enemyElement.removeChild(newEnemy);
        }, 30000);
    }
});