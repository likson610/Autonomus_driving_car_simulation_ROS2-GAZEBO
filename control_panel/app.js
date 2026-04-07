// nasłuchiwanie i nadawanie na port na którym znajduje się ros
const ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
});

const statusLabel = document.getElementById('status');

let robotMarker = null;

// zamiana koordynatów na kwateriony przydatne do mapy
function getYaw(quat) {
    var q0 = quat.w;
    var q1 = quat.x;
    var q2 = quat.y;
    var q3 = quat.z;
    var yaw = Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3));
    return -yaw * (180 / Math.PI);
}

ros.on('connection', () => {
    statusLabel.innerText = 'POŁĄCZONO! 🎉';
    statusLabel.style.color = 'green';
});

ros.on('error', () => {
    statusLabel.innerText = 'BŁĄD POŁĄCZENIA ❌';
    statusLabel.style.color = 'red';
});

// topiki od których będziemy odbierać wiadomości bądź wysyłać do nich wiadomości
const odomTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/odom',
    messageType : 'nav_msgs/msg/Odometry'
});
const amclPoseTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/amcl_pose',
    messageType : 'geometry_msgs/msg/PoseWithCovarianceStamped'
});
const velocityReader = new ROSLIB.Topic({
    ros : ros,
    name : '/cmd_vel_smoothed',
    messageType : 'geometry_msgs/msg/Twist'
});

const navStatus = new ROSLIB.Topic({
    ros : ros,
    name : '/nav_status',
    messageType : 'std_msgs/msg/String'
});
const chatTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/web_chat',
    messageType : 'std_msgs/msg/String'
});

//testowa funkcja do wysyłania wiadomości do rosa
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const status = document.getElementById('send-status');
    
    const message = new ROSLIB.Message({
        data: input.value
    });

    chatTopic.publish(message);
    
    status.innerText = "Wysłano: " + input.value;
    input.value = ""; 
}

//nasłuchiwanie topicu amcl do wyświetlania pozycji pojazdu na licznikach i na mapie
amclPoseTopic.subscribe((message) => {
    document.getElementById('pos-x').innerText = message.pose.pose.position.x.toFixed(2);
    document.getElementById('pos-y').innerText = message.pose.pose.position.y.toFixed(2);

    if (robotMarker) {
        robotMarker.x = message.pose.pose.position.x;
        robotMarker.y = -message.pose.pose.position.y; 
    }
    
});

// odbieranie prędkości
velocityReader.subscribe((message) => {
    document.getElementById('vel-lin').innerText = message.linear.x.toFixed(4);
    document.getElementById('vel-ang').innerText = message.angular.z.toFixed(4);
});

// nav status
navStatus.subscribe((message) => {
    document.getElementById('nav-status').innerText = message.data;
});

const goalTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/goal_pose',
    messageType : 'geometry_msgs/PoseStamped'
});

// mapa z symulacji
var viewer = new ROS2D.Viewer({
    divID : 'map',
    width : 500,
    height : 500
});

var gridClient = new ROS2D.OccupancyGridClient({
    ros : ros,
    rootObject : viewer.scene,
    continuous: true 
});
robotMarker = new createjs.Shape();
robotMarker.graphics.beginFill("red").drawCircle(0, 0, 0.4);
viewer.scene.addChild(robotMarker);

gridClient.on('change', function() {
    const mapW = gridClient.currentGrid.width;
    const mapH = gridClient.currentGrid.height;

    const MAX_SIZE = 800;
    let canvasW = MAX_SIZE;
    let canvasH = MAX_SIZE;

    if (mapW > mapH) {
        canvasH = MAX_SIZE * (mapH / mapW);
    } else {
        canvasW = MAX_SIZE * (mapW / mapH);
    }

    const canvasElement = document.querySelector('#map canvas');
    if (canvasElement) {
        canvasElement.width = canvasW;
        canvasElement.height = canvasH;
    }
    viewer.width = canvasW;
    viewer.height = canvasH;

    viewer.scene.y = canvasH;

    viewer.scaleToDimensions(mapW, mapH);
    viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
    
    if (robotMarker) {
        viewer.scene.setChildIndex(robotMarker, viewer.scene.numChildren - 1);
    }
});

var mouseDown = false;
viewer.scene.addEventListener('stagemousedown', function(event) {
    mouseDown = true;
});

viewer.scene.addEventListener('stagemouseup', function(event) {
    if (mouseDown) {
        var pos = viewer.scene.globalToRos(event.stageX, event.stageY);
        sendGoalFromMap(pos.x, pos.y);
        mouseDown = false;
    }
});

function sendGoalFromMap(x, y) {
    const pose = new ROSLIB.Message({
        header: {
            frame_id: 'map',
            stamp: { secs: 0, nsecs: 0 }
        },
        pose: {
            position: { x: x, y: y, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
        }
    });
    goalTopic.publish(pose);
}

function sendGoal() {
    const x = parseFloat(document.getElementById('goal-x').value);
    const y = parseFloat(document.getElementById('goal-y').value);

    const pose = new ROSLIB.Message({
        header: {
            frame_id: 'map',
            stamp: { secs: 0, nsecs: 0 }
        },
        pose: {
            position: { x: x, y: y, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
        }
    });

    goalTopic.publish(pose);
    console.log("Goal sent to ROS: ", x, y);
}