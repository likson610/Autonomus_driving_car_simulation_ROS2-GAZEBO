cmake_minimum_required(VERSION 3.8)
project(robot_bringup)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)

install(
  DIRECTORY launch config worlds maps
  DESTINATION share/${PROJECT_NAME}
)

# Install the Python scripts into the lib directory
install(PROGRAMS
  scripts/nav_commander.py
  DESTINATION lib/${PROJECT_NAME}
)


ament_package()
