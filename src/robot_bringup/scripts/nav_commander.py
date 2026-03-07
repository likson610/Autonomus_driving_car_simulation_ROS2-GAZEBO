#!/usr/bin/env python3
import rclpy
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
from geometry_msgs.msg import PoseStamped

def main():
    rclpy.init()
    nav = BasicNavigator()

    # 1. Wait for Nav2 to be fully active
    # This is crucial for simulation startups
    nav.waitUntilNav2Active()

    # 2. Define a goal (X=2.0, Y=1.0)
    goal_pose = PoseStamped()
    goal_pose.header.frame_id = 'map'
    goal_pose.header.stamp = nav.get_clock().now().to_msg()
    goal_pose.pose.position.x = 2.0
    goal_pose.pose.position.y = 1.0
    goal_pose.pose.orientation.w = 1.0

    # 3. Send the robot to the goal
    print("Sending goal...")
    nav.goToPose(goal_pose)

    # 4. Feedback Loop
    while not nav.isTaskComplete():
        feedback = nav.getFeedback()
        if feedback:
            print(f'Distance remaining: {feedback.distance_remaining:.2f} m')

    # 5. Result handling
    result = nav.getResult()
    if result == TaskResult.SUCCEEDED:
        print('Success!')
    else:
        print('Navigation failed or was canceled.')

    rclpy.shutdown()

if __name__ == '__main__':
    main()