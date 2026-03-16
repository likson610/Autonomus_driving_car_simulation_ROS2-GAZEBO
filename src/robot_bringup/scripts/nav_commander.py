#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import String

# Węzeł Node między UI a Nav2 
class NavBridge(Node):
    def __init__(self, nav):
        super().__init__('nav2_web_bridge')
        self.nav = nav
        self.subscription = self.create_subscription(
            PoseStamped,
            '/goal_pose',
            self.goal_callback,
            10)
        self.get_logger().info("Web Bridge Node Started. Waiting for goals from HTML...")

    def goal_callback(self, msg):
        self.get_logger().info(f"Received Web Goal: x={msg.pose.position.x}, y={msg.pose.position.y}")
        self.nav.goToPose(msg) # wysłanie celu do Nav2 

# Węzeł do publikowania statusu nawigacji, subskrybowany przez UI
class NavStatusPublisher(Node):
    def __init__(self):
        super().__init__('nav_status_publisher')
        self.publisher_ = self.create_publisher(String, 'nav_status', 10)
      

    def publish_status(self, stat):
        msg = String()
        msg.data = stat
        self.publisher_.publish(msg)


def main():
    rclpy.init()
    nav = BasicNavigator()
    nav.waitUntilNav2Active()

    bridge_node = NavBridge(nav)
    nav_status_publisher = NavStatusPublisher()

    rclpy.spin_once(nav_status_publisher, timeout_sec=0.1)
    nav_status_publisher.publish_status("Podaj cel")


    # Pętla główna, odpowiedzialna za aktualizację nawigacji i publikację statusu
    while rclpy.ok():
        rclpy.spin_once(bridge_node, timeout_sec=0.1)
        rclpy.spin_once(nav_status_publisher, timeout_sec=0.1)
        
        # publikacja statusu
        if nav.isTaskComplete():
            result = nav.getResult()
            if result == TaskResult.SUCCEEDED:
                print('Goal Reached!')
                nav_status_publisher.publish_status("Dotarto do celu. Podaj kolejny cel")
            elif result == TaskResult.CANCELED:
                print('Goal Canceled')
                nav_status_publisher.publish_status("Cel anulowany")
            elif result == TaskResult.FAILED:
                print('Goal Failed')
                nav_status_publisher.publish_status("Cel nie osiągnięty")
        elif not nav.isTaskComplete():
            nav_status_publisher.publish_status("W drodze do celu")

    rclpy.shutdown()


if __name__ == '__main__':
    main()
