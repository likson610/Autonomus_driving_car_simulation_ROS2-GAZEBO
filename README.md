# 🤖 Symulacja Robota (ROS 2 Jazzy + Gazebo Harmonic)

Projekt zawiera pliki konfiguracyjne i uruchomieniowe dla symulacji robota w środowisku ROS 2 Jazzy oraz Gazebo Harmonic.

## 📋 Wymagania

Do poprawnego działania symulacji wymagane jest następujące oprogramowanie:

* **ROS 2:** Jazzy Jalisco
* **Gazebo:** Harmonic (wersja 8.10.0)

## 📂 Struktura Katalogów

Repozytorium należy sklonować do folderu `src` w Twoim workspace. Komendy budowania i uruchamiania wywołujemy z **głównego katalogu workspace**, a nie z folderu `src`.

Prawidłowa struktura powinna wyglądać następująco:

```text
/workspace
├── src/
│   ├── robot_bringup/
│   ├── robot_description/
│   └── (inne pakiety)
├── build/
├── install/
└── log/
```
## 🚀 Instalacja i Budowanie
Przejdź do głównego katalogu swojego workspace. Następnie upewnij się, że masz załadowane globalne środowisko ROS 2 Jazzy.
Możesz to zrobić jednorazowo w terminalu:
```text
source /opt/ros/jazzy/setup.bash
```
**💡 Wskazówka: Aby nie wpisywać tej komendy za każdym razem, warto dodać ją do pliku .bashrc:**

Otwórz plik: 
```text
gedit ~/.bashrc
```
Dopisz na końcu: 
```text
source /opt/ros/jazzy/setup.bash
```
**Budowanie i uruchamianie projektu:**
```text
colcon build
source install/setup.bash
ros2 launch robot_bringup gazebo.launch.xml
```
## 🎮 Sterowanie Robotem
```text
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```
## ❗Uwagi❗:
**⚙️ Parametry Fizyczne i Uwagi Techniczne**
Masa: ok. 1200 kg

**Wymiary (zdefiniowane w Xacro):**

* **Wysokość (car_hight):** 2.85 m

* **Szerokość (car_width):** 2.56 m

* **Długość (car_length):** 6.58 m

* **Promień koła (wheel_radius):** 0.52 m

* **Szerokość koła (wheel_length):** 0.3 m

**⚠️ Ważna uwaga dotycząca sterowania**

Ze względu na dużą inercję oraz zastosowany algorytm sterowania różnicowego (DiffDrive), wymagane są duże wartości żądanych prędkości, aby zapewnić płynne sterowanie obiektem.

W razie problemów ze stabilnością lub sterownością, można dostosować parametry w plikach Xacro (zmieniając xacro:property dla wymiarów lub makra definiujące inercję i masę).

## 🛠️ Polecane Narzędzia

Do pracy z kodem projektu zaleca się używanie Visual Studio Code z zainstalowanym rozszerzeniem:

Robot Developer Extensions for ROS 2 (autor: Ranch Hand Robotics LLC) – zapewnia podpowiedzi składni i ułatwia pisanie kodu.
